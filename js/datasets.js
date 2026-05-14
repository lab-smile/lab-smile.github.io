document.addEventListener('DOMContentLoaded', async () => {
    let allDatasets = [];
    let allPublications = [];

    try {
        [allDatasets, allPublications] = await Promise.all([
            fetch('datasets.json').then(r => r.json()),
            fetch('publications.json').then(r => r.json())
        ]);
    } catch (err) {
        console.error('datasets.js: failed to load data', err);
        return;
    }

    // Pre-compute pub matches and attach count for sorting
    const datasetsWithPubs = allDatasets.map(ds => ({
        ...ds,
        matchedPubs: matchPublications(ds, allPublications)
    }));

    // Sort descending by publication count
    datasetsWithPubs.sort((a, b) => b.matchedPubs.length - a.matchedPubs.length);

    renderDatasets(datasetsWithPubs);
    setupFilters(datasetsWithPubs);
    setupDatasetCollapse();
});

// ── Matching ─────────────────────────────────────────────────────────────────

function matchPublications(dataset, publications) {
    return publications.filter(pub => (pub.dataset_ids || []).includes(dataset.id));
}

// ── Rendering ─────────────────────────────────────────────────────────────────

const CHIP_COLORS = ['chip-blue', 'chip-green', 'chip-orange', 'chip-purple', 'chip-red', 'chip-teal'];

function createChips(items, offset) {
    return items.map((item, i) =>
        `<span class="chip ${CHIP_COLORS[(offset + i) % CHIP_COLORS.length]}">${item}</span>`
    ).join('');
}

function pubExternalLinks(pub) {
    if (!pub.external_links) return '';
    const map = {
        sciencedirect: ['fa-external-link', 'ScienceDirect'],
        arxiv:         ['fa-book',          'arXiv'],
        biorxiv:       ['fa-external-link', 'bioRxiv'],
        github:        ['fa-github',        'GitHub'],
    };
    return Object.entries(pub.external_links)
        .filter(([, url]) => url)
        .map(([key, url]) => {
            const [icon, label] = map[key] || ['fa-external-link', key];
            return `<a href="${url}" target="_blank" rel="noopener noreferrer"
                style="margin-left:6px;font-size:13px;color:#9b9b9b;"
                title="${label}" onclick="event.stopPropagation()">
                <i class="fa ${icon}"></i>
            </a>`;
        }).join('');
}

function createPubListItem(pub) {
    return `<li style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #eee;">
        <span style="font-size:14px;font-weight:600;">${pub.title}</span>
        <span class="label label-${pub.label_class}" style="margin-left:6px;font-size:11px;">${pub.type}</span>
        ${pubExternalLinks(pub)}
        <div style="font-size:12px;color:#777;margin-top:4px;">${pub.authors}</div>
        <div style="font-size:12px;color:#999;margin-top:2px;">${pub.citation} &mdash; ${pub.publication_year || ''}</div>
    </li>`;
}

function createDatasetHTML(ds) {
    const modalityChips = createChips(ds.modality, 0);
    const diseaseChips  = createChips(ds.disease_focus, ds.modality.length);
    const pubCount = ds.matchedPubs.length;
    const pubList = pubCount > 0
        ? ds.matchedPubs.map(createPubListItem).join('')
        : '<li style="color:#999;font-size:13px;">No lab publications recorded for this dataset yet.</li>';

    return `<div class="item dataset-card"
            id="dataset-${ds.id}"
            data-modality="${ds.modality.join('|')}"
            data-disease="${ds.disease_focus.join('|')}"
            style="margin-bottom:20px;width:100%;">
        <div class="pubmain" style="position:relative;cursor:pointer;" title="Click to expand publications">
            <div class="pubassets">
                <a href="#" class="pubcollapse tooltips" title="Show Publications (${pubCount})">
                    <i class="fa fa-expand"></i>
                </a>
                <a href="${ds.access_url}" class="tooltips" title="Dataset Website" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                    <i class="fa fa-external-link"></i>
                </a>
            </div>
            <div class="pubcontent" style="margin-left:0;">
                <h4 class="pubtitle">
                    ${ds.name}
                    <span class="label label-${ds.label_class}" style="margin-left:8px;font-size:12px;vertical-align:middle;">${ds.short_name}</span>
                    <span style="font-size:13px;color:#999;font-weight:400;margin-left:10px;vertical-align:middle;">${pubCount} lab publication${pubCount !== 1 ? 's' : ''}</span>
                </h4>
                <div class="pubcite" style="margin-bottom:10px;">${ds.description}</div>
                <div class="dataset-chips">
                    ${modalityChips}
                    ${diseaseChips}
                </div>
            </div>
        </div>
        <div class="pubdetails">
            <h4 style="margin-top:0;">Lab Publications Using This Dataset (${pubCount})</h4>
            <ul style="list-style:none;padding:0;margin:0;">
                ${pubList}
            </ul>
        </div>
    </div>`;
}

function renderDatasets(datasets) {
    const container = document.getElementById('allDatasets');
    if (!container) return;
    container.innerHTML = datasets.map(createDatasetHTML).join('');
}

// ── Filters ───────────────────────────────────────────────────────────────────

const dropdownStyle = {
    padding: '12px 15px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ffffff',
    fontSize: '16px',
    color: '#333',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    width: '100%',
    marginTop: '20px',
};

function buildDropdown(id, placeholder, values) {
    const sel = document.createElement('select');
    sel.id = id;
    sel.setAttribute('aria-label', placeholder);
    Object.assign(sel.style, dropdownStyle);

    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = placeholder + ' (all)';
    sel.appendChild(all);

    [...new Set(values)].sort().forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
    });

    sel.addEventListener('focus',  () => { sel.style.boxShadow = '0 0 5px rgba(3,204,133,0.5)'; sel.style.backgroundColor = '#e0f7fa'; });
    sel.addEventListener('blur',   () => { sel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';  sel.style.backgroundColor = '#ffffff'; });
    sel.addEventListener('change', applyFilters);
    return sel;
}

function setupFilters(datasets) {
    const allModalities = datasets.flatMap(ds => ds.modality);

    document.getElementById('dropDownModality')?.appendChild(
        buildDropdown('filterModality', 'Modality', allModalities)
    );

    // Style search input to match
    const input = document.getElementById('inputDatasets');
    if (input) {
        Object.assign(input.style, {
            marginTop: '20px',
            padding: '12px 15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        });
        input.addEventListener('focus', () => { input.style.borderColor = '#03cc85'; input.style.boxShadow = '0 0 5px rgba(3,204,133,0.5)'; });
        input.addEventListener('blur',  () => { input.style.borderColor = '#ddd';    input.style.boxShadow = 'none'; });
        input.addEventListener('keyup', applyFilters);
    }
}

function applyFilters() {
    const query    = (document.getElementById('inputDatasets')?.value || '').toLowerCase().trim();
    const modality = document.getElementById('filterModality')?.value || 'all';

    document.querySelectorAll('#allDatasets .dataset-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        const cardModalities = card.dataset.modality || '';

        const matchText     = !query    || text.includes(query);
        const matchModality = modality === 'all' || cardModalities.includes(modality);

        card.style.display = (matchText && matchModality) ? '' : 'none';
    });
}

// ── Collapse ──────────────────────────────────────────────────────────────────

function toggleCard(card) {
    const details = card.querySelector('.pubdetails');
    const icon    = card.querySelector('.pubcollapse i');
    if (!details) return;
    const isOpen = details.style.display === 'block';
    details.style.display = isOpen ? 'none' : 'block';
    icon?.classList.toggle('fa-expand',   isOpen);
    icon?.classList.toggle('fa-compress', !isOpen);
}

function setupDatasetCollapse() {
    document.getElementById('allDatasets')?.addEventListener('click', e => {
        if (e.target.closest('a:not(.pubcollapse)')) return;
        const pubmain = e.target.closest('.pubmain');
        if (!pubmain) return;
        e.preventDefault();
        const card = pubmain.closest('.dataset-card');
        if (card) toggleCard(card);
    });
}
