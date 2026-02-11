/**
 * Shared Navigation - Loads header/footer, handles mobile menu and active page.
 */
(function () {
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  async function loadComponent(id, url) {
    const cacheKey = `smile-component-${url}`;
    const cacheTimeKey = `${cacheKey}-time`;
    const container = document.getElementById(id);
    if (!container) return;

    // Check sessionStorage cache
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < CACHE_TTL) {
      container.innerHTML = cached;
      return;
    }

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to load ${url}`);
      const html = await resp.text();
      container.innerHTML = html;
      sessionStorage.setItem(cacheKey, html);
      sessionStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (err) {
      console.error(`Error loading component ${url}:`, err);
    }
  }

  function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link]').forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === currentPage || (currentPage === 'index.html' && href === 'index.html');
      link.classList.toggle('text-primary', isActive);
      link.classList.toggle('border-primary', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (!toggle || !drawer || !overlay) return;

    function open() {
      drawer.classList.add('active');
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Focus trap - focus close button first
      if (closeBtn) closeBtn.focus();
      else {
        const firstLink = drawer.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    }

    function close() {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }

    toggle.addEventListener('click', open);
    overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Close on Escape + focus trapping
    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('active')) return;

      if (e.key === 'Escape') {
        close();
        return;
      }

      // Focus trap within drawer
      if (e.key === 'Tab') {
        const focusable = drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initStickyHeader() {
    const headerContainer = document.getElementById('site-header');
    if (!headerContainer) return;
    const header = headerContainer.querySelector('header') || headerContainer;
    const isHomepage = document.body.classList.contains('header-transparent');
    const hero = document.getElementById('hero');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      header.classList.toggle('header-scrolled', scrollY > 10);

      // Toggle transparent/solid state on homepage
      if (isHomepage && hero) {
        const heroBottom = hero.offsetHeight - 80;
        document.body.classList.toggle('header-solid', scrollY > heroBottom);
      }
    }, { passive: true });
  }

  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initialize
  async function init() {
    // Determine base path for components
    const base = document.querySelector('meta[name="component-base"]')?.content || '';
    await Promise.all([
      loadComponent('site-header', `${base}components/header.html`),
      loadComponent('site-footer', `${base}components/footer.html`)
    ]);
    setActivePage();
    initMobileMenu();
    initStickyHeader();
    initBackToTop();

    // Re-apply theme toggle binding after header loads
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', window.toggleTheme);
      // Sync icon state
      const isDark = document.documentElement.classList.contains('dark');
      const sunIcon = themeBtn.querySelector('.icon-sun');
      const moonIcon = themeBtn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        sunIcon.classList.toggle('hidden', !isDark);
        moonIcon.classList.toggle('hidden', isDark);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
