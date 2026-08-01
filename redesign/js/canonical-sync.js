/**
 * Vanderbilt content synchronization.
 *
 * Vanderbilt reads a local snapshot of the verified default-site content.
 * This keeps the two presentations independent at runtime while preserving
 * exact wording and record parity at the time the snapshot is refreshed.
 * Only shared asset paths are rebased for the redesign/ directory.
 */
(function () {
  'use strict';

  const currentScript = document.currentScript;
  const ASSET_PREFIX = currentScript ? (currentScript.dataset.assetPrefix || '') : '../';
  const CANONICAL_PAGE = 'data/default-content.html';
  // data/ lives at the repository root; redesign/ pages sit one level below it.
  const DATA_DIR = /\/redesign\//.test(window.location.pathname) ? '../data/' : 'data/';
  const PROJECTS_DATA = DATA_DIR + 'projects.json';
  const GRANTS_DATA = DATA_DIR + 'grants.json';
  // Patents are the "Patents" rows of the shared publications file, not a file of their own.
  const PUBLICATIONS_DATA = DATA_DIR + 'publications.json';

  function pageName() {
    const name = window.location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function isExternalReference(value) {
    return /^(?:[a-z]+:|\/\/|#)/i.test(value);
  }

  function rebaseReference(value) {
    if (!value || isExternalReference(value) || value.startsWith('../') || !ASSET_PREFIX) return value;
    return `${ASSET_PREFIX}${value}`;
  }

  // The default site paints media-card thumbnails through .post__image--NAME
  // rules in css/style.css, which the redesign does not load. Resolve them here
  // instead so the paths pick up ASSET_PREFIX like every other asset.
  const MEDIA_THUMBS = {
    'alligator': 'img/media/alligator.png',
    'appliedradiology': 'img/media/appliedradiology.png',
    'bignewsnetwork': 'img/media/bignewsnetwork.png',
    'eyesmart': 'img/media/eyesmart.png',
    'dotmed': 'img/media/dotmed.png',
    'FIU-news': 'img/media/FIU-news.png',
    'forbes': 'img/media/forbes.png',
    'ivanhoe': 'img/media/ivanhoe-interview.png',
    'mscp': 'img/media/mscp-logo.png',
    'nationalacademies': 'img/media/nationalacademies.png',
    'nationalgeographic': 'img/media/nationalgeographic.png',
    'newscientist': 'img/media/newscientist.png',
    'rsipvision': 'img/media/rsipvision.jpg',
    'rsna': 'img/media/rsna.png',
    'sciencedaily': 'img/media/sciencedaily.png',
    'scitechdaily': 'img/media/scitechdaily.png',
    'techtuesday': 'img/media/techtuesday-interview.png',
    'ufepi': 'img/media/ufepi.png',
    'ufaicurr': 'img/media/ufaicurr.png',
    'ufai': 'img/media/ufai.png',
    'cph': 'img/media/CPH.jpg',
    'uf': 'img/media/uf.png',
    'ufdementia': 'img/media/ufhealth-interview.png',
    'ufparkinson': 'img/media/ufengineering-news.png',
    'ufengineering': 'img/media/ufengineering-newsvideo.png',
    'thewashingtonpost': 'img/media/thewashingtonpost.png',
    'wcjb': 'img/media/abcwcjb20-interview.png',
    'wfts': 'img/media/abcwfts-interview.png',
    'wplg': 'img/media/abclocal10tv-interview.png',
    'ufnvidia': 'img/media/nvidia-hackathon.png',
    'hwcoeaward': 'img/media/hwcoe_award2022.jpg',
    'acm': 'img/personal/acm.png',
    'cvnews': 'img/media/cvnews.jpeg',
    'inside': 'img/media/inside.jpg',
  };

  function applyMediaThumbnails(root) {
    root.querySelectorAll('.post__image').forEach(element => {
      const modifier = Array.from(element.classList)
        .map(name => name.startsWith('post__image--') ? name.slice('post__image--'.length) : null)
        .find(name => name && MEDIA_THUMBS[name]);
      if (!modifier) {
        element.classList.add('post__image-empty');
        return;
      }
      element.style.backgroundImage = `url("${ASSET_PREFIX}${MEDIA_THUMBS[modifier]}")`;
    });
  }

  function prepareCanonicalContent(root) {
    root.querySelectorAll('script').forEach(script => script.remove());
    applyMediaThumbnails(root);

    root.querySelectorAll('a').forEach(anchor => {
      const member = anchor.querySelector(':scope > .member');
      if (!member) return;
      anchor.classList.add('member-card-link');
      const name = member.querySelector('.bio h3');
      if (name) name.classList.add('member-linked-name');
    });

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
        style.replace(
          /url\((['"]?)(?![a-z]+:|\/\/|\.\.\/|#)([^'")]+)\1\)/gi,
          (_match, quote, value) => `url(${quote}${ASSET_PREFIX}${value}${quote})`
        )
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

  // Each redesign page already has its own hero title. Drop the copied title
  // when it repeats the hero, and the whole header block if nothing else is left
  // in it. Any subtitle or intro copy the header carries survives. Section
  // dividers on multi-section pages never match the hero, so they stay.
  function removeDuplicateHeader(section) {
    const header = section.querySelector('.pageheader');
    const hero = document.querySelector('#main-content .page-header h1');
    if (!header || !hero) return;

    const normalize = text => text.replace(/\s+/g, ' ').trim().toLowerCase();
    const title = header.querySelector('h1, h2');
    if (!title || normalize(title.textContent) !== normalize(hero.textContent)) return;

    title.remove();
    if (!normalize(header.textContent) && !header.querySelector('img, video, iframe')) {
      header.remove();
    }
  }

  function syncSinglePage(source, id, label) {
    const main = document.getElementById('main-content');
    if (!main) return;
    const mount = contentMount(main, 'nav.breadcrumb-nav, section.page-header');
    const section = canonicalPage(source, id, label);
    removeDuplicateHeader(section);
    mount.appendChild(section);
  }

  function syncMedia(source) {
    const main = document.getElementById('main-content');
    if (!main) return;
    const mount = contentMount(main, 'nav.breadcrumb-nav, section.page-header');
    mount.appendChild(canonicalPage(source, 'video', 'Canonical videos'));
    mount.appendChild(canonicalPage(source, 'media', 'Canonical media coverage'));
  }

  function recordLinks(links) {
    if (!Array.isArray(links) || links.length === 0) return null;

    const container = document.createElement('div');
    container.className = 'research-record-links';
    container.setAttribute('aria-label', 'Related links');

    const seen = new Set();
    links.forEach(link => {
      if (!link || !link.url || seen.has(link.url)) return;
      seen.add(link.url);
      const anchor = document.createElement('a');
      anchor.className = 'research-record-link';
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.textContent = link.label || 'Related link';
      container.appendChild(anchor);
    });

    return container.childElementCount ? container : null;
  }

  function hasMeaningfulContent(html) {
    const holder = document.createElement('div');
    holder.innerHTML = html || '';
    return Boolean(holder.textContent.trim() || holder.querySelector('img, video, iframe'));
  }

  function disclosureRecord(options) {
    const disclosure = document.createElement('details');
    disclosure.className = `research-disclosure ${options.variant || ''}`.trim();

    const summary = document.createElement('summary');
    summary.className = 'research-disclosure-summary';

    if (options.image) {
      const imageWrap = document.createElement('span');
      imageWrap.className = 'research-disclosure-image';
      const image = document.createElement('img');
      image.src = options.image;
      image.alt = options.imageAlt || '';
      image.loading = 'lazy';
      imageWrap.appendChild(image);
      summary.appendChild(imageWrap);
    }

    const copy = document.createElement('span');
    copy.className = 'research-disclosure-copy';

    if (options.meta) {
      const meta = document.createElement('span');
      meta.className = 'research-disclosure-meta';
      meta.textContent = options.meta;
      copy.appendChild(meta);
    }

    const title = document.createElement('span');
    title.className = 'research-disclosure-title';
    title.innerHTML = options.titleHtml;
    copy.appendChild(title);
    summary.appendChild(copy);

    const indicator = document.createElement('span');
    indicator.className = 'research-disclosure-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    summary.appendChild(indicator);

    const body = document.createElement('div');
    body.className = 'research-disclosure-body';

    if (hasMeaningfulContent(options.detailsHtml)) {
      const details = document.createElement('div');
      details.className = 'research-disclosure-details';
      details.innerHTML = options.detailsHtml;
      body.appendChild(details);
    }

    const links = recordLinks(options.links);
    if (links) body.appendChild(links);

    if (!body.childElementCount) {
      const empty = document.createElement('p');
      empty.className = 'research-disclosure-empty';
      empty.textContent = 'No additional details are currently available.';
      body.appendChild(empty);
    }

    disclosure.append(summary, body);
    return disclosure;
  }

  function fundedProjectsSection(projects) {
    const section = document.createElement('section');
    section.className = 'canonical-sync canonical-record-section';
    section.dataset.canonicalSection = 'projects';
    section.setAttribute('aria-labelledby', 'canonical-projects-heading');

    const heading = document.createElement('h2');
    heading.id = 'canonical-projects-heading';
    heading.textContent = 'Funded Projects';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'research-disclosure-list';
    projects.forEach(project => {
      list.appendChild(disclosureRecord({
        variant: 'research-project-disclosure',
        meta: 'Funded project',
        titleHtml: project.title_html,
        image: project.image,
        imageAlt: project.image_alt,
        detailsHtml: project.details_html,
        links: project.links,
      }));
    });
    section.appendChild(list);
    return prepareCanonicalContent(section);
  }

  function linkLabel(label, url) {
    const cleaned = (label || '').trim();
    if (cleaned && !/^(?:link|external link|project link)$/i.test(cleaned)) return cleaned;
    if (/reporter\.nih\.gov/i.test(url)) return 'NIH RePORTER';
    if (/nsf\.gov/i.test(url)) return 'NSF Award';
    if (/patents?\.google\.com|google\.com\/patents/i.test(url)) return 'Patent record';
    return 'Project page';
  }

  // Patents are rendered from the shared publications file so the two never drift.
  function patentRecords(publications) {
    return publications
      .filter(publication => publication.type === 'Patents')
      .map(publication => {
        const external = publication.external_links;
        const links = external && typeof external === 'object'
          ? Object.keys(external).sort()
              .filter(key => typeof external[key] === 'string' && external[key].trim())
              .map(key => ({ label: linkLabel(key, external[key]), url: external[key] }))
          : [];
        return Object.assign({}, publication, { links });
      });
  }

  function patentSection(patents) {
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
      const links = recordLinks(publication.links);
      if (links) article.appendChild(links);
      list.appendChild(article);
    });
    section.appendChild(list);
    return section;
  }

  function grantsSection(grants) {
    const section = document.createElement('section');
    section.className = 'canonical-sync canonical-record-section';
    section.dataset.canonicalSection = 'grants';
    section.setAttribute('aria-labelledby', 'canonical-grants-heading');

    const heading = document.createElement('h2');
    heading.id = 'canonical-grants-heading';
    heading.textContent = 'Grants & Awards';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'research-disclosure-list canonical-grants-list';
    grants.forEach(grant => {
      list.appendChild(disclosureRecord({
        variant: 'research-grant-disclosure',
        meta: grant.year,
        titleHtml: grant.title_html,
        detailsHtml: grant.details_html,
        links: grant.links,
      }));
    });
    section.appendChild(list);
    return prepareCanonicalContent(section);
  }

  async function syncResearch(source) {
    const main = document.getElementById('main-content');
    if (!main) return;

    const [projectsResponse, grantsResponse, publicationsResponse] = await Promise.all([
      fetch(PROJECTS_DATA, { cache: 'no-store' }),
      fetch(GRANTS_DATA, { cache: 'no-store' }),
      fetch(PUBLICATIONS_DATA, { cache: 'no-store' }),
    ]);
    if (!projectsResponse.ok) throw new Error('Funded project data could not be loaded');
    if (!grantsResponse.ok) throw new Error('Grant data could not be loaded');
    if (!publicationsResponse.ok) throw new Error('Publication data could not be loaded');
    const [projectsData, grantsData, publicationsData] = await Promise.all([
      projectsResponse.json(),
      grantsResponse.json(),
      publicationsResponse.json(),
    ]);
    const patentsData = patentRecords(publicationsData);

    const mount = contentMount(main, 'nav.breadcrumb-nav, section.page-header');
    mount.classList.add('canonical-research-content');

    const research = canonicalPage(source, 'research', 'Canonical research');
    research.classList.add('canonical-research-overview');
    const fundedHeading = Array.from(research.querySelectorAll('h3'))
      .find(element => element.textContent.trim() === 'Funded Projects');
    const legacyFundedSection = fundedHeading && fundedHeading.closest('.section');
    if (legacyFundedSection) legacyFundedSection.remove();

    const projects = fundedProjectsSection(projectsData);
    projects.classList.add('canonical-research-projects');

    const grants = grantsSection(grantsData);
    grants.classList.add('canonical-research-grants');

    const patents = patentSection(patentsData);
    patents.classList.add('canonical-research-patents');

    mount.appendChild(research);
    mount.appendChild(projects);
    mount.appendChild(grants);
    mount.appendChild(patents);
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
      imagePrefix: ASSET_PREFIX,
    });
  }

  async function synchronize() {
    const currentPage = pageName();
    if (currentPage === 'index.html' ||
        currentPage === 'gallery.html' ||
        currentPage === 'publications.html' ||
        currentPage === 'software.html' ||
        currentPage === 'accessibility.html') {
      return;
    }

    const response = await fetch(CANONICAL_PAGE, { cache: 'no-store' });
    if (!response.ok) throw new Error('Canonical page could not be loaded');
    const html = await response.text();
    const source = new DOMParser().parseFromString(html, 'text/html');

    switch (currentPage) {
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
