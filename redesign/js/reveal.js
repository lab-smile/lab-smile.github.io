/**
 * GSAP ScrollTrigger Animations
 * Parallax hero, scroll-linked fade-ins, counter animations, staggered reveals
 */
(function () {
  var gsapAvailable = false;
  var findRevealActive = false;
  var revealSelector = [
    '.gsap-fade-up',
    '.gsap-fade-in',
    '.gsap-slide-left',
    '.gsap-slide-right',
    '.gsap-scale-in',
    '.fade-up',
    '.stagger-children',
    '.research-card',
    '.logo-bar',
  ].join(', ');

  // Native browser find can jump directly into the middle of a reveal
  // element without passing the scroll position where ScrollTrigger expects
  // to start its animation. Once find is opened, prioritize readable/searchable
  // content and reveal every pending element immediately.
  function revealAllForBrowserFind() {
    findRevealActive = true;
    gsapAvailable = false;

    var elements = Array.prototype.slice.call(document.querySelectorAll(revealSelector));
    var staggeredChildren = Array.prototype.slice.call(
      document.querySelectorAll('.stagger-children > *')
    );
    var animatedElements = elements.concat(staggeredChildren);

    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.getAll === 'function') {
      ScrollTrigger.getAll().forEach(function (trigger) {
        var target = trigger.trigger;
        if (target && target.matches && target.matches(revealSelector)) {
          trigger.kill();
        }
      });
    }

    if (typeof gsap !== 'undefined' && typeof gsap.killTweensOf === 'function') {
      gsap.killTweensOf(animatedElements);
    }

    elements.forEach(function (el) {
      el.classList.add('visible', 'gsap-revealed');
      el.style.opacity = '1';

      if (!el.matches('.research-card, .logo-bar')) {
        el.style.transform = 'none';
      } else {
        el.style.removeProperty('transform');
      }
    });

    staggeredChildren.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transitionDelay = '0s';
    });
  }

  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && (event.key || '').toLowerCase() === 'f') {
      revealAllForBrowserFind();
    }
  }, true);

  // Content fetched asynchronously (news, highlights) can be inserted into the
  // DOM after this script's initial scan. Elements gaining `.gsap-fade-up`
  // after that point would otherwise stay at the CSS default of opacity:0
  // forever, since ScrollTrigger only knows about elements present when it
  // was set up. This re-scans for any not-yet-processed elements and reveals
  // them, called both at init and whenever new content is rendered.
  function revealFadeUps() {
    var elements = Array.prototype.filter.call(
      document.querySelectorAll('.gsap-fade-up'),
      function (el) { return !el.classList.contains('gsap-revealed'); }
    );
    if (!elements.length) return;

    elements.forEach(function (el) { el.classList.add('gsap-revealed'); });

    if (!gsapAvailable) {
      elements.forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('visible');
      });
      return;
    }

    elements.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  function init() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsapAvailable = !(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') &&
      !prefersReducedMotion && !findRevealActive;

    document.addEventListener('news-data-rendered', revealFadeUps);
    document.addEventListener('highlights-data-rendered', revealFadeUps);

    // Check if GSAP is loaded or user prefers reduced motion
    if (!gsapAvailable) {
      // Fallback: show everything immediately without animation
      document.querySelectorAll('.gsap-fade-in, .gsap-slide-left, .gsap-slide-right, .gsap-scale-in, .fade-up, .stagger-children').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('visible');
      });
      revealFadeUps();
      // Still run counters immediately (no animation) if reduced motion
      if (prefersReducedMotion || findRevealActive) {
        document.querySelectorAll('[data-counter]').forEach(function (el) {
          var target = parseInt(el.getAttribute('data-counter'), 10);
          var prefix = el.getAttribute('data-counter-prefix') || '';
          var suffix = el.getAttribute('data-counter-suffix');
          if (suffix === null) suffix = '+';
          el.textContent = prefix + target + suffix;
        });
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ─── Hero Parallax ─────────────────────────────
    var heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      gsap.to(heroBg, {
        y: 120,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // ─── Fade Up Elements ──────────────────────────
    revealFadeUps();

    // ─── Fade In Elements ──────────────────────────
    gsap.utils.toArray('.gsap-fade-in').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    // ─── Slide Left Elements ───────────────────────
    gsap.utils.toArray('.gsap-slide-left').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ─── Slide Right Elements ──────────────────────
    gsap.utils.toArray('.gsap-slide-right').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, x: 50 },
        {
          opacity: 1, x: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ─── Scale In Elements ─────────────────────────
    gsap.utils.toArray('.gsap-scale-in').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ─── Counter Animations ────────────────────────
    document.querySelectorAll('[data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var prefix = el.getAttribute('data-counter-prefix') || '';
      var suffix = el.getAttribute('data-counter-suffix');
      if (suffix === null) suffix = '+';
      var obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
        onUpdate: function () {
          el.textContent = prefix + Math.round(obj.val) + suffix;
        },
      });
    });

    // ─── Staggered Research Cards ──────────────────
    var researchCards = gsap.utils.toArray('.research-card');
    if (researchCards.length > 0) {
      gsap.fromTo(researchCards,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: researchCards[0],
            start: 'top 85%',
            once: true,
          },
        }
      );
    }

    // ─── Logo Bar Parallax (subtle) ────────────────
    var logoBar = document.querySelector('.logo-bar');
    if (logoBar) {
      gsap.fromTo(logoBar,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: logoBar,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }

    // ─── Legacy .fade-up support ───────────────────
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px' });

      document.querySelectorAll('.fade-up, .stagger-children').forEach(function (el) {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('.fade-up, .stagger-children').forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  // Wait for both DOM and GSAP
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Small delay to ensure GSAP scripts have loaded (they use defer)
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }
})();
