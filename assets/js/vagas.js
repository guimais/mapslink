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
    const data = window.__companies || (await fetchCompanies());
    window.__jobs = [];
    (data || []).forEach(company => {
      (company.jobs || []).forEach(job => {
        window.__jobs.push({
          ...job,
          company: company.name,
          city: company.city,
          sector: company.sector
        });
      });
    });
    console.log('Jobs loaded:', window.__jobs.length);
    window.filterJobs = function (filters) {
      const result = MapsFilters.filterCompanies(data, filters).flatMap(
        company =>
          (company.jobs || []).map(job => ({
            ...job,
            company: company.name,
            city: company.city,
            sector: company.sector
          }))
      );
      console.log('Filtered jobs:', result);
      return result;
    };
  } catch (err) {
    console.warn('Erro ao carregar jobs:', err);
  }
})();
