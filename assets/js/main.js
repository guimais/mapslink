const nav = document.querySelector('.nav-pilula');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-links a');
const toggleBtn = document.querySelector('.nav-toggle');

function smoothScrollTo(targetId) {
  const el = document.querySelector(targetId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Garante que só vamos adicionar o evento em links que levam para uma âncora (#)
    if (href && href.startsWith('#')) {
        link.addEventListener('click', (e) => {
            // Previne o comportamento padrão do link para não pular a página
            e.preventDefault();

            const targetId = link.getAttribute('href');
            // Chama a função que faz o scroll suave
            smoothScrollTo(targetId);
        });
    }
});

const contactSection = document.querySelector('#contact');
const linkByHash = new Map([...navLinks].map(a => [a.getAttribute('href'), a]));
if (contactSection) {
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.remove('active'));
      const contactLink = linkByHash.get('#contact');
      if (contactLink) contactLink.classList.add('active');
    });
  }, { threshold: 0.5 });
  contactObserver.observe(contactSection);
}

const originalShadow = getComputedStyle(nav).boxShadow;
function updateNavShadow() {
  nav.style.boxShadow = (window.scrollY > 8)
    ? '0 10px 26px rgba(0,0,0,0.12)'
    : originalShadow;
}
window.addEventListener('scroll', updateNavShadow);
updateNavShadow();

const toggleBtn = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('navMenu');

if (toggleBtn && navMenu) {
  const setIcon = (open) => {
    const icon = toggleBtn.querySelector('i');
    if (icon) icon.className = open ? 'ri-close-line' : 'ri-menu-line';
    toggleBtn.setAttribute('aria-expanded', String(open));
  };
  toggleBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    setIcon(open);
  });
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 560px)').matches) {
        navMenu.classList.remove('is-open');
        setIcon(false);
      }
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navMenu.classList.remove('is-open');
      setIcon(false);
    }
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 560px)').matches) {
      navMenu.classList.remove('is-open');
      setIcon(false);
    }
  });
}

const form = document.querySelector('.contact-form');
const inputs = form ? form.querySelectorAll('input, textarea') : [];
const textArea = form ? form.querySelector('textarea') : null;
const submitBtn = form ? form.querySelector('button[type="submit"], .botao') : null;

function autoResizeTA(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}
if (textArea) {
  autoResizeTA(textArea);
  textArea.addEventListener('input', () => autoResizeTA(textArea));
}

inputs.forEach(el => {
  const setState = () => el.classList.toggle('is-filled', !!el.value.trim());
  el.addEventListener('input', setState);
  el.addEventListener('blur', setState);
  setState();
});

function ripple(e, target) {
  const rect = target.getBoundingClientRect();
  const d = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - d / 2;
  const y = e.clientY - rect.top - d / 2;
  const circle = document.createElement('span');
  Object.assign(circle.style, {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
    width: d + 'px',
    height: d + 'px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,.35)',
    transform: 'scale(0)',
    pointerEvents: 'none',
    transition: 'transform 400ms ease, opacity 600ms ease'
  });
  target.style.position = 'relative';
  target.style.overflow = 'hidden';
  target.appendChild(circle);
  requestAnimationFrame(() => (circle.style.transform = 'scale(1)'));
  setTimeout(() => { circle.style.opacity = '0'; }, 320);
  setTimeout(() => { circle.remove(); }, 800);
}

if (form && submitBtn) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = String(data.get('nome') || '').trim();
    const sobrenome = String(data.get('sobrenome') || '').trim();
    const email = String(data.get('email') || '').trim();
    const msg = String(data.get('mensagem') || '').trim();

    const errors = [];
    if (!nome) errors.push('Nome');
    if (!sobrenome) errors.push('Sobrenome');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('E-mail');
    if (msg.length < 5) errors.push('Mensagem');

    if (errors.length) {
      submitBtn.classList.add('shake');
      setTimeout(() => submitBtn.classList.remove('shake'), 400);
      showToast('Corrija: ' + errors.join(', ') + ' ⚠️');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.8';
    submitBtn.textContent = 'Enviando...';

    setTimeout(() => {
      showToast('Mensagem enviada com sucesso! ✅');
      form.reset();
      inputs.forEach(el => el.classList.remove('is-filled'));
      if (textArea) autoResizeTA(textArea);
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.textContent = 'Enviar';
    }, 900);
  });

  submitBtn.addEventListener('click', (e) => ripple(e, submitBtn));
}

Afunction showToast(text) {
  const t = document.createElement('div');
  t.textContent = text;
  Object.assign(t.style, {
    position: 'fixed',
    left: '50%',
    bottom: '28px',
    transform: 'translateX(-50%)',
    background: 'rgba(16,37,105,.95)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '12px',
    boxShadow: '0 8px 18px rgba(0,0,0,.18)',
    fontWeight: '700',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity .25s ease, transform .25s ease'
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform += ' translateY(-6px)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => t.remove(), 250);
  }, 2200);
}

(() => {
  const el = document.querySelector('.contact-card');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity .4s ease, transform .4s ease';
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      io.disconnect();
    });
  }, { threshold: 0.2 });
  io.observe(el);

(function highlightAbout() {
  const current = location.pathname.split('/').pop() || '';
  let target = null;
  target = [...navLinks].find(a =>
    (a.getAttribute('href') || '').includes('about.html')) ||
    [...navLinks].find(a =>
      (a.getAttribute('href') || '') === '#about');
  if (target) {
    navLinks.forEach(a => a.classList.remove('active'));
    target.classList.add('active');
  }
})();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealEls = document.querySelectorAll(
  '.about-container p, .about-container h3, .about-cta'
);

revealEls.forEach((el, idx) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
  el.style.transition = reduceMotion
    ? 'opacity .3s ease'
    : 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)';
  el.style.willChange = 'opacity, transform';
  el.dataset.stagger = String(idx);
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = reduceMotion ? 0 : Math.min(10, Number(el.dataset.stagger) * 40);
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.willChange = 'auto';
    }, delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObs.observe(el));

(function mountReadingProgress() {
  const container = document.querySelector('.about-container');
  if (!container) return;

  const bar = document.createElement('div');
  bar.id = 'readingProgress';
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '3px',
    width: '0%',
    background: '#000',
    zIndex: '1500',
    transformOrigin: '0 50%',
    transition: reduceMotion ? 'none' : 'width .15s linear'
  });
  document.body.appendChild(bar);

  function updateProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? (window.scrollY / docH) : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
