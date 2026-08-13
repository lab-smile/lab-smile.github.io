/**
 * Renders the Funded Projects, Grants & Awards, and Patents sections on
 * research.html from the shared data/ JSON files.
 *
 * Split out of the old canonical-sync.js mirroring pipeline: this page's
 * prose overview is now static markup (see research.html), and this script
 * only owns the three JSON-driven record lists appended after it. Patents
 * are the "Patents" rows of data/publications.json, not a file of their own.
 */
(function () {
  'use strict';

  const PROJECTS_DATA = 'data/projects.json';
  const GRANTS_DATA = 'data/grants.json';
  const PUBLICATIONS_DATA = 'data/publications.json';

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

  const EXTERNAL_LINK_ICON_PATH = 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14';

  function externalLinkIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', EXTERNAL_LINK_ICON_PATH);
    svg.appendChild(path);
    return svg;
  }

  // Funded projects render each link as the same bordered icon+text chip
  // publications.js uses for arXiv/ScienceDirect/etc — rather than the plain
  // gold pill grants and patents use, so a project's link reads as "here's
  // where to go for more," not just another inline tag. Chips are appended
  // straight into the row passed in (no label, no wrapper) so the toggle
  // (see projectRecord) can sit right next to them on the same line.
  function appendLinkChips(container, links) {
    if (!Array.isArray(links) || links.length === 0) return false;

    const seen = new Set();
    const unique = links.filter(link => {
      if (!link || !link.url || seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    });

    unique.forEach(link => {
      const anchor = document.createElement('a');
      anchor.className = 'research-project-link-chip';
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.appendChild(externalLinkIcon());
      anchor.appendChild(document.createTextNode(link.label || 'Related link'));
      container.appendChild(anchor);
    });

    return unique.length > 0;
  }

  function hasMeaningfulContent(html) {
    const holder = document.createElement('div');
    holder.innerHTML = html || '';
    return Boolean(holder.textContent.trim() || holder.querySelector('img, video, iframe'));
  }

  // Grants render as a native <details>/<summary> disclosure. The visible
  // label is styled like the Funded Projects inline toggle, while the entire
  // summary remains a generous native click target.
  function disclosureRecord(options) {
    const disclosure = document.createElement('details');
    disclosure.className = `research-disclosure ${options.variant || ''}`.trim();

    const summary = document.createElement('summary');
    summary.className = 'research-disclosure-summary';

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

    // Inline toggle label under the title. CSS swaps its open/closed state
    // from the parent <details> element's native [open] attribute.
    const toggleBar = document.createElement('span');
    toggleBar.className = 'research-disclosure-toggle-label';
    toggleBar.setAttribute('aria-hidden', 'true');
    const closed = document.createElement('span');
    closed.className = 'toggle-label-closed';
    closed.textContent = 'Show more ⌄';
    const open = document.createElement('span');
    open.className = 'toggle-label-open';
    open.textContent = 'Show less ⌃';
    toggleBar.append(closed, open);
    copy.appendChild(toggleBar);

    summary.appendChild(copy);

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

    disclosure.append(summary, body);
    return disclosure;
  }

  let projectDisclosureCount = 0;

  // Funded projects: title stays outside the collapsible content and is
  // always visible. Link chips and the "Show more" button sit together on
  // one always-visible row right under it. The expandable panel is a sibling
  // of that row so it always occupies the full card width when revealed.
  function projectRecord(options) {
    const card = document.createElement('div');
    card.className = 'research-project-card';

    const header = document.createElement('div');
    header.className = 'research-project-card-header';

    if (options.image) {
      const imageWrap = document.createElement('span');
      imageWrap.className = 'research-disclosure-image';
      const image = document.createElement('img');
      image.src = options.image;
      image.alt = options.imageAlt || '';
      image.loading = 'lazy';
      imageWrap.appendChild(image);
      header.appendChild(imageWrap);
    }

    const title = document.createElement('span');
    title.className = 'research-disclosure-title';
    title.innerHTML = options.titleHtml;
    header.appendChild(title);

    card.appendChild(header);

    const hasText = hasMeaningfulContent(options.detailsHtml);
    const row = document.createElement('div');
    row.className = 'research-project-links-row';
    const hasLinks = appendLinkChips(row, options.links);

    if (hasText) {
      projectDisclosureCount += 1;
      const buttonId = `research-project-toggle-${projectDisclosureCount}`;
      const panelId = `research-project-details-${projectDisclosureCount}`;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.id = buttonId;
      toggle.className = 'research-project-toggle-inline';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      const closed = document.createElement('span');
      closed.className = 'toggle-label-closed';
      closed.textContent = 'Show more ⌄';
      const open = document.createElement('span');
      open.className = 'toggle-label-open';
      open.textContent = 'Show less ⌃';
      toggle.append(closed, open);

      const body = document.createElement('div');
      body.id = panelId;
      body.className = 'research-disclosure-body research-project-toggle-body';
      body.setAttribute('role', 'region');
      body.setAttribute('aria-labelledby', buttonId);
      body.hidden = true;
      const details = document.createElement('div');
      details.className = 'research-disclosure-details';
      details.innerHTML = options.detailsHtml;
      body.appendChild(details);

      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        body.hidden = expanded;
        card.classList.toggle('research-project-card-expanded', !expanded);
      });

      row.appendChild(toggle);
      card.append(row, body);
    }

    if (hasLinks && !hasText) {
      card.appendChild(row);
    }

    return card;
  }

  function fundedProjectsSection(projects) {
    const section = document.createElement('section');
    section.className = 'canonical-sync canonical-record-section canonical-research-projects';
    section.dataset.canonicalSection = 'projects';
    section.setAttribute('aria-labelledby', 'canonical-projects-heading');

    const heading = document.createElement('h2');
    heading.id = 'canonical-projects-heading';
    heading.textContent = 'Funded Projects';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'research-disclosure-list';
    projects.forEach(project => {
      list.appendChild(projectRecord({
        titleHtml: project.title_html,
        image: project.image,
        imageAlt: project.image_alt,
        detailsHtml: project.details_html,
        links: project.links,
      }));
    });
    section.appendChild(list);
    return section;
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
    section.className = 'canonical-sync canonical-record-section canonical-research-patents';
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
    section.className = 'canonical-sync canonical-record-section canonical-research-grants';
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
    return section;
  }

  async function init() {
    const mount = document.getElementById('canonical-sync-root');
    if (!mount) return;

    try {
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

      mount.appendChild(fundedProjectsSection(projectsData));
      mount.appendChild(grantsSection(grantsData));
      mount.appendChild(patentSection(patentsData));
      document.dispatchEvent(new CustomEvent('research-dynamic-ready'));
    } catch (error) {
      console.error('Research record rendering failed:', error);
      document.body.classList.add('canonical-sync-failed');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
