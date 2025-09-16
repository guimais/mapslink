(function () {
  const page = document.getElementById('envio-cv');
  if (!page) return;

  const table = document.querySelector('.table-empresa');
  const tbody = table?.tBodies?.[0];
  if (!table || !tbody) return;

  const empresaTituloEl = document.getElementById('empresa-titulo');
  const empresaNome = (empresaTituloEl?.textContent || 'empresa').trim();

  function slugify(s) {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const LS_KEY = `mapslink_envio_cv_${slugify(empresaNome)}_v1`;

  /** @type {Set<string>} */
  let applied = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) applied = new Set(JSON.parse(raw));
    } catch {}
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify([...applied])); } catch {}
  }

  function markAsApplied(btn, titulo) {
    btn.classList.add('btn-prestado');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('disabled', 'true');
    btn.textContent = 'Aplicado';
    btn.title = titulo ? `Você já se candidatou a "${titulo}"` : 'Você já se candidatou';
  }

  function updateButtonsState() {
    const buttons = tbody.querySelectorAll('.prestar-vaga');
    buttons.forEach(btn => {
      const id = btn.dataset.id || '';
      const tr = btn.closest('tr');
      const titulo = tr?.querySelector('td:first-child .cell-text')?.textContent?.trim() || '';
      if (applied.has(id)) {
        markAsApplied(btn, titulo);
      } else {
        btn.classList.remove('btn-prestado');
        btn.removeAttribute('disabled');
        btn.setAttribute('aria-pressed', 'false');
        btn.innerHTML = '<i class="ri-send-plane-2-line" aria-hidden="true"></i> Prestar Vaga';
        btn.title = titulo ? `Enviar currículo para "${titulo}"` : 'Enviar currículo';
      }
    });
  }

  function handleApplyClick(e) {
    const btn = e.target.closest('.prestar-vaga');
    if (!btn) return;

    const id = btn.dataset.id || '';
    if (!id) return;

    if (applied.has(id)) return; 

    const tr = btn.closest('tr');
    const titulo = tr?.querySelector('td:first-child .cell-text')?.textContent?.trim() || '';
    const modelo = tr?.querySelector('td:nth-child(3)')?.textContent?.trim() || '';

    const ok = confirm(
      titulo
        ? `Confirmar envio de currículo para a vaga "${titulo}" (${empresaNome}, ${modelo || '—'})?`
        : 'Confirmar envio de currículo para esta vaga?'
    );
    if (!ok) return;

    applied.add(id);
    save();
    markAsApplied(btn, titulo);
  }

  function handleKeydown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('prestar-vaga')) {
      e.preventDefault();
      handleApplyClick(e);
    }
  }

  load();
  updateButtonsState();

  tbody.addEventListener('click', handleApplyClick);
  tbody.addEventListener('keydown', handleKeydown);
})();
