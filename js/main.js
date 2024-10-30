$(document).ready(async function(){
    let loading = false;
    let publications = [];
    const fetchPublications = async () => {
        try {
            const response = await fetch('publications.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    };
    loading = true;
    publications = await fetchPublications();
    console.log(publications)
    loading = false;
    const allPubsDiv = document.getElementById('allPubs');
    const searchInput = $('#inputPubs'); // Use the existing input with id inputPubs
    const loader = $('<div>', { id: 'loader', class: 'loader' })
        .css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'border': '8px solid #f3f3f3', // Light grey
            'border-top': '8px solid #3498db', // Blue
            'border-radius': '50%',
            'width': '60px',
            'height': '60px',
            'animation': 'spin 1s linear infinite',
            'z-index': '1000', // Ensure it appears above other elements
        }); // Append loader to the body

    // Add styles to the input
    searchInput.css({
        'margin-top': '20px',
        'padding': '12px 15px',
        'border-radius': '8px',
        'border': '1px solid #ddd',
        'font-size': '16px',
        'font-family': 'Lato, sans-serif',
        'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'transition': 'border-color 0.3s, box-shadow 0.3s',
        'display': 'flex',
        'flex-direction':'column',
        'align-items': 'center', // Center vertically
        'height': '100%' // Ensure it takes full height for vertical centering
    }).focus(function() {
        $(this).css({
            'border-color': '#03cc85',
            'box-shadow': '0 0 5px rgba(3, 204, 133, 0.5)',
        });
    }).blur(function() {
        $(this).css({
            'border-color': '#ddd',
            'box-shadow': 'none',
        });
    });

    searchInput.on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        $('.item').each(function() {
            const title = $(this).find('.pubtitle').text().toLowerCase();
            const authors = $(this).find('.pubauthor').text().toLowerCase();
            const year = $(this).data('year').toString(); // Get the year from data attribute
            const pubType = $(this).attr('class').match(/mix\s+(.+)/)[1].toLowerCase(); // Get the publication type
            $(this).toggle(title.includes(searchTerm) || authors.includes(searchTerm) || year.includes(searchTerm) || pubType.includes(searchTerm));
        });
    });

    // Create dropdown for publication types dynamically
    const pubTypes = [...new Set(publications.map(pub => pub.type))]; // Get unique publication types
    const dropdown = $('<select>', { id: 'cd-dropdown', name: 'cd-dropdown', class: 'cd-select cd-dropdown' })
        .css({
            'padding': '12px 15px',
            'border-radius': '8px',
            'border': '1px solid #ddd',
            'background-color': '#ffffff',
            'font-size': '16px',
            'color': '#333',
            'cursor': 'pointer',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
            'transition': 'background-color 0.3s, box-shadow 0.3s',
        })
        .on('focus', function() {
            $(this).css({
                'background-color': '#e0f7fa',
                'box-shadow': '0 0 5px rgba(3, 204, 133, 0.5)',
            });
        }).on('blur', function() {
            $(this).css({
                'background-color': '#ffffff',
                'box-shadow': 'none',
            });
        })
        .append($('<option>', { class: 'filter', value: 'all', selected: true }).text('All types (' + publications.length + ')'));

    pubTypes.forEach(type => {
        const count = publications.filter(pub => pub.type === type).length; // Count publications of this type
        dropdown.append($('<option>', { class: 'filter', value: type }).text(type + ' (' + count + ')'));
    });

    dropdown.on('change', function() {
        const selectedType = $(this).val();
        $('.item').each(function() {
            const pubType = $(this).attr('class').match(/mix\s+(.+)/)[1]; // Use regex to extract the publication type, allowing for multiple words
            $(this).toggle(selectedType === 'all' || pubType.trim() === selectedType); // Show items of the selected type or all
        });
    });

    $('#dropDownPubs').html(dropdown); // Add dropdown to the existing element with id dropDownPubs

    const newPubDivs = publications.map(pub => {
        const pubType = pub.type || 'Unknown';
        var $item = $('<div>', { class: 'item mix ' + pubType, 'data-year': pub.data_year });
        var $pubmain = $('<div>', { class: 'pubmain' });
        var $pubassets = $('<div>', { class: 'pubassets' });
        $pubassets.append($('<a>', { href: '#', class: 'pubcollapse' }).append($('<i>', { class: 'fa fa-expand' })));

        if (pub.external_links) {
            if (pub.external_links.sciencedirect) {
                $pubassets.append($('<a>', { href: pub.external_links.sciencedirect, class: 'tooltips', title: 'External link', target: '_blank' }).append($('<i>', { class: 'fa fa-external-link' })));
            }
            if (pub.external_links.github) {
                $pubassets.append($('<a>', { href: pub.external_links.github, class: 'tooltips', title: 'GitHub', target: '_blank' }).append($('<i>', { class: 'fa fa-github' })));
            }
            if (pub.external_links.arxiv) {
                $pubassets.append($('<a>', { href: pub.external_links.arxiv, class: 'tooltips', title: 'arXiv', target: '_blank' }).append($('<i>', { class: 'fa fa-book' })));
            }
        }

        var $pubthumbnail = $('<div>', { class: 'pubthumbnail' }).append($('<img>', { width: 125, src: pub.image_src, class: 'attachment-medium size-medium wp-post image', alt: '', align: 'left', hspace: 20 }));
        var $pubcontent = $('<div>', { class: 'pubcontent' })
            .append($('<h4>', { class: 'pubtitle' }).text(pub.title))
            .append($('<span>', { class: 'label label-' + pub.label_class }).text(pubType))
            .append($('<div>', { class: 'pubauthor' }).html(pub.authors))
            .append($('<div>', { class: 'pubcite' }).text(pub.citation))
            .append($('<div>', { class: 'pubdate' }).text('Publication Year: ' + (pub.data_year || 'N/A')));

        $pubmain.append($pubassets, $pubthumbnail, $pubcontent, $('<div>', { class: 'clearfix' }));

        if (pub.abstract) {
            var $pubdetails = $('<div>', { class: 'pubdetails' })
                .append($('<h4>').text('Abstract'))
                .append($('<p>').text(pub.abstract));
            $item.append($pubmain, $pubdetails);
        } else {
            $item.append($pubmain);
        }

        return $item.prop('outerHTML');
    }).join('\n');

    allPubsDiv.innerHTML = loading ? loader : newPubDivs;

    // Sorting functionality
    $('.sort').on('click', function() {
        const order = $(this).data('order');
        const sortedPublications = publications.sort((a, b) => {
            return order === 'asc' ? a.data_year - b.data_year : b.data_year - a.data_year;
        });

        const sortedPubDivs = sortedPublications.map(pub => {
            const pubType = pub.type || 'Unknown';
            var $item = $('<div>', { class: 'item mix ' + pubType, 'data-year': pub.data_year });
            var $pubmain = $('<div>', { class: 'pubmain' });
            var $pubassets = $('<div>', { class: 'pubassets' });
            $pubassets.append($('<a>', { href: '#', class: 'pubcollapse' }).append($('<i>', { class: 'fa fa-expand' })));

            if (pub.external_links) {
                if (pub.external_links.sciencedirect) {
                    $pubassets.append($('<a>', { href: pub.external_links.sciencedirect, class: 'tooltips', title: 'External link', target: '_blank' }).append($('<i>', { class: 'fa fa-external-link' })));
                }
                if (pub.external_links.github) {
                    $pubassets.append($('<a>', { href: pub.external_links.github, class: 'tooltips', title: 'GitHub', target: '_blank' }).append($('<i>', { class: 'fa fa-github' })));
                }
                if (pub.external_links.arxiv) {
                    $pubassets.append($('<a>', { href: pub.external_links.arxiv, class: 'tooltips', title: 'arXiv', target: '_blank' }).append($('<i>', { class: 'fa fa-book' })));
                }
            }

            var $pubthumbnail = $('<div>', { class: 'pubthumbnail' }).append($('<img>', { width: 125, src: pub.image_src, class: 'attachment-medium size-medium wp-post image', alt: '', align: 'left', hspace: 20 }));
            var $pubcontent = $('<div>', { class: 'pubcontent' })
                .append($('<h4>', { class: 'pubtitle' }).text(pub.title))
                .append($('<span>', { class: 'label label-' + pub.label_class }).text(pubType))
                .append($('<div>', { class: 'pubauthor' }).html(pub.authors))
                .append($('<div>', { class: 'pubcite' }).text(pub.citation))
                .append($('<div>', { class: 'pubdate' }).text('Publication Year: ' + (pub.data_year || 'N/A')));

            $pubmain.append($pubassets, $pubthumbnail, $pubcontent, $('<div>', { class: 'clearfix' }));

            if (pub.abstract) {
                var $pubdetails = $('<div>', { class: 'pubdetails' })
                    .append($('<h4>').text('Abstract'))
                    .append($('<p>').text(pub.abstract));
                $item.append($pubmain, $pubdetails);
            } else {
                $item.append($pubmain);
            }

            return $item.prop('outerHTML');
        }).join('\n');
        allPubsDiv.innerHTML = sortedPubDivs;

        // Reapply filtering after sorting
        searchInput.trigger('keyup');
    });

    // Reapply filtering after new publications are added
    searchInput.trigger('keyup');
}); // end of document ready
