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

  if (buscaInput) buscaInput.addEventListener('input', aplicarFiltros);
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
    if (painel.parentElement !== document.body) document.body.appendChild(painel);
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

// Stub seguro: prepara agregacao de vagas, sem render automatico
(function () {
  if (window.__vagasSetup) return;
  window.__vagasSetup = true;

  async function prepareJobsData() {
    try {
      const data =
        window.__companies || (await loadJSON('/assets/data/companies.json'));
      const jobs = [];
      (data || []).forEach(c =>
        (c.jobs || []).forEach(j => {
          jobs.push({
            ...j,
            companyId: c.id,
            company: c.name,
            city: c.city,
            sector: c.sector
          });
        })
      );
      window.__jobs = jobs;
    } catch (e) {
      console.warn(e);
    }
  }

  // Disponibiliza para uso manual futuro; nao autoexecuta.
  window.prepareJobsData = prepareJobsData;
})();

(function () {
  const page = document.getElementById('vagas');
  if (!page) return;

  const table = document.querySelector('.table-cv');
  const tbody = table?.tBodies?.[0];
  const form = document.getElementById('form-vaga');
  const campoTitulo = document.getElementById('vaga-titulo');
  const campoArea = document.getElementById('vaga-area');
  const campoDescricao = document.getElementById('vaga-descricao');
  const campoTipo = document.getElementById('vaga-tipo');
  if (!table || !tbody || !form || !campoTitulo || !campoArea || !campoTipo) return;

  const LS_KEY = 'mapslink_vagas_v1';

  const pad2 = n => String(n).padStart(2, '0');
  const toDate = d => (d instanceof Date ? d : new Date(d));
  const formatDateBR = dt => {
    dt = toDate(dt);
    return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
  };
  const toISODate = dt => {
    dt = toDate(dt);
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  };

  let vagas = [];

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        vagas = JSON.parse(raw);
        return;
      }
    } catch {}
    vagas = Array.from(tbody.rows).map((tr, idx) => {
      const tds = tr.querySelectorAll('td');
      const titulo = (tds[0]?.textContent || '').trim();
      const area = (tds[1]?.textContent || '').trim();
      const tipo = (tds[2]?.textContent || '').trim();
      const timeEl = tr.querySelector('td:nth-child(4) time');
      const dataPub = timeEl?.getAttribute('datetime') || new Date().toISOString().slice(0, 10);
      const statusCell = tds[4] || tds[tds.length - 2];
      const statusTxt = (statusCell?.textContent || '').trim().toLowerCase();
      const status = statusTxt.includes('fechad') ? 'Fechada' : 'Aberta';
      return {
        id: `seed-${idx}-${Date.now()}`,
        titulo,
        area,
        tipo,
        descricao: '',
        dataPub,
        status
      };
    });
    save();
  }

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(vagas));
    } catch {}
  }

  function makeStatusBadge(status, id) {
    const span = document.createElement('span');
    span.className = 'status ' + (status === 'Fechada' ? 'status-fechada' : 'status-aberta');
    span.textContent = status;
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-pressed', status === 'Fechada' ? 'true' : 'false');
    span.title = 'Clique para alternar o status';
    span.dataset.id = id;
    return span;
  }

  function makeRemoveButton(id) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-small btn-danger remove-vaga';
    btn.dataset.id = id;
    btn.innerHTML = '<i class="ri-delete-bin-6-line" aria-hidden="true"></i> Remover';
    btn.setAttribute('aria-label', 'Remover vaga');
    return btn;
  }

  function render() {
    vagas.sort((a, b) => new Date(b.dataPub) - new Date(a.dataPub));
    tbody.innerHTML = '';
    for (const v of vagas) {
      const tr = document.createElement('tr');

      const tdTitulo = document.createElement('td');
      const strong = document.createElement('span');
      strong.className = 'cell-text';
      strong.textContent = v.titulo;
      tdTitulo.appendChild(strong);

      const tdArea = document.createElement('td');
      tdArea.textContent = v.area;

      const tdTipo = document.createElement('td');
      tdTipo.textContent = v.tipo;

      const tdData = document.createElement('td');
      const time = document.createElement('time');
      time.setAttribute('datetime', toISODate(new Date(v.dataPub)));
      time.textContent = formatDateBR(new Date(v.dataPub));
      tdData.appendChild(time);

      const tdStatus = document.createElement('td');
      const badge = makeStatusBadge(v.status, v.id);
      tdStatus.appendChild(badge);

      const tdAcoes = document.createElement('td');
      tdAcoes.appendChild(makeRemoveButton(v.id));

      tr.append(tdTitulo, tdArea, tdTipo, tdData, tdStatus, tdAcoes);
      tbody.appendChild(tr);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const titulo = (campoTitulo.value || '').trim();
    const area = (campoArea.value || '').trim();
    const tipo = (campoTipo.value || '').trim();
    const descricao = (campoDescricao?.value || '').trim();
    if (!titulo || !area || !tipo) {
      [campoTitulo, campoArea, campoTipo].find(el => !el.value.trim())?.focus();
      return;
    }
    const nova = {
      id: `vaga-${Date.now()}`,
      titulo,
      area,
      tipo,
      descricao,
      dataPub: new Date().toISOString().slice(0, 10),
      status: 'Aberta'
    };
    vagas.push(nova);
    save();
    render();
    form.reset();
    campoTitulo.focus();
  }

  function handleToggleStatus(e) {
    const el = e.target.closest('.status');
    if (!el) return;
    const id = el.dataset.id;
    const item = vagas.find(v => v.id === id);
    if (!item) return;
    item.status = item.status === 'Aberta' ? 'Fechada' : 'Aberta';
    save();
    render();
  }

  function handleToggleStatusKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    handleToggleStatus(e);
    e.preventDefault();
  }

  function handleRemove(e) {
    const btn = e.target.closest('.remove-vaga');
    if (!btn) return;
    const id = btn.dataset.id;
    const item = vagas.find(v => v.id === id);
    if (!item) return;
    if (confirm(`Remover a vaga "${item.titulo}"?`)) {
      vagas = vagas.filter(v => v.id !== id);
      save();
      render();
    }
  }

  load();
  render();

  form.addEventListener('submit', handleSubmit);
  tbody.addEventListener('click', handleToggleStatus);
  tbody.addEventListener('keydown', handleToggleStatusKey);
  tbody.addEventListener('click', handleRemove);
})();
