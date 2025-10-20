(() => {
  if (window.__ml_vagas_init__) return;
  window.__ml_vagas_init__ = true;

  async function loadCompanies() {
    if (Array.isArray(window.__companies) && window.__companies.length) return window.__companies;
    const response = await fetch("/assets/data/companies.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar companies.json");
    const data = await response.json();
    window.__companies = Array.isArray(data) ? data : [];
    return window.__companies;
  }

  function collectJobs(list) {
    window.__jobs = [];
    list.forEach(company => {
      (company.jobs || []).forEach(job => {
        window.__jobs.push({
          ...job,
          company: company.name,
          city: company.city,
          sector: company.sector
        });
      });
    });
  }

  function filterJobs(filters) {
    if (!window.MapsFilters || typeof window.MapsFilters.filterCompanies !== "function") return [];
    const companies = window.MapsFilters.filterCompanies(window.__companies || [], filters);
    return companies.flatMap(company =>
      (company.jobs || []).map(job => ({
        ...job,
        company: company.name,
        city: company.city,
        sector: company.sector
      }))
    );
  }

  (async () => {
    try {
      const companies = await loadCompanies();
      collectJobs(companies);
      window.filterJobs = filterJobs;
    } catch (error) {
      console.warn("Erro ao carregar jobs:", error);
    }
  })();
})();
