(function () {
  const table = document.querySelector('.table-cv');
  if (!table) return;

  const tbody = table.tBodies[0];
  const rows = Array.from(tbody ? tbody.rows : []);

  const buscaInput = document.getElementById('busca-cv');
  const btnFiltrar = document.getElementById('btn-filtrar');
  const painel = document.getElementById('painel-filtro');
  const form = document.getElementById('form-filtros');
  const btnFechar = painel ? painel.querySelector('.filter-close') : null;
  const btnLimpar = document.getElementById('btn-limpar-filtros');
  let overlay = null;
  const diInput = document.getElementById('f-data-inicio');
  const dfInput = document.getElementById('f-data-fim');

  function maskDateBRInput(el) {
    let v = (el.value || '').replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) el.value = v.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    else if (v.length >= 3) el.value = v.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    else el.value = v;
  }

  function parseDateBR(str) {
    if (!str) return null;
    const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.getElementById('ui-backdrop');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ui-backdrop';
      overlay.className = 'ui-backdrop';
      document.body.appendChild(overlay);
    }
    overlay.addEventListener('click', fecharPainel);
    return overlay;
  }

  function parseDateFromRow(row) {
    const time = row.querySelector('td:nth-child(3) time');
    if (time && time.getAttribute('datetime')) return new Date(time.getAttribute('datetime'));
    const txt = row.querySelector('td:nth-child(3)')?.textContent?.trim() || '';
    const [d, m, y] = txt.split('/').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
    return null;
  }

  function norm(str) {
    return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function getFilters() {
    const status = document.getElementById('f-status')?.value || '';
    const vaga = norm(document.getElementById('f-vaga')?.value || '');
    const di = diInput?.value || '';
    const df = dfInput?.value || '';
    const busca = norm(buscaInput?.value || '');
    return { status, vaga, di, df, busca };
  }

  function rowMatches(row, f) {
    const nome = norm(row.querySelector('td:nth-child(1) .cell-text')?.textContent || '');
    const vagaTxt = norm(row.querySelector('td:nth-child(2)')?.textContent || '');
    const statusTxt = row.querySelector('td:nth-child(4) .status')?.textContent?.trim() || '';
    const data = parseDateFromRow(row);

    if (f.busca) {
      const hit = nome.includes(f.busca) || vagaTxt.includes(f.busca);
      if (!hit) return false;
    }

    if (f.vaga && !vagaTxt.includes(f.vaga)) return false;

    if (f.status && norm(statusTxt) !== norm(f.status)) return false;

    if (f.di || f.df) {
      const di = parseDateBR(f.di);
      const df = parseDateBR(f.df);
      if (di && data && data < di) return false;
      if (df && data && data > df) return false;
    }

    return true;
  }

  function aplicarFiltros() {
    const f = getFilters();
    rows.forEach(row => {
      row.style.display = rowMatches(row, f) ? '' : 'none';
    });
    const ativo = !!(f.status || f.vaga || f.di || f.df || f.busca);
    if (btnFiltrar) btnFiltrar.classList.toggle('active', ativo);
    try {
      localStorage.setItem('cvFilters', JSON.stringify(f));
    } catch {}
  }

  if (buscaInput) {
    buscaInput.addEventListener('input', aplicarFiltros);
  }

  if (diInput) diInput.addEventListener('input', () => maskDateBRInput(diInput));
  if (dfInput) dfInput.addEventListener('input', () => maskDateBRInput(dfInput));

  function positionPanel() {
    if (!painel || painel.hidden) return;
    const rect = btnFiltrar.getBoundingClientRect();
    const panelWidth = Math.min(520, window.innerWidth * 0.92);
    let top = rect.bottom + 10 + window.scrollY;
    let left = rect.right - panelWidth + window.scrollX;
    left = Math.max(16 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - panelWidth - 16));
    painel.style.width = panelWidth + 'px';
    painel.style.top = top + 'px';
    painel.style.left = left + 'px';
  }

  function abrirPainel() {
    if (!painel) return;
    ensureOverlay().classList.add('show');
    document.body.classList.add('is-filter-open');
    if (painel.parentElement !== document.body) {
      document.body.appendChild(painel);
    }
    painel.hidden = false;
    positionPanel();
    requestAnimationFrame(() => painel.classList.add('open'));
    btnFiltrar?.setAttribute('aria-expanded', 'true');
    const first = painel.querySelector('input,select,button');
    if (first) first.focus();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, { passive: true });
  }

  function fecharPainel() {
    if (!painel) return;
    ensureOverlay().classList.remove('show');
    document.body.classList.remove('is-filter-open');
    painel.classList.remove('open');
    setTimeout(() => {
      painel.hidden = true;
    }, 180);
    btnFiltrar?.setAttribute('aria-expanded', 'false');
    window.removeEventListener('resize', positionPanel);
    window.removeEventListener('scroll', positionPanel);
  }

  btnFiltrar?.addEventListener('click', e => {
    e.stopPropagation();
    if (painel.hidden) abrirPainel();
    else fecharPainel();
  });

  btnFechar?.addEventListener('click', fecharPainel);

  document.addEventListener('click', e => {
    if (!painel || painel.hidden) return;
    if (!painel.contains(e.target) && e.target !== btnFiltrar) fecharPainel();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharPainel();
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    aplicarFiltros();
    fecharPainel();
  });

  btnLimpar?.addEventListener('click', () => {
    form?.reset();
    aplicarFiltros();
  });

  try {
    const saved = JSON.parse(localStorage.getItem('cvFilters') || 'null');
    if (saved) {
      if (document.getElementById('f-status')) document.getElementById('f-status').value = saved.status || '';
      if (document.getElementById('f-vaga')) document.getElementById('f-vaga').value = saved.vaga || '';
      if (document.getElementById('f-data-inicio')) document.getElementById('f-data-inicio').value = saved.di || '';
      if (document.getElementById('f-data-fim')) document.getElementById('f-data-fim').value = saved.df || '';
      if (buscaInput) buscaInput.value = saved.busca || '';
      aplicarFiltros();
    }
  } catch {}
})();
