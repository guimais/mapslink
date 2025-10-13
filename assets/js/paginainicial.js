const navLinks = (window.MapsApp && typeof window.MapsApp.navLinks === 'function')
  ? window.MapsApp.navLinks()
  : Array.from(document.querySelectorAll('.nav-links a'));

const sectionIds = ['#home', '#sobre', '#planos', '#maps', '#profile', '#about', '#contact'];
const sections = sectionIds
  .map(id => document.querySelector(id))
  .filter(Boolean);

const linkByHash = new Map(navLinks.map(a => [a.getAttribute('href'), a]));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = `#${entry.target.id}`;
    if (window.MapsApp && typeof window.MapsApp.highlightNav === 'function') {
      window.MapsApp.highlightNav(id);
      return;
    }
    const link = linkByHash.get(id);
    if (!link) return;
    navLinks.forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  });
}, { root: null, threshold: 0.6 });

sections.forEach(sec => observer.observe(sec));

const cards = document.querySelectorAll('.card-sobre');

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'perspective(800px) translateY(28px) rotateX(8deg) scale(0.96)';
  card.style.transformOrigin = '50% 80%';
  card.style.willChange = 'transform, opacity';
});

function easeOutBack(t, s = 1.25) {
  return 1 + ((t -= 1) * t * ((s + 1) * t + s));
}

function animateCard(el, duration = 700, delay = 0) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    if (elapsed < delay) {
      requestAnimationFrame(step);
      return;
    }
    const p = Math.min(1, (elapsed - delay) / duration);
    const e = easeOutBack(p);
    const translateY = (1 - e) * 28;
    const rotateX = (1 - e) * 8;
    const scale = 0.96 + 0.08 * e;
    const opacity = p;
    el.style.opacity = String(opacity);
    el.style.transform = `perspective(800px) translateY(${translateY.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      el.style.transform = 'translateY(0)';
    }
  }
  requestAnimationFrame(step);
}

const cardsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const idx = [...cards].indexOf(el);
    const delay = idx * 120;
    animateCard(el, 700, delay);
    cardsObserver.unobserve(el);
  });
}, { threshold: 0.25 });

cards.forEach(c => cardsObserver.observe(c));

const maxTilt = 6;
cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    const rx = (-dy * maxTilt).toFixed(2);
    const ry = (dx * maxTilt).toFixed(2);
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(0)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
});

const floatIcons = document.querySelectorAll('.icones-flutuantes-grid .icone-flutuante');

if (floatIcons.length) {
  const floats = [...floatIcons].map(el => {
    el.style.willChange = 'transform';
    const amp = 6 + Math.random() * 6;
    const speed = 0.6 + Math.random() * 0.6;
    const phase = Math.random() * Math.PI * 2;
    return { el, amp, speed, phase };
  });

  let startFloat = null;
  function animateFloat(t) {
    if (startFloat == null) startFloat = t;
    const elapsed = (t - startFloat) / 1000;
    for (const f of floats) {
      const offsetY = Math.sin(elapsed * f.speed + f.phase) * f.amp;
      f.el.style.transform = `translateY(${offsetY.toFixed(2)}px)`;
    }
    requestAnimationFrame(animateFloat);
  }
  requestAnimationFrame(animateFloat);
}

