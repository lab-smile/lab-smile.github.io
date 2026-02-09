/**
 * Publications page - Fetch, filter, search, and paginate publications from JSON.
 */
(function () {
  const PER_PAGE = 20;
  let allPubs = [];
  let filtered = [];
  let currentPage = 1;

  async function loadPublications() {
    const container = document.getElementById('publications-list');
    const loading = document.getElementById('publications-loading');
    if (!container) return;

    try {
      const resp = await fetch('../publications.json');
      if (!resp.ok) throw new Error('Failed to load publications');
      allPubs = await resp.json();

      // Populate year dropdown
      const years = [...new Set(allPubs.map(p => p.data_year))].sort((a, b) => b - a);
      const yearSelect = document.getElementById('filter-year');
      if (yearSelect) {
        years.forEach(y => {
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          yearSelect.appendChild(opt);
        });
      }

      // Populate type dropdown
      const types = [...new Set(allPubs.map(p => p.type))].sort();
      const typeSelect = document.getElementById('filter-type');
      if (typeSelect) {
        types.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t;
          typeSelect.appendChild(opt);
        });
      }

      // Update count
      const countEl = document.getElementById('pub-count');
      if (countEl) countEl.textContent = allPubs.length;

      applyFilters();
    } catch (err) {
      console.error('Error loading publications:', err);
      if (container) container.innerHTML = '<p class="text-red-500">Failed to load publications.</p>';
    } finally {
      if (loading) loading.classList.add('hidden');
    }
  }

  function applyFilters() {
    const yearVal = document.getElementById('filter-year')?.value || '';
    const typeVal = document.getElementById('filter-type')?.value || '';
    const searchVal = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

    filtered = allPubs.filter(p => {
      if (yearVal && p.data_year !== yearVal) return false;
      if (typeVal && p.type !== typeVal) return false;
      if (searchVal) {
        const haystack = `${p.title} ${p.authors} ${p.citation} ${p.abstract || ''}`.toLowerCase();
        if (!haystack.includes(searchVal)) return false;
      }
      return true;
    });

    currentPage = 1;
    render();
  }

  function render() {
    const container = document.getElementById('publications-list');
    const paginationEl = document.getElementById('publications-pagination');
    const resultCount = document.getElementById('result-count');
    if (!container) return;

    if (resultCount) resultCount.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const start = (currentPage - 1) * PER_PAGE;
    const page = filtered.slice(start, start + PER_PAGE);

    if (page.length === 0) {
      container.innerHTML = '<p class="text-stone-500 text-center py-8">No publications found matching your criteria.</p>';
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    // Group page items by year for year headers
    let html = '';
    let lastYear = null;
    page.forEach((pub, idx) => {
      const globalIdx = start + idx;
      const badgeClass = getBadgeClass(pub.type);
      const links = renderLinks(pub.external_links);
      const hasAbstract = pub.abstract && pub.abstract.trim().length > 0;
      const year = pub.data_year || pub.publication_year;

      // Year group header
      if (year !== lastYear) {
        if (lastYear !== null) html += '</div>'; // close previous year group
        html += `<div class="mb-2"><h3 class="text-xl font-bold text-stone-900 font-serif mb-4 mt-8 flex items-center gap-3"><span class="inline-flex items-center justify-center w-16 h-8 rounded-md bg-gold/10 text-gold text-sm font-bold">${escapeHtml(year)}</span><span class="flex-1 h-px bg-stone-200"></span></h3>`;
        lastYear = year;
      }

      html += `
        <article class="card card-gold-top mb-4">
          <div class="flex flex-wrap items-start gap-3">
            <span class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${badgeClass}">${escapeHtml(pub.type)}</span>
            <span class="text-xs text-stone-400 font-mono">${escapeHtml(pub.publication_year || pub.data_year)}</span>
          </div>
          <h3 class="mt-2 font-semibold text-base text-stone-900 leading-snug">${pub.title}</h3>
          <p class="mt-1 text-sm text-stone-600">${pub.authors}</p>
          <p class="mt-1 text-sm text-stone-500 italic">${escapeHtml(pub.citation)}</p>
          ${links ? `<div class="mt-3 flex flex-wrap gap-2">${links}</div>` : ''}
          ${hasAbstract ? `
            <div class="mt-3 border-t border-stone-100 pt-3">
              <button onclick="toggleAbstract(${globalIdx})" class="text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold/5 text-gold hover:bg-gold/10 transition-colors" aria-expanded="false" aria-controls="abstract-${globalIdx}">
                <svg class="w-4 h-4 transition-transform" id="abstract-icon-${globalIdx}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                Abstract
              </button>
              <div id="abstract-${globalIdx}" class="abstract-content mt-2 text-sm text-stone-600 leading-relaxed">
                <p>${escapeHtml(pub.abstract)}</p>
              </div>
            </div>
          ` : ''}
        </article>
      `;
    });
    if (lastYear !== null) html += '</div>'; // close last year group
    container.innerHTML = html;

    // Pagination
    if (paginationEl && totalPages > 1) {
      let html = '';
      if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})" aria-label="Previous page">&laquo;</button>`;
      }
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
          html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})" aria-label="Page ${i}" ${i === currentPage ? 'aria-current="page"' : ''}>${i}</button>`;
        } else if (Math.abs(i - currentPage) === 3) {
          html += `<span class="px-2 text-gray-400">...</span>`;
        }
      }
      if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})" aria-label="Next page">&raquo;</button>`;
      }
      paginationEl.innerHTML = html;
    } else if (paginationEl) {
      paginationEl.innerHTML = '';
    }
  }

  function getBadgeClass(type) {
    switch ((type || '').toLowerCase()) {
      case 'journal': return 'badge-journal';
      case 'conference': return 'badge-conference';
      case 'preprint': return 'badge-preprint';
      case 'book': case 'book chapter': return 'badge-book';
      case 'thesis': return 'badge-thesis';
      default: return 'badge-default';
    }
  }

  function renderLinks(links) {
    if (!links || typeof links !== 'object') return '';
    return Object.entries(links).map(([key, url]) => {
      if (!url) return '';
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const icon = key === 'arxiv' ? 'arXiv' : label;
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-stone-200 text-stone-600 hover:border-gold hover:text-gold hover:bg-gold/5 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        ${icon}
      </a>`;
    }).filter(Boolean).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Global functions for onclick handlers
  window.toggleAbstract = function (idx) {
    const el = document.getElementById(`abstract-${idx}`);
    const icon = document.getElementById(`abstract-icon-${idx}`);
    if (el) {
      const expanded = el.classList.toggle('expanded');
      icon.style.transform = expanded ? 'rotate(180deg)' : '';
      el.closest('div').querySelector('button').setAttribute('aria-expanded', expanded);
    }
  };

  window.goToPage = function (page) {
    currentPage = page;
    render();
    document.getElementById('publications-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Init
  function init() {
    loadPublications();

    // Debounced search
    let searchTimeout;
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
      });
    }

    document.getElementById('filter-year')?.addEventListener('change', applyFilters);
    document.getElementById('filter-type')?.addEventListener('change', applyFilters);
    document.getElementById('clear-filters')?.addEventListener('click', () => {
      const yearSel = document.getElementById('filter-year');
      const typeSel = document.getElementById('filter-type');
      const searchInp = document.getElementById('filter-search');
      if (yearSel) yearSel.value = '';
      if (typeSel) typeSel.value = '';
      if (searchInp) searchInp.value = '';
      applyFilters();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
