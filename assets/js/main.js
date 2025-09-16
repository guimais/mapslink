(function () {
  const page = document.getElementById('envio-cv');
  if (!page) return;

  const table = page.querySelector('.table-empresa');
  const thead = table?.tHead;
  const tbody = table?.tBodies?.[0];
  if (!table || !thead || !tbody) return;

  const empresaTituloEl = document.getElementById('empresa-titulo');
  const empresaNome = (empresaTituloEl?.textContent || 'empresa').trim();

  const searchInput = page.querySelector('.search-input input');
  const live = createLiveRegion();
  document.body.appendChild(live);

  const slugify = (s) =>
    (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const LS_KEY = `mapslink_envio_cv_${slugify(empresaNome)}_v1`;
  const LS_SORT = `${LS_KEY}_sort`;

  /** @type {Set<string>} */
  let applied = new Set();

  function createLiveRegion() {
    const el = document.createElement('div');
    el.className = 'sr-only';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    return el;
  }
  function announce(msg) {
    live.textContent = '';
    setTimeout(() => (live.textContent = msg), 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) applied = new Set(JSON.parse(raw));
    } catch {}
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify([...applied])); } catch {}
  }

  function ensureRowIds() {
    [...tbody.rows].forEach((tr, idx) => {
      const btn = tr.querySelector('.prestar-vaga');
      if (!btn) return;
      if (!btn.dataset.id) {
        const titulo = tr.querySelector('td:first-child .cell-text')?.textContent?.trim() || `vaga-${idx+1}`;
        const modelo = tr.querySelector('td:nth-child(3)')?.textContent?.trim() || '';
        btn.dataset.id = `${slugify(empresaNome)}-${slugify(titulo)}-${slugify(modelo)}-${idx}`;
      }
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-pressed', 'false');
    });
  }

  function markAsApplied(btn, titulo) {
    btn.classList.add('btn-prestado');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('disabled', 'true');
    btn.innerHTML = `<i class="ri-check-line" aria-hidden="true"></i> Aplicado`;
    btn.title = titulo ? `Você já se candidatou a "${titulo}"` : 'Você já se candidatou';
  }

  function unmark(btn, titulo) {
    btn.classList.remove('btn-prestado');
    btn.removeAttribute('disabled');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `<i class="ri-send-plane-2-line" aria-hidden="true"></i> Prestar Vaga`;
    btn.title = titulo ? `Enviar currículo para "${titulo}"` : 'Enviar currículo';
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
        unmark(btn, titulo);
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
    announce(`Currículo enviado para "${titulo}".`);
  }

  function handleKeydown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('prestar-vaga')) {
      e.preventDefault();
      handleApplyClick(e);
    }
  }

  function debounce(fn, ms=250){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); }; }

  function filterRows(query) {
    const q = (query || '').trim().toLowerCase();
    let visible = 0;
    [...tbody.rows].forEach(tr => {
      const t1 = tr.cells[0]?.innerText?.toLowerCase() || '';
      const t2 = tr.cells[1]?.innerText?.toLowerCase() || '';
      const t3 = tr.cells[2]?.innerText?.toLowerCase() || '';
      const match = !q || t1.includes(q) || t2.includes(q) || t3.includes(q);
      tr.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    updateCounter(visible);
    announce(visible ? `${visible} vaga(s) encontrada(s)` : `Nenhuma vaga encontrada`);
  }

  function updateCounter(count) {
    let badge = page.querySelector('#result-count');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'result-count';
      badge.style.margin = '8px 0 0';
      badge.style.fontSize = '13px';
      badge.style.fontWeight = '800';
      badge.style.color = 'var(--muted)';
      page.querySelector('.actions-bar')?.appendChild(badge);
    }
    badge.textContent = `${count} resultado(s)`;
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e)=>{
      filterRows(e.target.value);
      const wrapper = page.querySelector('.table-wrapper');
      if (wrapper) wrapper.scrollTop = 0;
    }, 200));
  }

  const sortState = loadSortState();
  initHeadSort();
  if (sortState) applySort(sortState.index, sortState.dir);

  function initHeadSort(){
    [...thead.rows[0].cells].forEach((th, index) => {
      const isActions = index === thead.rows[0].cells.length - 1;
      if (isActions) return;

      th.style.cursor = 'pointer';
      th.tabIndex = 0;
      th.setAttribute('role','columnheader');
      th.setAttribute('aria-sort','none');

      const label = th.textContent.trim();
      th.title = `Ordenar por ${label}`;

      const triggerSort = () => {
        const dir = toggleDir(th.getAttribute('aria-sort'));
        [...thead.rows[0].cells].forEach((oth, i)=>{
          if (i!==index) oth.setAttribute('aria-sort','none');
        });
        th.setAttribute('aria-sort', dir);
        applySort(index, dir);
        saveSortState(index, dir);
      };

      th.addEventListener('click', triggerSort);
      th.addEventListener('keydown', (e)=>{
        if (e.key==='Enter' || e.key===' ') { e.preventDefault(); triggerSort(); }
      });
    });
  }

  function toggleDir(state){
    if (state==='ascending') return 'descending';
    return 'ascending';
  }

  function applySort(colIndex, dir='ascending'){
    const rows = [...tbody.rows].filter(r => r.style.display !== 'none'); // respeita filtro
    rows.sort((a,b)=>{
      const ta = (a.cells[colIndex]?.innerText || '').trim().toLowerCase();
      const tb = (b.cells[colIndex]?.innerText || '').trim().toLowerCase();
      if (ta < tb) return dir==='ascending' ? -1 : 1;
      if (ta > tb) return dir==='ascending' ? 1 : -1;
      return 0;
    });
    rows.forEach(r => tbody.appendChild(r));
    [...tbody.rows].filter(r => r.style.display === 'none').forEach(r => tbody.appendChild(r));
  }

  function saveSortState(index, dir){
    try { localStorage.setItem(LS_SORT, JSON.stringify({index, dir})); } catch {}
  }
  function loadSortState(){
    try {
      const raw = localStorage.getItem(LS_SORT);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  let resetTimer = null;
  window.addEventListener('keydown', (e)=>{
    if (e.key.toLowerCase()==='r' && e.altKey) {
      if (resetTimer) return;
      resetTimer = setTimeout(()=>{
        const ok = confirm(`Limpar histórico de vagas aplicadas para "${empresaNome}"?`);
        if (ok) {
          applied.clear();
          save();
          updateButtonsState();
          announce('Histórico de aplicações limpo.');
        }
        resetTimer = null;
      }, 1000); 
    }
  });
  window.addEventListener('keyup', ()=>{
    if (resetTimer){ clearTimeout(resetTimer); resetTimer = null; }
  });

  load();
  ensureRowIds();
  updateButtonsState();
  filterRows(searchInput?.value || '');

  tbody.addEventListener('click', handleApplyClick);
  tbody.addEventListener('keydown', handleKeydown);
})();
