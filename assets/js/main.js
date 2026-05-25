/* ============================================================
   MAIN.JS — Core utilities
   - Loads navbar/footer components dynamically
   - Handles bilingual toggle (ES/EN)
   - Marks active page in navbar
   - Mobile menu toggle
   - Scroll reveal animations
   ============================================================ */

(function () {
  'use strict';

  const LANG_KEY = 'octapod_lang';
  const DEFAULT_LANG = 'es';

  // ---------- Component loader ----------
  async function loadComponent(targetId, url) {
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      target.innerHTML = await res.text();
    } catch (err) {
      console.error('[components]', err);
    }
  }

  // ---------- i18n ----------
  function getLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations(lang);
    updateLangLabel(lang);
    document.documentElement.lang = lang;
  }

  function applyTranslations(lang) {
    const dict = (window.translations && window.translations[lang]) || {};
    // text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });
    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
    // aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) {
        el.setAttribute('aria-label', dict[key]);
      }
    });
  }

  function updateLangLabel(lang) {
    const label = document.getElementById('langLabel');
    if (label) {
      // Show the language you'll switch TO
      label.textContent = lang === 'es' ? 'EN' : 'ES';
    }
  }

  function bindLangToggle() {
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = getLang();
      const next = current === 'es' ? 'en' : 'es';
      setLang(next);
    });
  }

  // ---------- Active page indicator ----------
  function markActivePage() {
    const pageName = (document.body.getAttribute('data-page') || '').toLowerCase();
    if (!pageName) return;
    document.querySelectorAll('.navbar-nav-custom a[data-page]').forEach((link) => {
      if (link.getAttribute('data-page') === pageName) {
        link.classList.add('active');
      }
    });
  }

  // ---------- Mobile menu ----------
  function bindMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
    // close on link click
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => menu.classList.remove('open'));
    });
  }

  // ---------- Footer year ----------
  function setFooterYear() {
    const y = document.getElementById('footerYear');
    if (y) y.textContent = new Date().getFullYear();
  }

  // ---------- Scroll reveal ----------
  function bindScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', async () => {
    // Apply language ASAP for any inline content
    const lang = getLang();
    document.documentElement.lang = lang;

    // Load shared components first
    await Promise.all([
      loadComponent('navbar-container', 'assets/components/navbar.html'),
      loadComponent('footer-container', 'assets/components/footer.html'),
    ]);

    // After components are in DOM, set up handlers
    markActivePage();
    bindMobileMenu();
    bindLangToggle();
    setFooterYear();
    updateLangLabel(lang);

    // Apply translations across the whole page (incl. injected components)
    applyTranslations(lang);

    // Animations
    bindScrollReveal();
  });
})();
