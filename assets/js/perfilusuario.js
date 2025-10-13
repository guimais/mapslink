(() => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const header = $('.nav-container');

  const navLinksAll = (window.MapsApp && typeof window.MapsApp.navLinks === 'function')
    ? window.MapsApp.navLinks()
    : $$('.nav-link');

  const highlightNav = target => {
    if (window.MapsApp && typeof window.MapsApp.highlightNav === 'function') {
      window.MapsApp.highlightNav(target);
      return true;
    }
    return false;
  };

  const closeMenu = () => {
    if (window.MapsApp && typeof window.MapsApp.closeNav === 'function') {
      window.MapsApp.closeNav();
    }
  };

  const toggleMenu = () => {
    if (window.MapsNav && typeof window.MapsNav.toggle === 'function') {
      window.MapsNav.toggle();
    }
  };

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 6) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navLinksAll
    .filter(a => (a.getAttribute('href') || '').startsWith('#'))
    .forEach(a => {
      a.addEventListener('click', e => {
        const hash = a.getAttribute('href');
        const target = hash ? document.querySelector(hash) : null;
        if (!target) return;
        e.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', hash);
    });
    });

  const markActiveByPath = () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    if (highlightNav(path)) return;
    navLinksAll.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      const normalized = href.split('?')[0];
      link.classList.toggle('active', normalized === path);
    });
  };

  const sectionLinks = navLinksAll.filter(a => (a.getAttribute('href') || '').startsWith('#'));
  const sectionIds = ['#home', '#planos', '#maps', '#profile', '#about', '#contact'];
  const sections = sectionIds.map(id => $(id)).filter(Boolean);

  if (sectionLinks.length && sections.length) {
    const map = new Map(sectionLinks.map(l => [l.getAttribute('href'), l]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        if (highlightNav(id)) return;
        sectionLinks.forEach(l => l.classList.remove('active'));
        map.get(id)?.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0.01 });
    sections.forEach(sec => io.observe(sec));
    const start = location.hash && map.get(location.hash) ? location.hash : '#profile';
    if (!highlightNav(start)) {
      map.get(start)?.classList.add('active');
    }
  } else {
    markActiveByPath();
  }

  const toast = (() => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed',
      left: '50%',
      bottom: '28px',
      transform: 'translateX(-50%)',
      background: 'rgba(16,37,105,.98)',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '10px',
      fontSize: '14px',
      boxShadow: '0 8px 18px rgba(0,0,0,.18)',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity .2s ease',
      zIndex: '9999'
    });
    document.body.appendChild(el);
    let t;
    return msg => {
      clearTimeout(t);
      el.textContent = msg;
      el.style.opacity = '1';
      t = setTimeout(() => (el.style.opacity = '0'), 1400);
    };
  })();

  const toCopy = a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('mailto:')) return href.replace(/^mailto:/, '');
    if (href.startsWith('tel:')) return href.replace(/^tel:/, '');
    return a.textContent.trim();
  };

  $$('.perfil-contatos a').forEach(a => {
    a.addEventListener('click', async e => {
      try {
        const text = toCopy(a);
        await navigator.clipboard.writeText(text);
        toast('Copiado: ' + text);
        if (a.href.startsWith('http')) {
          e.preventDefault();
          window.open(a.href, '_blank', 'noopener');
        }
      } catch {
        toast('Não foi possível copiar');
      }
    });
  });

  const revealTargets = $$('.card, .bloco, .curriculo-card');
  if (revealTargets.length) {
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'opacity .35s ease, transform .35s ease';
    });
    const revealer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => revealer.observe(el));
  }

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMenu();
    }
  });
})();

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
    if (!cards.length) return;

    var prefersReduced = false;
    try {
      prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {}

    var style = document.createElement('style');
    style.id = 'cards-anim-styles';
    style.textContent = [
      '.js-card-hover{transition:transform .18s ease, box-shadow .18s ease, opacity .32s ease;}',
      '.js-card-init{opacity:0;transform:translateY(14px);}',
      '.js-card-in{opacity:1;transform:translateY(0);}',
      '.js-card-in.js-card-elevate:hover{transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,.08)!important;}',
      '.js-card-pressed{transform:translateY(0) scale(.995)!important;}'
    ].join('');
    document.head.appendChild(style);

    cards.forEach(function (el) {
      el.classList.add('js-card-hover', 'js-card-elevate');
      if (!prefersReduced) el.classList.add('js-card-init');
      el.addEventListener('pointerdown', function () { el.classList.add('js-card-pressed'); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
        el.addEventListener(evt, function () { el.classList.remove('js-card-pressed'); });
      });
    });

    if (prefersReduced) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('js-card-in');
          entry.target.classList.remove('js-card-init');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    cards.forEach(function (el) { obs.observe(el); });
  });
})();

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var minis = Array.prototype.slice.call(document.querySelectorAll('.curriculo-experiencias li'));
    if (!minis.length) return;

    var prefersReduced = false;
    try { prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}

    var styleId = 'mini-cards-anim-styles';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = [
        '.js-mini{transition:transform .2s ease, box-shadow .25s ease, opacity .35s ease, background-position .25s ease; position:relative; overflow:hidden;}',
        '.js-mini-light{background-image: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.10), rgba(255,255,255,0) 45%); background-repeat:no-repeat;}',
        '.js-mini-init{opacity:0; transform:translateX(12px);}',
        '.js-mini-in{opacity:1; transform:none;}',
        '.js-mini:hover{transform:translateY(-2px); box-shadow:0 12px 26px rgba(0,0,0,.22);}',
        '.js-mini-press{transform:translateY(0) scale(.995)!important;}'
      ].join('');
      document.head.appendChild(style);
    }

    minis.forEach(function (el, idx) {
      el.classList.add('js-mini');
      el.classList.add('js-mini-light');
      if (!prefersReduced) el.classList.add('js-mini-init');
      el.dataset.idx = idx;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = Math.round(e.clientX - r.left);
        var y = Math.round(e.clientY - r.top);
        el.style.setProperty('--mx', x + 'px');
        el.style.setProperty('--my', y + 'px');
      });

      el.addEventListener('pointerdown', function () { el.classList.add('js-mini-press'); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
        el.addEventListener(evt, function () { el.classList.remove('js-mini-press'); });
      });
    });

    if (prefersReduced) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = (parseInt(el.dataset.idx || '0', 10) % 8) * 70;
        setTimeout(function () {
          el.classList.add('js-mini-in');
          el.classList.remove('js-mini-init');
        }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    minis.forEach(function (el) { obs.observe(el); });
  });
})();
