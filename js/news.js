/**
 * News and highlight renderers.
 *
 * Both read the shared content data at the repository root, so the default site
 * and this one always show the same records.
 */
(function () {
  'use strict';
  // data/ and img/ are siblings of this page at the repository root.
  const DATA_DIR = 'data/';
  const ASSET_PREFIX = '';

  const NEWS_PAGE_SIZE = 10;

  function isExternalReference(value) {
    return /^(?:[a-z]+:|\/\/|#)/i.test(value);
  }

  function assetUrl(value) {
    if (!value || isExternalReference(value) || value.startsWith('../')) return value;
    return ASSET_PREFIX + value;
  }

  function newsItem(record, animated) {
    const item = document.createElement('div');
    item.className = `news-item${animated ? ' gsap-fade-up' : ''}`;

    const row = document.createElement('div');
    row.className = 'flex gap-4';

    const date = document.createElement('span');
    date.className = 'news-date';
    date.textContent = record.date;

    const content = document.createElement('div');
    content.className = 'news-text';
    content.innerHTML = record.content_html;

    row.append(date, content);
    item.appendChild(row);
    return item;
  }

  async function renderNews() {
    const list = document.getElementById('news-list');
    if (!list) return;

    const searchTrigger = document.getElementById('news-search-trigger');
    const searchPanel = document.getElementById('news-search-panel');
    const searchInput = document.getElementById('news-search-input');
    const searchClear = document.getElementById('news-search-clear');
    const searchResults = document.getElementById('news-search-results');

    const response = await fetch(DATA_DIR + 'news.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('News data could not be loaded');
    const records = await response.json();
    const searchableRecords = records.map(record => {
      const text = document.createElement('div');
      text.innerHTML = record.content_html;
      return {
        record,
        searchText: `${record.date} ${text.textContent || ''}`.toLocaleLowerCase(),
      };
    });

    let currentPage = 0;
    let query = '';

    const pagination = document.createElement('nav');
    pagination.className = 'news-pagination';
    pagination.setAttribute('aria-label', 'News pages');
    list.insertAdjacentElement('afterend', pagination);

    const status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'polite');
    pagination.insertAdjacentElement('afterend', status);

    function matchingRecords() {
      const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return records;
      return searchableRecords
        .filter(({ searchText }) => terms.every(term => searchText.includes(term)))
        .map(({ record }) => record);
    }

    function updateAddress(mode) {
      const url = new URL(window.location.href);
      if (currentPage > 0) url.searchParams.set('news-page', String(currentPage + 1));
      else url.searchParams.delete('news-page');
      if (query) url.searchParams.set('news-search', query);
      else url.searchParams.delete('news-search');
      window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
    }

    function pageButton(label, targetPage, options = {}) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `news-page-btn${options.label ? ' news-page-btn--label' : ''}${options.current ? ' active' : ''}`;
      button.textContent = label;
      button.disabled = options.disabled || false;
      button.setAttribute('aria-label', options.ariaLabel || `Go to news page ${targetPage + 1}`);
      if (options.current) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => renderPage(targetPage, true, 'push'));
      item.appendChild(button);
      return item;
    }

    function ellipsis() {
      const item = document.createElement('li');
      item.className = 'news-page-ellipsis';
      item.setAttribute('aria-hidden', 'true');
      item.textContent = '\u2026';
      return item;
    }

    function renderPage(page, userInitiated = false, addressMode = null) {
      const visibleRecords = matchingRecords();
      const pageCount = Math.max(1, Math.ceil(visibleRecords.length / NEWS_PAGE_SIZE));
      currentPage = Math.max(0, Math.min(page, pageCount - 1));
      const start = currentPage * NEWS_PAGE_SIZE;
      const pageRecords = visibleRecords.slice(start, start + NEWS_PAGE_SIZE);

      if (pageRecords.length) {
        list.replaceChildren(...pageRecords.map(record => newsItem(record, true)));
      } else {
        const empty = document.createElement('p');
        empty.className = 'news-empty-state';
        empty.textContent = `No news items match “${query}”.`;
        list.replaceChildren(empty);
      }

      pagination.hidden = pageCount <= 1;
      if (pageCount > 1) {
        const pages = new Set([0, pageCount - 1]);
        for (let pageIndex = currentPage - 1; pageIndex <= currentPage + 1; pageIndex += 1) {
          if (pageIndex >= 0 && pageIndex < pageCount) pages.add(pageIndex);
        }

        const items = [pageButton('Previous', currentPage - 1, {
          label: true,
          disabled: currentPage === 0,
          ariaLabel: 'Previous news page',
        })];
        let previousPage = -1;
        [...pages].sort((a, b) => a - b).forEach(pageIndex => {
          if (previousPage >= 0 && pageIndex - previousPage > 1) items.push(ellipsis());
          items.push(pageButton(String(pageIndex + 1), pageIndex, {
            current: pageIndex === currentPage,
            ariaLabel: pageIndex === currentPage
              ? `News page ${pageIndex + 1}, current page`
              : `Go to news page ${pageIndex + 1}`,
          }));
          previousPage = pageIndex;
        });
        items.push(pageButton('Next', currentPage + 1, {
          label: true,
          disabled: currentPage === pageCount - 1,
          ariaLabel: 'Next news page',
        }));

        const pageList = document.createElement('ul');
        pageList.className = 'news-pagination-list';
        pageList.append(...items);
        pagination.replaceChildren(pageList);
      } else {
        pagination.replaceChildren();
      }

      if (query) {
        const resultLabel = visibleRecords.length === 1 ? 'result' : 'results';
        searchResults.textContent = `${visibleRecords.length} ${resultLabel} for “${query}”`;
      } else {
        searchResults.textContent = '';
      }
      searchClear.hidden = !query;
      status.textContent = visibleRecords.length
        ? `Showing news page ${currentPage + 1} of ${pageCount}`
        : 'No matching news items';

      if (addressMode) updateAddress(addressMode);

      document.dispatchEvent(new CustomEvent('news-data-rendered', {
        detail: {
          count: records.length,
          resultCount: visibleRecords.length,
          currentPage: currentPage + 1,
          pageCount,
          query,
        },
      }));

      if (userInitiated) {
        const currentButton = pagination.querySelector('[aria-current="page"]');
        if (currentButton) currentButton.focus({ preventScroll: true });
        list.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function readAddress() {
      const params = new URLSearchParams(window.location.search);
      query = (params.get('news-search') || '').trim();
      const requestedPage = Number.parseInt(params.get('news-page') || '1', 10);
      currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0;
      searchInput.value = query;
      searchPanel.hidden = !query;
      searchTrigger.setAttribute('aria-expanded', query ? 'true' : 'false');
      searchTrigger.setAttribute('aria-label', query ? 'Close news search' : 'Open news search');
      renderPage(currentPage);
    }

    searchTrigger.addEventListener('click', () => {
      const opening = searchPanel.hidden;
      searchPanel.hidden = !opening;
      searchTrigger.setAttribute('aria-expanded', String(opening));
      searchTrigger.setAttribute('aria-label', opening ? 'Close news search' : 'Open news search');

      if (opening) {
        searchInput.focus();
      } else {
        searchInput.value = '';
        query = '';
        renderPage(0, false, 'replace');
      }
    });

    searchInput.addEventListener('input', () => {
      query = searchInput.value.trim();
      renderPage(0, false, 'replace');
    });

    searchInput.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !query) {
        searchPanel.hidden = true;
        searchTrigger.setAttribute('aria-expanded', 'false');
        searchTrigger.setAttribute('aria-label', 'Open news search');
        searchTrigger.focus();
      }
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      query = '';
      renderPage(0, false, 'replace');
      searchInput.focus();
    });

    window.addEventListener('popstate', readAddress);
    readAddress();
    updateAddress('replace');
  }

  function highlightCard(record) {
    const card = document.createElement('article');
    card.className = 'highlight-card gsap-fade-up';

    const link = document.createElement('a');
    link.className = 'highlight-link';
    link.href = record.url || '#';
    if (isExternalReference(record.url)) {
      link.target = '_blank';
      link.rel = 'noopener';
    }

    const media = document.createElement('span');
    media.className = 'highlight-media';
    if (record.image) {
      media.style.backgroundImage = `url("${assetUrl(record.image)}")`;
    }

    const body = document.createElement('span');
    body.className = 'highlight-body';

    const date = document.createElement('span');
    date.className = 'highlight-date';
    date.textContent = record.date;

    const text = document.createElement('span');
    text.className = 'highlight-text';
    text.innerHTML = record.content_html;

    body.append(date, text);
    link.append(media, body);
    card.appendChild(link);
    return card;
  }

  async function renderHighlights() {
    const container = document.getElementById('highlights-list');
    if (!container) return;

    const response = await fetch(DATA_DIR + 'highlights.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Highlight data could not be loaded');
    const records = await response.json();

    container.replaceChildren(...records.map(highlightCard));

    document.dispatchEvent(new CustomEvent('highlights-data-rendered', {
      detail: { count: records.length },
    }));
  }

  function showFailure(error) {
    console.error('News rendering failed:', error);
  }

  function render() {
    renderNews().catch(showFailure);
    renderHighlights().catch(showFailure);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
