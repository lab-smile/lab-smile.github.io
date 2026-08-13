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

  const INITIAL_NEWS_COUNT = 12;

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
    const primary = document.getElementById('news-list');
    const additional = document.getElementById('more-news');
    if (!primary || !additional) return;

    const response = await fetch(DATA_DIR + 'news.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('News data could not be loaded');
    const records = await response.json();

    primary.replaceChildren(
      ...records.slice(0, INITIAL_NEWS_COUNT).map(record => newsItem(record, true))
    );
    additional.replaceChildren(
      ...records.slice(INITIAL_NEWS_COUNT).map(record => newsItem(record, false))
    );

    document.dispatchEvent(new CustomEvent('news-data-rendered', {
      detail: { count: records.length },
    }));
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
