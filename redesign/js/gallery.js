/**
 * Gallery - Lightbox and lazy loading for photo gallery.
 */
(function () {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let galleryItems = [];
  let currentIndex = 0;

  function init() {
    galleryItems = Array.from(document.querySelectorAll('[data-gallery]'));

    galleryItems.forEach((item, idx) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(idx);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigate(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigate(1));

    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightbox || !lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    initMasonry();
  }

  // Grid-span masonry: keeps chronological (left-to-right) order while sizing
  // each item's row span from its image plus caption height.
  function layoutMasonry() {
    const grid = document.querySelector('.gallery-masonry');
    if (!grid) return;
    const styles = getComputedStyle(grid);
    const rowHeight = parseFloat(styles.gridAutoRows) || 10;
    const rowGap = parseFloat(styles.rowGap) || 0;
    grid.querySelectorAll('.gallery-item').forEach((item) => {
      const img = item.querySelector('img');
      if (img && !img.complete) return; // keep fallback span until lazy img loads
      const caption = item.querySelector('p');
      const captionStyles = caption ? getComputedStyle(caption) : null;
      const captionHeight = caption
        ? caption.getBoundingClientRect().height +
          parseFloat(captionStyles.marginTop || 0) +
          parseFloat(captionStyles.marginBottom || 0)
        : 0;
      const height = (img || item).getBoundingClientRect().height + captionHeight;
      if (!height) return;
      const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = 'span ' + span;
    });
  }

  function initMasonry() {
    const grid = document.querySelector('.gallery-masonry');
    if (!grid) return;
    grid.querySelectorAll('img').forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', layoutMasonry);
      img.addEventListener('error', layoutMasonry);
    });
    layoutMasonry();
    window.addEventListener('load', layoutMasonry);
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutMasonry, 150);
    });
  }

  function openLightbox(idx) {
    currentIndex = idx;
    updateLightbox();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    galleryItems[currentIndex]?.focus();
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    updateLightbox();
  }

  function updateLightbox() {
    const item = galleryItems[currentIndex];
    if (!item) return;
    const src = item.getAttribute('data-full') || item.querySelector('img')?.src;
    const caption =
      item.getAttribute('data-caption') ||
      item.querySelector('p')?.textContent.trim() ||
      item.querySelector('img')?.alt ||
      '';
    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
    }
    if (lightboxCaption) lightboxCaption.textContent = caption;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
