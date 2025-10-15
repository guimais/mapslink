(function () {
  function filterCompanies(data, filters = {}) {
    const q = (filters.q || '').toLowerCase();
    const city = filters.city || '';
    const sector = filters.sector || '';
    return (data || []).filter(c => {
      const byCity = !city || c.city === city;
      const bySector = !sector || c.sector === sector;
      const byText =
        !q ||
        [
          c.name || '',
          c.sector || '',
          c.city || '',
          ...(c.tags || []),
          ...(c.jobs || []).map(j => j.title || '')
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return byCity && bySector && byText;
    });
  }

  function uniqueValues(list, key) {
    return [...new Set((list || []).map(i => i[key]).filter(Boolean))];
  }

  window.MapsFilters = { filterCompanies, uniqueValues };
})();
