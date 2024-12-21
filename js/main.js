$(document).ready(async function() {
    const allPubsDiv = document.getElementById('allPubs');
    const searchInput = $('#inputPubs');

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
        'flex-direction': 'column',
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

    const fetchPublications = async () => {
        try {
            const response = await fetch('publications.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch operation failed:', error);
            return [];
        }
    };

    let publications = await fetchPublications();
    if (publications.length === 0) return; // Stop if fetch failed

    // Setup UI components after fetching publications
    setupDropdown(publications);
    renderPublications(publications, allPubsDiv);
    setupSearch(searchInput, publications);
    setupSorting(publications, allPubsDiv, searchInput);
});

function setupDropdown(publications) {
    const pubTypes = [...new Set(publications.map(pub => pub.type))];
    const dropdown = $('<select>', { id: 'cd-dropdown', class: 'cd-select cd-dropdown' })
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
        });

    dropdown.append($('<option>', { class: 'filter', value: 'all', selected: true }).text('All types (' + publications.length + ')'));

    pubTypes.forEach(type => {
        const count = publications.filter(pub => pub.type === type).length;
        dropdown.append($('<option>', { class: 'filter', value: type }).text(type + ' (' + count + ')'));
    });

    dropdown.on('change', function() {
        filterPublicationsByType($(this).val());
    });

    $('#dropDownPubs').html(dropdown);
}

function renderPublications(publications, allPubsDiv) {
    const newPubDivs = publications.map(pub => createPublicationHTML(pub)).join('\n');
    allPubsDiv.innerHTML = newPubDivs;
}

function createPublicationHTML(pub) {
    return `<div class="item mix ${pub.type}" data-year="${pub.data_year}">
                <div class="pubmain">
                    <div class="pubassets">${pubAssets(pub)}</div>
                    <div class="pubthumbnail"><img src="${pub.image_src}" alt="" style="max-width: 125px; max-height:125px;"></div>
                    <div class="pubcontent">
                        <h4 class="pubtitle">${pub.title}</h4>
                        <span class="label label-${pub.label_class}">${pub.type}</span>
                        <div class="pubauthor">${pub.authors}</div>
                        <div class="pubcite">${pub.citation}</div>
                        <div class="pubdate">Publication Year: ${pub.publication_year || 'N/A'}</div>
                    </div>
                </div>
                ${pub.abstract ? `<div class="pubdetails"><h4>Abstract</h4><p>${pub.abstract}</p></div>` : ''}
            </div>`;
}

function pubAssets(pub) {
    let assets = '';
    if (pub.external_links) {
        if (pub.external_links.sciencedirect) {
            assets += `<a href="${pub.external_links.sciencedirect}" class="tooltips" target="_blank"><i class="fa fa-external-link"></i></a>`;
        }
        if (pub.external_links.github) {
            assets += `<a href="${pub.external_links.github}" class="tooltips" target="_blank"><i class="fa fa-github"></i></a>`;
        }
        if (pub.external_links.arxiv) {
            assets += `<a href="${pub.external_links.arxiv}" class="tooltips" target="_blank"><i class="fa fa-book"></i></a>`;
        }
    }
    return assets;
}

function filterPublicationsByType(selectedType) {
    $('.item').each(function() {
        const pubType = $(this).attr('class').match(/mix\s+(.+)/)[1];
        $(this).toggle(selectedType === 'all' || pubType.trim() === selectedType);
    });
}

function setupSearch(searchInput, publications) {
    searchInput.on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        $('.item').each(function() {
            const title = $(this).find('.pubtitle').text().toLowerCase();
            const authors = $(this).find('.pubauthor').text().toLowerCase();
            const year = $(this).data('year').toString();
            $(this).toggle(title.includes(searchTerm) || authors.includes(searchTerm) || year.includes(searchTerm));
        });
    });
}

function setupSorting(publications, allPubsDiv, searchInput) {
    $('.sort').on('click', function() {
        const order = $(this).data('order');
        publications.sort((a, b) => (order === 'asc' ? a.data_year - b.data_year : b.data_year - a.data_year));
        renderPublications(publications, allPubsDiv);
        searchInput.trigger('keyup'); // Reapply filtering after sorting
    });
}
