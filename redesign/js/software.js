/**
 * Software page - Fetch, filter, and render software cards from JSON.
 */
(function () {
  let allSoftware = [];
  let filtered = [];

  async function loadSoftware() {
    const container = document.getElementById('software-list');
    const loading = document.getElementById('software-loading');
    if (!container) return;

    try {
      const resp = await fetch('../softwares.json');
      if (!resp.ok) throw new Error('Failed to load software data');
      allSoftware = await resp.json();

      // Populate type dropdown
      const types = [...new Set(allSoftware.map(s => s.type))].sort();
      const typeSelect = document.getElementById('filter-type');
      if (typeSelect) {
        types.forEach(t => {
          const count = allSoftware.filter(s => s.type === t).length;
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t + ' (' + count + ')';
          typeSelect.appendChild(opt);
        });
      }

      // Update total count
      const countEl = document.getElementById('software-count');
      if (countEl) countEl.textContent = allSoftware.length;

      applyFilters();
    } catch (err) {
      console.error('Error loading software:', err);
      if (container) {
        container.innerHTML = '<p class="text-red-500 text-center py-8" role="alert">Failed to load software data. Please try again later.</p>';
      }
    } finally {
      if (loading) loading.classList.add('hidden');
    }
  }

  function applyFilters() {
    const typeVal = document.getElementById('filter-type')?.value || '';

    filtered = allSoftware.filter(s => {
      if (typeVal && s.type !== typeVal) return false;
      return true;
    });

    render();
  }

  function render() {
    const container = document.getElementById('software-list');
    const resultCount = document.getElementById('result-count');
    if (!container) return;

    if (resultCount) {
      resultCount.textContent = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '');
    }

    if (filtered.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">No software found matching your criteria.</p>';
      return;
    }

    // Group by year — each year is a full-width row with cards in a horizontal grid
    var grouped = {};
    var yearOrder = [];
    filtered.forEach(function (soft) {
      var year = soft.year || '';
      if (!grouped[year]) {
        grouped[year] = [];
        yearOrder.push(year);
      }
      grouped[year].push(soft);
    });

    var html = '';
    yearOrder.forEach(function (year) {
      var items = grouped[year];
      html += '<div class="mb-8">' +
        '<h3 class="text-xl font-bold text-stone-900 font-serif mb-4 mt-6 flex items-center gap-3">' +
          '<span class="inline-flex items-center justify-center w-16 h-8 rounded-md bg-gold/10 text-gold text-sm font-bold">' + escapeHtml(year) + '</span>' +
          '<span class="flex-1 h-px bg-stone-200"></span>' +
        '</h3>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">';
      items.forEach(function (soft) {
        html += createSoftwareCard(soft);
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  function createSoftwareCard(soft) {
    var badgeClass = getBadgeClass(soft.type);
    var linksHtml = renderLinks(soft.links);
    var citationHtml = '';
    var hasCitation = soft.citation && soft.citation.trim().length > 0;

    if (hasCitation) {
      var cardId = 'citation-' + slugify(soft.title);
      var iconId = 'citation-icon-' + slugify(soft.title);
      citationHtml =
        '<div class="mt-3 border-t border-stone-100 pt-3">' +
          '<button onclick="toggleCitation(\'' + cardId + '\', \'' + iconId + '\')" ' +
            'class="text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold/5 text-gold hover:bg-gold/10 transition-colors" ' +
            'aria-expanded="false" aria-controls="' + cardId + '">' +
            '<svg class="w-4 h-4 transition-transform" id="' + iconId + '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>' +
            '</svg>' +
            'Citation' +
          '</button>' +
          '<div id="' + cardId + '" class="abstract-content mt-2 text-sm text-stone-600 leading-relaxed">' +
            '<p>' + escapeHtml(soft.citation) + '</p>' +
          '</div>' +
        '</div>';
    }

    return (
      '<article class="card card-gold-top">' +
          '<div class="flex flex-wrap items-start gap-3">' +
            '<span class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ' + badgeClass + '">' + escapeHtml(soft.type) + '</span>' +
            '<span class="text-xs text-stone-400 font-mono">' + escapeHtml(soft.year) + '</span>' +
          '</div>' +
          '<h3 class="mt-2 font-semibold text-base text-stone-900 leading-snug">' + escapeHtml(soft.title) + '</h3>' +
          '<p class="mt-2 text-sm text-stone-600 leading-relaxed">' + escapeHtml(soft.description) + '</p>' +
          (linksHtml ? '<div class="mt-4 flex flex-wrap gap-2">' + linksHtml + '</div>' : '') +
          citationHtml +
      '</article>'
    );
  }

  function getBadgeClass(type) {
    switch ((type || '').toLowerCase()) {
      case 'code': return 'bg-blue-500 text-white';
      case 'data': return 'bg-amber-500 text-white';
      case 'dataset': return 'bg-amber-500 text-white';
      case 'tool': return 'bg-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  function renderLinks(links) {
    if (!links || !Array.isArray(links) || links.length === 0) return '';

    return links.map(function (link) {
      if (!link.url) return '';

      var icon = '';
      var label = '';

      if (link.type === 'github') {
        label = 'GitHub';
        icon =
          '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>' +
          '</svg>';
      } else if (link.type === 'code_ocean') {
        label = 'Code Ocean';
        icon =
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>' +
          '</svg>';
      } else {
        label = link.type.charAt(0).toUpperCase() + link.type.slice(1);
        icon =
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>' +
          '</svg>';
      }

      return (
        '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer" ' +
          'class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md border-2 border-stone-200 text-stone-700 hover:border-gold hover:text-gold hover:bg-gold/5 transition-colors" ' +
          'aria-label="' + label + ' - ' + escapeHtml(link.url) + '">' +
          icon +
          label +
        '</a>'
      );
    }).filter(Boolean).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function slugify(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // Global function for citation toggle
  window.toggleCitation = function (cardId, iconId) {
    var el = document.getElementById(cardId);
    var icon = document.getElementById(iconId);
    if (el) {
      var expanded = el.classList.toggle('expanded');
      if (icon) {
        icon.style.transform = expanded ? 'rotate(180deg)' : '';
      }
      var btn = el.closest('div').querySelector('button');
      if (btn) {
        btn.setAttribute('aria-expanded', expanded);
      }
    }
  };

  // Init
  function init() {
    loadSoftware();

    document.getElementById('filter-type')?.addEventListener('change', applyFilters);

    document.getElementById('clear-filters')?.addEventListener('click', function () {
      var typeSel = document.getElementById('filter-type');
      if (typeSel) typeSel.value = '';
      applyFilters();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
