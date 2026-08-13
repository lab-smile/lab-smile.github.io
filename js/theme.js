/**
 * Dark Mode Toggle
 * Persists preference via localStorage, respects system preference.
 */
(function () {
  const STORAGE_KEY = 'smile-theme';

  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
    // Update toggle button icon
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const sunIcon = btn.querySelector('.icon-sun');
      const moonIcon = btn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        sunIcon.classList.toggle('hidden', theme !== 'dark');
        moonIcon.classList.toggle('hidden', theme === 'dark');
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  // Apply immediately to prevent flash
  apply(getPreferred());

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      apply(e.matches ? 'dark' : 'light');
    }
  });

  // Expose toggle function
  window.toggleTheme = function () {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  };
})();
