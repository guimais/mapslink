(async function () {
  async function fetchCompanies() {
    const response = await fetch('/assets/data/companies.json', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error('Falha ao carregar companies.json');
    }
    return response.json();
  }

  try {
    const data = await fetchCompanies();
    window.__companies = data;
    console.log('Companies loaded:', data.length);
    window.applyFilters = function (filters) {
      const result = MapsFilters.filterCompanies(window.__companies, filters);
      console.log('Filtered companies:', result);
      return result;
    };
  } catch (err) {
    console.warn('Erro ao carregar companies.json:', err);
  }
})();
