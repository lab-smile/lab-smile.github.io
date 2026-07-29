/**
 * Vanderbilt content synchronization.
 *
 * The root site is the canonical content source. This script copies canonical
 * sections into the Vanderbilt presentation at runtime so wording, records,
 * links, and future content updates cannot drift between the two versions.
 * Only asset paths are rebased for the redesign/ directory.
 */
(function () {
  'use strict';

  const CANONICAL_PAGE = '../index.html';
  const CANONICAL_PUBLICATIONS = '../publications.json';

  function pageName() {
    const name = window.location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function isExternalReference(value) {
    return /^(?:[a-z]+:|\/\/|#)/i.test(value);
  }

  function rebaseReference(value) {
    if (!value || isExternalReference(value) || value.startsWith('../')) return value;
    return `../${value}`;
  }

  function prepareCanonicalContent(root) {
    root.querySelectorAll('script').forEach(script => script.remove());

    root.querySelectorAll('[src]').forEach(element => {
      element.setAttribute('src', rebaseReference(element.getAttribute('src')));
    });
    root.querySelectorAll('[href]').forEach(element => {
      element.setAttribute('href', rebaseReference(element.getAttribute('href')));
    });
    root.querySelectorAll('[poster]').forEach(element => {
      element.setAttribute('poster', rebaseReference(element.getAttribute('poster')));
    });
    root.querySelectorAll('[data-full]').forEach(element => {
      element.setAttribute('data-full', rebaseReference(element.getAttribute('data-full')));
    });
    root.querySelectorAll('[style]').forEach(element => {
      const style = element.getAttribute('style');
      element.setAttribute(
        'style',
        style.replace(/url\((['"]?)(?![a-z]+:|\/\/|\.\.\/|#)([^'")]+)\1\)/gi, 'url($1../$2$1)')
      );
    });

    return root;
  }

  function canonicalPage(source, id, label) {
    const page = source.querySelector(`#${id}`);
    if (!page) throw new Error(`Canonical section #${id} was not found`);

    const wrapper = document.createElement('section');
    wrapper.className = 'canonical-sync canonical-page-copy';
    wrapper.dataset.canonicalSection = id;
    wrapper.setAttribute('aria-label', label);
    wrapper.innerHTML = page.innerHTML;
    return prepareCanonicalContent(wrapper);
  }

  function canonicalSubsection(source, headingText, label) {
    const heading = Array.from(source.querySelectorAll('#biography h3'))
      .find(element => element.textContent.trim() === headingText);
    const section = heading && heading.closest('.section');
    if (!section) throw new Error(`Canonical subsection "${headingText}" was not found`);

    const wrapper = document.createElement('section');
    wrapper.className = 'canonical-sync canonical-page-copy';
    wrapper.dataset.canonicalSection = headingText;
    wrapper.setAttribute('aria-label', label);
    wrapper.innerHTML = section.outerHTML;
    return prepareCanonicalContent(wrapper);
  }

  function contentMount(main, keepSelector) {
    let mount = main.querySelector('#canonical-sync-root');
    if (mount) mount.remove();

    Array.from(main.children).forEach(child => {
      if (!child.matches(keepSelector)) child.remove();
    });

    mount = document.createElement('div');
    mount.id = 'canonical-sync-root';
    mount.className = 'canonical-sync-root';
    main.appendChild(mount);
    return mount;
  }

  function syncHome(source) {
    const main = document.getElementById('main-content');
    if (!main) return;
    const mount = contentMount(main, '#hero');
    mount.appendChild(canonicalPage(source, 'biography', 'Canonical biography and lab updates'));
  }

  function syncSinglePage(source, id, label) {
    const main = document.getElementById('main-content');
    if (!main) return;
    const mount = contentMount(main, 'nav.breadcrumb-nav, section.page-header');
    mount.appendChild(canonicalPage(source, id, label));
  }

  function syncMedia(source) {
    const main = document.getElementById('main-content');
    if (!main) return;
    const mount = contentMount(main, 'nav.breadcrumb-nav, section.page-header');
    mount.appendChild(canonicalPage(source, 'video', 'Canonical videos'));
    mount.appendChild(canonicalPage(source, 'media', 'Canonical media coverage'));
  }

  function patentSection(publications) {
    const patents = publications.filter(publication => publication.type === 'Patents');
    const section = document.createElement('section');
    section.className = 'canonical-sync canonical-record-section';
    section.dataset.canonicalSection = 'patents';
    section.setAttribute('aria-labelledby', 'canonical-patents-heading');

    const heading = document.createElement('h2');
    heading.id = 'canonical-patents-heading';
    heading.textContent = 'Patents';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'canonical-record-list';
    patents.forEach(publication => {
      const article = document.createElement('article');
      article.className = 'canonical-record';
      article.innerHTML = `
        <h3>${publication.title}</h3>
        <div class="canonical-record-authors">${publication.authors || ''}</div>
        <div class="canonical-record-citation">${publication.citation || ''}</div>
      `;
      list.appendChild(article);
    });
    section.appendChild(list);
    return section;
  }

  async function syncResearch(source) {
    const main = document.getElementById('main-content');
    if (!main) return;

    const publicationsResponse = await fetch(CANONICAL_PUBLICATIONS, { cache: 'no-store' });
    if (!publicationsResponse.ok) throw new Error('Canonical publications could not be loaded');
    const publications = await publicationsResponse.json();

    const mount = contentMount(main, 'nav.breadcrumb-nav, section.page-header');
    mount.appendChild(canonicalPage(source, 'research', 'Canonical research'));
    mount.appendChild(canonicalSubsection(source, 'Grants & Awards', 'Canonical grants and awards'));
    mount.appendChild(patentSection(publications));
  }

  function initializeGenealogy() {
    if (typeof window.initGenealogyTree !== 'function') return;
    const tree = document.getElementById('genealogy-tree');
    if (!tree) return;
    tree.innerHTML = '';
    window.initGenealogyTree('genealogy-tree', {
      fontFamily: 'Lora, Georgia, serif',
      fontFamilyDisplay: 'Playfair Display, Georgia, serif',
      accentColor: '#C9A84C',
      textColor: '#1c1917',
      subtextColor: '#78716c',
      imagePrefix: '../',
    });
  }

  async function synchronize() {
    const currentPage = pageName();
    if (currentPage === 'publications.html' ||
        currentPage === 'software.html' ||
        currentPage === 'accessibility.html') {
      return;
    }

    const response = await fetch(CANONICAL_PAGE, { cache: 'no-store' });
    if (!response.ok) throw new Error('Canonical page could not be loaded');
    const html = await response.text();
    const source = new DOMParser().parseFromString(html, 'text/html');

    switch (currentPage) {
      case 'index.html':
        syncHome(source);
        break;
      case 'team.html':
        syncSinglePage(source, 'team', 'Canonical team');
        break;
      case 'research.html':
        await syncResearch(source);
        break;
      case 'teaching.html':
        syncSinglePage(source, 'teaching', 'Canonical teaching');
        break;
      case 'media.html':
        syncMedia(source);
        break;
      case 'gallery.html':
        syncSinglePage(source, 'gallery', 'Canonical gallery');
        break;
      case 'openings.html':
        syncSinglePage(source, 'openings', 'Canonical openings');
        break;
      case 'genealogy.html':
        syncSinglePage(source, 'genealogy', 'Canonical academic genealogy');
        initializeGenealogy();
        break;
      case 'contact.html':
        syncSinglePage(source, 'contact', 'Canonical contact information');
        break;
      default:
        break;
    }

    document.body.classList.add('canonical-sync-complete');
    document.dispatchEvent(new CustomEvent('canonical-content-synchronized', {
      detail: { page: currentPage },
    }));
  }

  function showFailure(error) {
    console.error('Canonical content synchronization failed:', error);
    document.body.classList.add('canonical-sync-failed');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => synchronize().catch(showFailure));
  } else {
    synchronize().catch(showFailure);
  }
})();
