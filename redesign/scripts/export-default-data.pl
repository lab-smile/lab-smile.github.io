#!/usr/bin/env perl
#
# OBSOLETE - DO NOT RUN.
#
# This scraped news/grants/projects/gallery/patents out of the default site's
# index.html back when that HTML was the source of truth. The direction is now
# reversed: data/*.json at the repo root is the source, and index.html renders
# from it via js/content.js. There is no longer any static markup here to parse,
# and running this would overwrite the canonical data with empty records.
#
# Kept only as provenance for how the JSON was originally derived.
#
use strict;
use warnings;
use utf8;

use Encode qw(decode);
use File::Basename qw(dirname);
use File::Path qw(make_path);
use File::Spec;
use HTML::Entities qw(encode_entities);
use HTML::TreeBuilder;
use JSON::PP;

my $script_dir = dirname(File::Spec->rel2abs(__FILE__));
my $redesign_dir = dirname($script_dir);
my $repo_dir = dirname($redesign_dir);
my $data_dir = File::Spec->catdir($redesign_dir, 'data');

make_path($data_dir);

sub read_utf8 {
    my ($file) = @_;
    open my $fh, '<:raw', $file or die "Cannot read $file: $!\n";
    local $/;
    return decode('UTF-8', <$fh>);
}

sub write_json {
    my ($name, $records) = @_;
    my $file = File::Spec->catfile($data_dir, $name);
    open my $fh, '>:raw', $file or die "Cannot write $file: $!\n";
    print {$fh} JSON::PP->new->utf8->canonical->pretty->encode($records);
    close $fh or die "Cannot close $file: $!\n";
}

sub class_contains {
    my ($element, $class_name) = @_;
    return 0 unless ref $element;
    my $classes = $element->attr('class') || '';
    return $classes =~ /(?:^|\s)\Q$class_name\E(?:\s|$)/;
}

sub ancestor_with_class {
    my ($element, $class_name) = @_;
    while ($element) {
        return $element if class_contains($element, $class_name);
        $element = $element->parent;
    }
    return;
}

sub find_heading {
    my ($tree, $text) = @_;
    for my $heading ($tree->look_down(_tag => qr/^h[1-6]$/)) {
        my $heading_text = $heading->as_text;
        $heading_text =~ s/^\s+|\s+$//g;
        return $heading if $heading_text eq $text;
    }
    die "Heading '$text' was not found\n";
}

sub direct_children {
    my ($element, $tag) = @_;
    return grep { ref($_) && $_->tag eq $tag } $element->content_list;
}

sub inner_html {
    my ($element) = @_;
    return join '', map {
        ref($_) ? $_->as_HTML('<>&"', '', {}) : encode_entities($_, '<>&')
    } $element->content_list;
}

sub clean_html {
    my ($html) = @_;
    $html =~ s/^\s+|\s+$//g;
    $html =~ s/[ \t]+\n/\n/g;
    return $html;
}

sub link_label {
    my ($label, $url) = @_;
    $label = clean_html($label || '');
    if (!$label || $label =~ /^(?:link|external link|project link)$/i) {
        return 'NIH RePORTER' if $url =~ m{reporter\.nih\.gov}i;
        return 'NSF Award' if $url =~ m{nsf\.gov}i;
        return 'Patent record' if $url =~ m{patents?\.google\.com|google\.com/patents}i;
        return 'Project page';
    }
    return $label;
}

sub extract_links {
    my ($element) = @_;
    my @links;
    my %by_url;

    for my $anchor ($element->look_down(_tag => 'a')) {
        my $url = $anchor->attr('href') || '';
        $url =~ s/^\s+|\s+$//g;
        $url =~ s/["']+$//;
        next unless length $url;

        my $label = $anchor->as_text || $anchor->attr('title') || '';
        $label = link_label($label, $url);

        if (exists $by_url{$url}) {
            my $existing = $links[$by_url{$url}];
            $existing->{label} = $label
                if $existing->{label} =~ /^(?:Project page|External link)$/i
                && $label !~ /^(?:Project page|External link)$/i;
            next;
        }

        $by_url{$url} = scalar @links;
        push @links, {
            label => $label,
            url => $url,
        };
    }
    return \@links;
}

my $tree = HTML::TreeBuilder->new;
$tree->ignore_unknown(0);
$tree->parse_content(read_utf8(File::Spec->catfile($repo_dir, 'index.html')));
$tree->eof;

my $news_heading = find_heading($tree, 'News');
my $news_section = ancestor_with_class($news_heading, 'section');
my $news_list = $news_section->look_down(_tag => 'ul');
my @news;
for my $item (direct_children($news_list, 'li')) {
    my $content_html = clean_html(inner_html($item));
    my $date = '';
    if ($content_html =~ s/^\s*([^:<]{1,30})\s*:\s*//) {
        $date = $1;
        $date =~ s/^\s+|\s+$//g;
    } else {
        die "News item does not start with a date: " . $item->as_text . "\n";
    }
    push @news, {
        date => $date,
        content_html => clean_html($content_html),
    };
}

my $grants_heading = find_heading($tree, 'Grants & Awards');
my $grants_section = ancestor_with_class($grants_heading, 'section');
my $grants_list = $grants_section->look_down(
    sub { $_[0]->tag eq 'ul' && class_contains($_[0], 'timeline') }
);
my @grants;
for my $item (direct_children($grants_list, 'li')) {
    my $item_text = $item->as_text;
    $item_text =~ s/\s+//g;
    next unless length $item_text;

    my $date = $item->look_down(sub { class_contains($_[0], 'date') });
    my $subject = $item->look_down(sub { class_contains($_[0], 'subject') });
    my $data = $item->look_down(sub { class_contains($_[0], 'data') });
    die "Incomplete grant record: " . clean_html($item->as_text) . "\n"
        unless $date && $subject && $data;

    my $details_html = join '', map {
        (ref($_) && $_ == $subject)
            ? ()
            : (ref($_) ? $_->as_HTML('<>&"', '', {}) : encode_entities($_, '<>&'))
    } $data->content_list;
    push @grants, {
        year => clean_html($date->as_text),
        title_html => clean_html(inner_html($subject)),
        details_html => clean_html($details_html),
        links => extract_links($item),
    };
}

my $research_page = $tree->look_down(id => 'research')
    or die "Research page was not found\n";
my $projects_list = $research_page->look_down(
    sub { $_[0]->tag eq 'ul' && class_contains($_[0], 'ul-withdetails') }
) or die "Funded projects list was not found\n";
my @projects;
for my $item (direct_children($projects_list, 'li')) {
    my $item_text = $item->as_text;
    $item_text =~ s/\s+//g;
    next unless length $item_text;

    my $meta = $item->look_down(sub { class_contains($_[0], 'meta') });
    my $title = $meta && $meta->look_down(_tag => 'h3');
    my $image = $item->look_down(_tag => 'img');
    my $details = $item->look_down(sub { class_contains($_[0], 'details') });
    die "Incomplete funded project record: " . clean_html($item->as_text) . "\n"
        unless $title;

    push @projects, {
        title_html => clean_html(inner_html($title)),
        image => $image ? ($image->attr('src') || '') : '',
        image_alt => $image ? ($image->attr('alt') || '') : '',
        details_html => $details ? clean_html(inner_html($details)) : '',
        links => extract_links($item),
    };
}

my $gallery_page = $tree->look_down(id => 'gallery')
    or die "Gallery page was not found\n";
my $gallery_list = $gallery_page->look_down(id => 'grid')
    or die "Gallery list was not found\n";
my @gallery;
for my $item (direct_children($gallery_list, 'li')) {
    my $image = $item->look_down(_tag => 'img');
    my $link = $item->look_down(_tag => 'a');
    my $caption = $item->look_down(_tag => 'h3');
    die "Incomplete gallery record\n" unless $image && $link && $caption;

    push @gallery, {
        image => $image->attr('src') || '',
        full_image => $link->attr('href') || $image->attr('src') || '',
        alt => $image->attr('alt') || '',
        caption_html => clean_html(inner_html($caption)),
    };
}

$tree->delete;

my $publications = JSON::PP->new->utf8->decode(
    do {
        open my $fh, '<:raw', File::Spec->catfile($repo_dir, 'publications.json')
            or die "Cannot read publications.json: $!\n";
        local $/;
        <$fh>;
    }
);
my @patents = grep { ($_->{type} || '') eq 'Patents' } @$publications;
for my $patent (@patents) {
    my @links;
    if (ref($patent->{external_links}) eq 'HASH') {
        for my $key (sort keys %{$patent->{external_links}}) {
            my $url = $patent->{external_links}{$key} || '';
            next unless length $url;
            push @links, {
                label => link_label($key, $url),
                url => $url,
            };
        }
    }
    $patent->{links} = \@links;
}

write_json('news.json', \@news);
write_json('grants.json', \@grants);
write_json('projects.json', \@projects);
write_json('gallery.json', \@gallery);
write_json('patents.json', \@patents);

print "Exported " . scalar(@news) . " news, "
    . scalar(@grants) . " grants, "
    . scalar(@projects) . " funded projects, "
    . scalar(@gallery) . " gallery records, and "
    . scalar(@patents) . " patents.\n";
