(function () {
  function _norm(v) {
    return (v ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  function _arr(v) {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }
  function _getIndustry(c) {
    return c.industry ?? c.sector ?? "";
  }
  function filterCompanies(data, filters = {}) {
    const q = _norm(filters.q || "");
    const city = _norm(filters.city || "");
    const state = _norm(filters.state || "");
    const industry = _norm(filters.industry || filters.sector || "");
    const isHiringRaw = filters.isHiring;
    const wantHiring =
      typeof isHiringRaw === "string"
        ? isHiringRaw.toLowerCase() === "true"
        : !!isHiringRaw;
    const tagsWanted = _arr(filters.tags).map(_norm).filter(Boolean);
    return (data || []).filter((c) => {
      const name = c.name || "";
      const ind = _getIndustry(c);
      const cityVal = c.city || "";
      const stateVal = c.state || "";
      const tags = _arr(c.tags);
      const jobs = _arr(c.jobs);
      const byCity = !city || _norm(cityVal) === city;
      const byState = !state || _norm(stateVal) === state;
      const byIndustry = !industry || _norm(ind) === industry;
      const byHiring =
        isHiringRaw == null ? true : Boolean(c.is_hiring) === wantHiring;
      const companyTagsNorm = tags.map(_norm);
      const byTags =
        tagsWanted.length === 0
          ? true
          : tagsWanted.every((t) => companyTagsNorm.includes(t));
      const blob = [
        name,
        ind,
        cityVal,
        stateVal,
        ...tags,
        ...jobs.map((j) => j?.title || "")
      ].join(" ").toString();
      const byText = !q || _norm(blob).includes(q);
      return byCity && byState && byIndustry && byHiring && byTags && byText;
    });
  }
  function uniqueValues(list, key) {
    if (!list || !key) return [];
    const values =
      key === "industry" || key === "sector"
        ? (list || []).map((i) => _getIndustry(i)).filter(Boolean)
        : (list || []).map((i) => i?.[key]).filter(Boolean);
    const seen = new Map();
    for (const v of values) {
      const n = _norm(v);
      if (!seen.has(n)) seen.set(n, v);
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.toString().localeCompare(b.toString(), "pt-BR")
    );
  }
  function buildFilterOptions(list) {
    const allTags = (list || []).flatMap((i) => _arr(i.tags)).filter(Boolean);
    const tagsUnique = uniqueValues(allTags.map((t) => ({ t })), "t");
    return {
      cities: uniqueValues(list, "city"),
      states: uniqueValues(list, "state"),
      industries: uniqueValues(list, "industry"),
      tags: tagsUnique
    };
  }
  window.MapsFilters = {
    filterCompanies,
    uniqueValues,
    buildFilterOptions
  };
})();
