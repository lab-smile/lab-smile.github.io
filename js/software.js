$(document).ready(async function() {
    const allSoftDivs = document.getElementById('allsoftware');

    const fetchSoftwares = async () => {
        try {
            const response = await fetch('softwares.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch operation failed:', error);
            return [];
        }
    };

    let softwares = await fetchSoftwares();
    if (softwares.length === 0) return; // Stop if fetch failed

    // Setup UI components after fetching publications
    setupSoftDropdown(softwares);
    renderSoftwares(softwares, allSoftDivs);
});

function setupSoftDropdown(softwares) {
    const softTypes = [...new Set(softwares.map(soft => soft.type))];
    const dropdown = $('<select>', { id: 'cd-dropdown-1', class: 'cd-select cd-dropdown' })
        .css({
            'padding': '12px 15px',
            'width':"100%",
            'border-radius': '8px',
            'border': 'none',
            'background-color': '#ffffff',
            'font-size': '16px',
            'color': '#333',
            'cursor': 'pointer',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
            'transition': 'background-color 0.3s, box-shadow 0.3s',
        })
        .on('focus', function() {
            $(this).css({
                'background-color': '#e0f7fa',
                'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)', 
            });
        }).on('blur', function() {
            $(this).css({
                'background-color': '#ffffff',
                'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
            });
        });

    dropdown.append($('<option>', { class: 'filter', value: 'all', selected: true }).text('All types (' + softwares.length + ')'));

    softTypes.forEach(type => {
        const count = softwares.filter(soft => soft.type === type).length;
        dropdown.append($('<option>', { class: 'filter', value: type }).text(type + ' (' + count + ')'));
    });

    dropdown.on('change', function() {
        filterSoftwaresByType($(this).val());
    });

    $('#softwareDropdown').html(dropdown);
}

function renderSoftwares(softwares, allSoftDivs) {
    const newsoftdivs = softwares.map(soft => createSoftwareHTML(soft)).join('\n');
    allSoftDivs.innerHTML = newsoftdivs;
}

function createSoftwareHTML(pub) {
    return `<div class="item mix ${pub.type}" data-year="${pub.year}">
            <div class="pubmain">
                <div class="pubassets">
                    <a href="#" class="pubcollapse"><i class="fa fa-expand"></i></a>
                    ${pub.links.map(link => `
                        <a href="${link.url}" class="tooltips" title="${link.type}" target="_blank">
                            <i class="${link.type === 'github' ? 'fa fa-github' : 'icon-codeocean'}"></i>
                        </a>
                    `).join('')}
                </div>
                <h4 class="pubtitle">${pub.title}</h4>
                <div class="pubcite">
                    <span class="label label-primary">${pub.type}</span>${pub.description}
                </div>
            </div>
            <div class="pubdetails">
                <h4>Citation</h4>
                <p>${pub.citation || ''}</p>
            </div>
        </div>`;
}


function filterSoftwaresByType(selectedType) {
    $('.item').each(function() {
        const softType = $(this).attr('class').match(/mix\s+(.+)/)[1];
        $(this).toggle(selectedType === 'all' || softType.trim() === selectedType);
    });
}




