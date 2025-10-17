(async function () {
  "use strict";

  if (window.__ml_vagas_init__) return;
  window.__ml_vagas_init__ = true;

  async function fetchCompanies() {
    const response = await fetch("/assets/data/companies.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar companies.json");
    return response.json();
  }

  try {
    const data = Array.isArray(window.__companies) ? window.__companies : await fetchCompanies();

    if (!Array.isArray(window.__jobs)) window.__jobs = [];
    else window.__jobs.length = 0;

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

    console.log("Jobs loaded:", window.__jobs.length);

    window.filterJobs = function (filters) {
      if (!window.MapsFilters || typeof window.MapsFilters.filterCompanies !== "function") {
        console.warn("MapsFilters.filterCompanies não disponível; retornando lista vazia.");
        return [];
      }
      const result = window.MapsFilters
        .filterCompanies(data, filters)
        .flatMap(company =>
          (company.jobs || []).map(job => ({
            ...job,
            company: company.name,
            city: company.city,
            sector: company.sector
          }))
        );
      console.log("Filtered jobs:", result);
      return result;
    };
  } catch (err) {
    console.warn("Erro ao carregar jobs:", err);
  }
})();
