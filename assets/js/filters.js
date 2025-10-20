(() => {
  const ACCENTS = /[\u0300-\u036f]/g;

  function normalize(value) {
    return (value ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(ACCENTS, "");
  }

  function toArray(value) {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
  }

  function industryOf(company) {
    return company?.industry ?? company?.sector ?? "";
  }

  function collectTags(company) {
    return toArray(company?.tags).map(normalize);
  }

  function collectWorkModes(company) {
    return toArray(company?.work_modes ?? company?.workModes).map(normalize);
  }

  function collectBlob(company) {
    const jobs = toArray(company?.jobs).map(job =>
      typeof job === "string" ? job : job?.title || ""
    );
    return [
      company?.name,
      industryOf(company),
      company?.city,
      company?.state,
      company?.size ?? company?.company_size,
      ...toArray(company?.work_modes ?? company?.workModes),
      ...toArray(company?.tags),
      ...jobs
    ]
      .filter(Boolean)
      .join(" ");
  }

  function parseBoolean(value) {
    if (value == null) return null;
    if (typeof value === "boolean") return value;
    return value.toString().toLowerCase() === "true";
  }

  function filterCompanies(list = [], filters = {}) {
    const query = normalize(filters.q || filters.search || "");
    const location = normalize(filters.location || "");
    const city = normalize(filters.city || "");
    const state = normalize(filters.state || "");
    const industries = toArray(filters.industries || filters.industry || filters.sector).map(normalize).filter(Boolean);
    const sizes = toArray(filters.sizes || filters.size || filters.companySize).map(normalize).filter(Boolean);
    const workModes = toArray(filters.workModes || filters.workMode || filters.modalities).map(normalize).filter(Boolean);
    const tags = toArray(filters.tags).map(normalize).filter(Boolean);
    const wantsHiring = parseBoolean(filters.isHiring);

    return list.filter(company => {
      const companyCity = normalize(company?.city);
      const companyState = normalize(company?.state);
      const companyIndustry = normalize(industryOf(company));
      const companySize = normalize(company?.size ?? company?.company_size);
      const companyModes = collectWorkModes(company);
      const companyTags = collectTags(company);

      const matchesLocation =
        !location ||
        companyCity.includes(location) ||
        companyState.includes(location) ||
        normalize(`${company?.city} ${company?.state}`).includes(location);

      if (!matchesLocation) return false;
      if (city && companyCity !== city) return false;
      if (state && companyState !== state) return false;
      if (industries.length && !industries.includes(companyIndustry)) return false;
      if (sizes.length && !sizes.includes(companySize)) return false;
      if (workModes.length && !workModes.every(mode => companyModes.includes(mode))) return false;

      if (wantsHiring != null && Boolean(company?.is_hiring) !== wantsHiring) return false;
      if (tags.length && !tags.every(tag => companyTags.includes(tag))) return false;
      if (query && !normalize(collectBlob(company)).includes(query)) return false;

      return true;
    });
  }

  function uniqueValues(list = [], key) {
    const values = list.flatMap(item => {
      if (!item) return [];
      if (key === "industry" || key === "sector") return [industryOf(item)];
      const value = item[key];
      if (Array.isArray(value)) return value;
      return value != null ? [value] : [];
    });
    const seen = new Map();
    values.forEach(value => {
      const normalized = normalize(value);
      if (!seen.has(normalized)) seen.set(normalized, value);
    });
    try {
      return Array.from(seen.values()).sort((a, b) => a.toString().localeCompare(b.toString(), "pt-BR"));
    } catch {
      return Array.from(seen.values()).sort();
    }
  }

  function buildFilterOptions(list = []) {
    return {
      cities: uniqueValues(list, "city"),
      states: uniqueValues(list, "state"),
      industries: uniqueValues(list, "industry"),
      sizes: uniqueValues(list, "size"),
      workModes: uniqueValues(list, "work_modes"),
      tags: uniqueValues(list, "tags")
    };
  }

  window.MapsFilters = {
    filterCompanies,
    uniqueValues,
    buildFilterOptions
  };
})();
