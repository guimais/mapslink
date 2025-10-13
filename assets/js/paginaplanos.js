(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function injectStyles() {
    if (document.getElementById('app-dynamic-styles')) return;
    const css = `
      [data-animate="fade-up"]{opacity:0;transform:translateY(8px);}
      .in-view{opacity:1;transform:none;transition:transform .6s ease, opacity .6s ease}
      .ripple-wrap{position:relative;overflow:hidden}
      .ripple{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;width:10px;height:10px;background:currentColor;opacity:.25;animation:ripple .6s ease-out}
      @keyframes ripple{from{opacity:.35;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-50%) scale(18)}}
      .snackbar{position:fixed;right:20px;bottom:20px;background:var(--brand,#102569);color:#fff;padding:12px 16px;border-radius:12px;box-shadow:var(--shadow-md,0 8px 18px rgba(16,37,105,.14));opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .3s, transform .3s;z-index:2000;display:flex;align-items:center;gap:10px;font-weight:700}
      .snackbar.show{opacity:1;transform:none;pointer-events:auto}
      .snackbar .close{background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer}
      .plan-selected{outline:2px solid var(--brand-2,#0b1b4a);box-shadow:0 0 0 4px rgba(16,37,105,.12)}
      .burst{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
      .burst span{position:absolute;width:8px;height:8px;border-radius:50%;opacity:.9}
    `;
    const style = document.createElement('style');
    style.id = 'app-dynamic-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function setupSectionRouting() {
    const links = (window.MapsApp && typeof window.MapsApp.navLinks === 'function')
      ? window.MapsApp.navLinks()
      : $$('.nav-link');
    const sectionIds = ['home', 'planos', 'maps', 'profile', 'about', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    const show = id => {
      sections.forEach(s => {
        const on = s.id === id;
        s.toggleAttribute('hidden', !on);
        if (on) {
          s.setAttribute('tabindex', '-1');
          try { s.focus({ preventScroll: true }); } catch {}
          s.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        const active = href === `#${id}`;
        a.classList.toggle('active', active);
        a.setAttribute('aria-current', active ? 'page' : 'false');
      });
      if (id) history.replaceState(null, '', `#${id}`);
      if (window.MapsApp && typeof window.MapsApp.highlightNav === 'function') {
        window.MapsApp.highlightNav(`#${id}`);
      }
    };

    links.forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        e.preventDefault();
        const id = href.slice(1);
        const target = document.getElementById(id);
        const targetHasContent = target && target.children && target.children.length > 0;
        if (id !== 'planos' && (!target || !targetHasContent)) {
          show('planos');
          showToast('Seção em construção');
        } else if (target) {
          show(id);
        }
        if (window.MapsApp && typeof window.MapsApp.closeNav === 'function') {
          window.MapsApp.closeNav();
        }
      });
    });

    const initialCandidate = (location.hash && location.hash.slice(1)) || 'planos';
    const initialEl = document.getElementById(initialCandidate);
    const initialHasContent = initialEl && initialEl.children && initialEl.children.length > 0;
    const initial = initialHasContent ? initialCandidate : 'planos';
    if (document.getElementById(initial)) show(initial);
  }

  function setupReveal() {
    if (prefersReducedMotion) return;
    const cards = $$('.plano-card');
    if (!cards.length) return;
    cards.forEach(el => el.setAttribute('data-animate', 'fade-up'));
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    cards.forEach(el => io.observe(el));
  }

  function attachRipple(selector = '.botao') {
    $$(selector).forEach(btn => {
      btn.classList.add('ripple-wrap');
      btn.addEventListener('click', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
        const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
        const span = document.createElement('span');
        span.className = 'ripple';
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
        btn.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
      });
    });
  }

  let snackbar;
  function ensureSnackbar() {
    if (snackbar) return snackbar;
    snackbar = document.createElement('div');
    snackbar.className = 'snackbar';
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');
    const text = document.createElement('span');
    text.className = 'snackbar-text';
    const close = document.createElement('button');
    close.className = 'close';
    close.setAttribute('aria-label', 'Fechar');
    close.innerHTML = '&times;';
    close.addEventListener('click', () => hideToast());
    snackbar.append(text, close);
    document.body.appendChild(snackbar);
    return snackbar;
  }

  function showToast(message, timeout = 2600) {
    const el = ensureSnackbar();
    el.querySelector('.snackbar-text').textContent = message;
    el.classList.add('show');
    if (showToast._t) clearTimeout(showToast._t);
    showToast._t = setTimeout(() => hideToast(), timeout);
  }

  function hideToast() {
    if (!snackbar) return;
    snackbar.classList.remove('show');
  }

  function burstFrom(el) {
    if (prefersReducedMotion) return;
    const colors = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#8338ec'];
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const group = document.createElement('div');
    group.className = 'burst';
    el.style.position = el.style.position || 'relative';
    el.appendChild(group);
    const n = 12;
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('span');
      dot.style.background = colors[i % colors.length];
      dot.style.left = `${cx}px`;
      dot.style.top = `${cy}px`;
      const angle = (i / n) * 2 * Math.PI;
      const dist = 20 + Math.random() * 32;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      dot.animate(
        [
          { transform: 'translate(-50%,-50%) translate(0,0)', opacity: 0.9 },
          { transform: `translate(-50%,-50%) translate(${tx}px,${ty}px)`, opacity: 0 }
        ],
        { duration: 700, easing: 'ease-out' }
      );
      group.appendChild(dot);
    }
    setTimeout(() => group.remove(), 720);
  }

  function setupPlans() {
    const buttons = $$('.botao.assinar');
    if (!buttons.length) return;
    const KEY = 'selectedPlan';

    const updateCard = (plan, selected) => {
      const btn = buttons.find(b => b.dataset.plan === plan);
      if (!btn) return;
      btn.textContent = selected ? 'Assinado' : 'Assinar';
      btn.disabled = !!selected;
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const card = btn.closest('.plano-card');
      if (card) card.classList.toggle('plan-selected', !!selected);
    };

    const saved = localStorage.getItem(KEY);
    if (saved) updateCard(saved, true);

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const plan = btn.dataset.plan;
        if (!plan) return;
        localStorage.setItem(KEY, plan);
        buttons.forEach(b => updateCard(b.dataset.plan, b.dataset.plan === plan));
        burstFrom(btn);
        const pretty = plan.charAt(0).toUpperCase() + plan.slice(1);
        const emoji = plan === 'gold' ? '🏆' : plan === 'silver' ? '🥈' : '🥉';
        showToast(`${emoji} Plano ${pretty} ativado!`);
      });
    });
  }

  function init() {
    injectStyles();
    setupSectionRouting();
    setupReveal();
    attachRipple('.botao');
    setupPlans();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

