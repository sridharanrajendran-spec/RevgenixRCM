/**
 * RevGenix RCM — Main Script
 * Features:
 *  - Sticky nav with scroll state
 *  - Active nav link via Intersection Observer
 *  - Mobile hamburger menu
 *  - Fade-in on scroll for sections
 *  - Contact form validation & submission UX
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────
     DOM References
  ───────────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const sections   = document.querySelectorAll('section[id]');
  const fadeEls    = document.querySelectorAll('.fade-in');
  const contactForm = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');

  /* ─────────────────────────────────────────────────
     1. Navbar — scroll state
  ───────────────────────────────────────────────── */
  function handleNavScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  /* ─────────────────────────────────────────────────
     2. Mobile hamburger menu
  ───────────────────────────────────────────────── */
  function toggleMenu(forceClose) {
    const isOpen = hamburger.classList.contains('open');
    const shouldOpen = forceClose === true ? false : !isOpen;

    hamburger.classList.toggle('open', shouldOpen);
    navLinks.classList.toggle('open', shouldOpen);
    hamburger.setAttribute('aria-expanded', String(shouldOpen));

    // Prevent body scroll when menu open
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close menu on nav link click
  navLinks.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link') || e.target.classList.contains('nav-cta-btn')) {
      toggleMenu(true);
    }
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(true);
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      toggleMenu(true);
      hamburger.focus();
    }
  });

  /* ─────────────────────────────────────────────────
     3. Active nav link — Intersection Observer
  ───────────────────────────────────────────────── */
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70',
    10
  );

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinkEls.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    {
      rootMargin: `-${navHeight}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ─────────────────────────────────────────────────
     4. Fade-in on scroll — Intersection Observer
  ───────────────────────────────────────────────── */
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.08,
    }
  );

  fadeEls.forEach((el) => fadeObserver.observe(el));

  /* ─────────────────────────────────────────────────
     5. Smooth scroll for hash links (polyfill-safe)
  ───────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────────
     6. Contact form validation & UX
  ───────────────────────────────────────────────── */
  if (contactForm) {
    const fields = {
      name: {
        el: document.getElementById('name'),
        errorEl: document.getElementById('name-error'),
        validate(val) {
          if (!val.trim()) return 'Full name is required.';
          if (val.trim().length < 2) return 'Please enter your full name.';
          return '';
        },
      },
      email: {
        el: document.getElementById('email'),
        errorEl: document.getElementById('email-error'),
        validate(val) {
          if (!val.trim()) return 'Email address is required.';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
          return '';
        },
      },
      message: {
        el: document.getElementById('message'),
        errorEl: document.getElementById('message-error'),
        validate(val) {
          if (!val.trim()) return 'A message is required.';
          if (val.trim().length < 10) return 'Message must be at least 10 characters.';
          return '';
        },
      },
    };

    function showError(field, message) {
      field.el.classList.toggle('error', !!message);
      field.errorEl.textContent = message;
    }

    function validateField(key) {
      const field = fields[key];
      const error = field.validate(field.el.value);
      showError(field, error);
      return !error;
    }

    // Live validation on blur
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      field.el.addEventListener('blur', () => validateField(key));
      field.el.addEventListener('input', () => {
        if (field.el.classList.contains('error')) validateField(key);
      });
    });

    // Phone number formatting
    const phoneEl = document.getElementById('phone');
    if (phoneEl) {
      phoneEl.addEventListener('input', () => {
        let digits = phoneEl.value.replace(/\D/g, '').substring(0, 10);
        let formatted = digits;
        if (digits.length >= 6) {
          formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length >= 3) {
          formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        phoneEl.value = formatted;
      });
    }

    // Form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all required fields
      let valid = true;
      Object.keys(fields).forEach((key) => {
        if (!validateField(key)) valid = false;
      });

      if (!valid) {
        // Focus first error field
        const firstError = Object.values(fields).find((f) =>
          f.el.classList.contains('error')
        );
        if (firstError) firstError.el.focus();
        return;
      }

      // Simulate async submission
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText.textContent;
      btnText.textContent = 'Sending…';

      // Simulate network delay
      setTimeout(() => {
        submitBtn.disabled = false;
        btnText.textContent = originalText;

        // Show success message
        formSuccess.classList.add('visible');
        contactForm.reset();

        // Clear error states
        Object.values(fields).forEach((f) => {
          f.el.classList.remove('error');
          f.errorEl.textContent = '';
        });

        // Hide success message after 6 seconds
        setTimeout(() => {
          formSuccess.classList.remove('visible');
        }, 6000);
      }, 1400);
    });
  }

  /* ─────────────────────────────────────────────────
     7. Service cards — keyboard accessibility
  ───────────────────────────────────────────────── */
  document.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('active');
      }
    });
  });

  /* ─────────────────────────────────────────────────
     8. Why-card counter animation
  ───────────────────────────────────────────────── */
  function animateCounter(el, target, duration, suffix) {
    const isFloat = String(target).includes('.');
    const precision = isFloat ? 1 : 0;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = (isFloat ? value.toFixed(precision) : Math.floor(value)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statsConfig = [
    { selector: '.why-grid .why-card:nth-child(1) .why-stat', target: 98, suffix: '%', duration: 1400 },
    { selector: '.why-grid .why-card:nth-child(2) .why-stat', target: 30, suffix: '%', duration: 1200 },
  ];

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cfg = statsConfig.find((c) => entry.target.matches(c.selector));
          if (cfg && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            animateCounter(entry.target, cfg.target, cfg.duration, cfg.suffix);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  statsConfig.forEach((cfg) => {
    const el = document.querySelector(cfg.selector);
    if (el) counterObserver.observe(el);
  });

  /* ─────────────────────────────────────────────────
     9. Resize handler — close mobile menu on desktop
  ───────────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
        toggleMenu(true);
      }
    }, 150);
  });

  /* ─────────────────────────────────────────────────
     10. Hero badge — subtle pulse on first load
  ───────────────────────────────────────────────── */
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) {
    setTimeout(() => {
      heroBadge.style.transition = 'box-shadow 0.3s ease';
      heroBadge.style.boxShadow = '0 0 16px rgba(37, 99, 235, 0.4)';
      setTimeout(() => {
        heroBadge.style.boxShadow = '';
      }, 800);
    }, 1200);
  }

})();
