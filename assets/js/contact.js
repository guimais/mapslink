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
  form.addEventListener('submit', e => {
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

  submitBtn.addEventListener('click', e => ripple(e, submitBtn));
}

(() => {
  const el = document.querySelector('.contact-card');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity .4s ease, transform .4s ease';
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      io.disconnect();
    });
  }, { threshold: 0.2 });
  io.observe(el);
})();
