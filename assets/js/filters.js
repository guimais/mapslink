// Logica pura de filtros (sem mexer no DOM/UI)
(function () {
  function filterCompanies(data, { city, sector, q } = {}) {
    const QQ = (q || '').toLowerCase();
    return (data || []).filter(c => {
      const okCity = !city || c.city === city;
      const okSector = !sector || c.sector === sector;
      const corpus = [
        c.name || '',
        (c.tags || []).join(' '),
        ...(c.jobs || []).map(j => j.title || '')
      ]
        .join(' ')
        .toLowerCase();
      const okText = !QQ || corpus.includes(QQ);
      return okCity && okSector && okText;
    });
  }

  function unique(list, key) {
    return [...new Set((list || []).map(i => i[key]).filter(Boolean))];
  }

  window.MapsFilters = { filterCompanies, unique };
})();
