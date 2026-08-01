/**
 * Renders the JSON-driven sections of the single-page site: news, grants,
 * funded projects, and the photo gallery.
 *
 * data/ is the single source of truth, shared with redesign/. The markup built
 * here mirrors what used to be hand-written in index.html, so the existing
 * Bootstrap/jQuery styling and plugins keep working.
 */

// redesign/ pages sit one level below the data directory; root pages sit beside it.
const DATA_DIR = /\/redesign\//.test(window.location.pathname) ? '../data/' : 'data/';

async function fetchJSON(name) {
    try {
        const response = await fetch(DATA_DIR + name);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to load ${name}:`, error);
        return [];
    }
}

function attr(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/*++++++++++++++++++++++++++++++++++++
    news
++++++++++++++++++++++++++++++++++++++*/
function renderNews(items, container) {
    container.innerHTML = items.map(item =>
        `<li style="margin-bottom:10px">${item.date}: ${item.content_html}</li>`
    ).join('\n');
}

/*++++++++++++++++++++++++++++++++++++
    recent news highlights (accordion)
++++++++++++++++++++++++++++++++++++++*/
function renderHighlights(items, container) {
    container.innerHTML = items.map(item =>
        `<li style="background-image: url('${attr(item.image)}');">
            <div>
                <a href="${attr(item.url)}" target="_blank" rel="noopener">
                    <h3>${item.date}</h3>
                    <p>${item.content_html}</p>
                </a>
            </div>
        </li>`
    ).join('\n');
}

/*++++++++++++++++++++++++++++++++++++
    grants & awards timeline
++++++++++++++++++++++++++++++++++++++*/
function renderGrants(items, container) {
    container.innerHTML = items.map(item =>
        `<li class="open">
            <div class="date">${item.year}</div>
            <div class="circle"></div>
            <div class="data">
                <div class="subject">${item.title_html}</div>
                ${item.details_html}
            </div>
        </li>`
    ).join('\n');
}

/*++++++++++++++++++++++++++++++++++++
    funded projects
++++++++++++++++++++++++++++++++++++++*/
function renderProjects(items, container) {
    container.innerHTML = items.map(item => {
        const links = Array.isArray(item.links) ? item.links : [];
        // Each link carries the slot it renders into: "overlay" is the magnifier
        // over the funder logo, "meta" the heading links under the title.
        const overlayLink = links.find(link => link.slot === 'overlay');
        const overlay = overlayLink ? overlayLink.url : '';
        const secondary = links.filter(link => link.slot === 'meta').map(link =>
            `<a href="${attr(link.url)}" target="_blank"><h4>${link.label}</h4></a>`
        ).join('\n                        ');

        return `<li>
            <div class="row">
                <div class="col-sm-6 col-md-3">
                    <div class="image">
                        <img alt="${attr(item.image_alt)}" src="${attr(item.image)}" class="img-responsive">
                        <div class="imageoverlay">
                            <a href="${attr(overlay)}" class="tooltips" title="External link" target="_blank"><i class="fa fa-search"></i></a>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-9">
                    <div class="meta">
                        <h3>${item.title_html}</h3>
                        ${secondary}
                    </div>
                </div>
            </div>
            <div class="details">${item.details_html}</div>
        </li>`;
    }).join('\n');
}

// custom.js binds the show/hide handlers directly to the li elements present at
// DOM ready, which no longer exist by then. Delegate from the static ul instead.
function bindProjectDetails(container) {
    $(container).on('click', 'li > .row', function() {
        $(this).closest('li').find('.details')
            .stop(true, true)
            .animate({ height: 'toggle', opacity: 'toggle' }, 300);
    }).on('mouseenter', 'li > .row', function() {
        new TweenLite($(this).closest('li').find('.imageoverlay'), 0.4, { left: 0 });
    }).on('mouseleave', 'li > .row', function() {
        new TweenLite($(this).closest('li').find('.imageoverlay'), 0.2, { left: '-102%' });
    });
}

/*++++++++++++++++++++++++++++++++++++
    gallery
++++++++++++++++++++++++++++++++++++++*/
function renderGallery(items, container) {
    container.innerHTML = items.map(item =>
        `<li>
            <div>
                <img alt="${attr(item.alt)}" src="${attr(item.image)}">
                <a href="${attr(item.full_image || item.image)}" class="popup-with-move-anim">
                    <div class="over">
                        <div class="comein">
                            <h3>${item.caption_html}</h3>
                            <div class="comein-bg"></div>
                        </div>
                    </div>
                </a>
            </div>
        </li>`
    ).join('\n');
}

// The lightbox binds to anchors directly and masonry measures images, so both
// have to run after injection — and masonry again once the images have sizes.
function initGalleryPlugins(container) {
    const $grid = $(container);

    $grid.find('.popup-with-move-anim').magnificPopup({
        type: 'image',
        fixedContentPos: false,
        fixedBgPos: true,
        overflowY: 'auto',
        closeBtnInside: true,
        preloader: false,
        midClick: true,
        removalDelay: 400,
        mainClass: 'my-mfp-slide-bottom'
    });

    const layout = () => {
        $grid.masonry({ itemSelector: 'li' });
        $grid.masonry('reloadItems');
        $grid.masonry('layout');
    };

    layout();
    $grid.find('img').each(function() {
        if (this.complete) return;
        $(this).on('load error', layout);
    });
}

$(document).ready(async function() {
    const news = document.getElementById('news-list');
    const highlights = document.getElementById('highlights-list');
    const grants = document.getElementById('grants-timeline');
    const projects = document.getElementById('funded-projects');
    const gallery = document.getElementById('grid');

    if (news) {
        renderNews(await fetchJSON('news.json'), news);
    }
    if (highlights) {
        renderHighlights(await fetchJSON('highlights.json'), highlights);
    }
    if (grants) {
        renderGrants(await fetchJSON('grants.json'), grants);
    }
    if (projects) {
        renderProjects(await fetchJSON('projects.json'), projects);
        bindProjectDetails(projects);
    }
    if (gallery) {
        renderGallery(await fetchJSON('gallery.json'), gallery);
        initGalleryPlugins(gallery);
    }
});
