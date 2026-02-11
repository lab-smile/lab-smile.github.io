/**
 * GSAP ScrollTrigger Animations
 * Parallax hero, scroll-linked fade-ins, counter animations, staggered reveals
 */
(function () {
  function init() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check if GSAP is loaded or user prefers reduced motion
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
      // Fallback: show everything immediately without animation
      document.querySelectorAll('.gsap-fade-up, .gsap-fade-in, .gsap-slide-left, .gsap-slide-right, .gsap-scale-in, .fade-up, .stagger-children').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('visible');
      });
      // Still run counters immediately (no animation) if reduced motion
      if (prefersReducedMotion) {
        document.querySelectorAll('[data-counter]').forEach(function (el) {
          var target = parseInt(el.getAttribute('data-counter'), 10);
          el.textContent = target + '+';
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
    gsap.utils.toArray('.gsap-fade-up').forEach(function (el) {
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
          el.textContent = Math.round(obj.val) + '+';
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
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

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
