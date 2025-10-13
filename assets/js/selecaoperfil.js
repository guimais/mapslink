(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const nav = $('.nav-pilula');

  const onScroll = () => {
    if (!nav) return;
    const scrolled = window.scrollY > 8;
    nav.dataset.scrolled = scrolled ? '1' : '0';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = (window.MapsApp && typeof window.MapsApp.navLinks === 'function')
    ? window.MapsApp.navLinks()
    : $$('.nav-link');

  const markActive = () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    if (window.MapsApp && typeof window.MapsApp.highlightNav === 'function') {
      window.MapsApp.highlightNav(path);
      return;
    }
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const isHashOnly = href.startsWith('#');
      const matches =
        (!isHashOnly && href.endsWith(path)) ||
        (path === 'index.html' && href.includes('#home'));
      a.classList.toggle('active', !!matches);
    });
  };
  markActive();

  const PERFIL_KEY = 'mapslink:perfil';

  const escolherPerfil = tipo => {
    try {
      localStorage.setItem(PERFIL_KEY, tipo);
    } catch {}
    const destino = tipo === 'empresarial' ? 'loginempresa.html' : 'loginpessoal.html';
    window.location.href = destino;
  };

  const btnEmp = $('[data-action="escolher-empresarial"]');
  const btnPes = $('[data-action="escolher-pessoal"]');
  if (btnEmp) btnEmp.addEventListener('click', () => escolherPerfil('empresarial'));
  if (btnPes) btnPes.addEventListener('click', () => escolherPerfil('pessoal'));

  $$('.perfil-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', e => {
      if (e.target.closest('.perfil-cta')) return;
      const tipo = card.dataset.perfil === 'empresarial' ? 'empresarial' : 'pessoal';
      escolherPerfil(tipo);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tipo = card.dataset.perfil === 'empresarial' ? 'empresarial' : 'pessoal';
        escolherPerfil(tipo);
      }
    });
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    document.documentElement.style.setProperty('--ml-motion-scale', '0');
  } else {
    document.documentElement.style.setProperty('--ml-motion-scale', '1');
  }
})();
