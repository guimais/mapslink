const nav = document.querySelector('.nav-pilula');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-links a');
const toggleBtn = document.querySelector('.nav-toggle');
const navLinksArr = Array.from(navLinks);

function smoothScrollTo(targetId) {
  const el = document.querySelector(targetId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

navLinksArr.forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      smoothScrollTo(targetId);
    });
  }
});

const originalShadow = nav ? getComputedStyle(nav).boxShadow : '';
function updateNavShadow() {
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 8 ? '0 10px 26px rgba(0,0,0,0.12)' : originalShadow;
}
window.addEventListener('scroll', updateNavShadow);
updateNavShadow();

if (toggleBtn && navMenu) {
  const setIcon = open => {
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
  document.addEventListener('keydown', e => {
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

function showToast(text) {
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

(function highlightAbout() {
  const target =
    navLinksArr.find(a => (a.getAttribute('href') || '').includes('about.html')) ||
    navLinksArr.find(a => (a.getAttribute('href') || '') === '#about');
  if (target) {
    navLinksArr.forEach(a => a.classList.remove('active'));
    target.classList.add('active');
  }
})();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealEls = document.querySelectorAll('.about-container p, .about-container h3, .about-cta');

revealEls.forEach((el, idx) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
  el.style.transition = reduceMotion
    ? 'opacity .3s ease'
    : 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)';
  el.style.willChange = 'opacity, transform';
  el.dataset.stagger = String(idx);
});

const revealObs = new IntersectionObserver(entries => {
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
    const p = docH > 0 ? window.scrollY / docH : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
