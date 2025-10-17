(function () {
  "use strict";

  const norm = v =>
    (v ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const arr = v => (v == null ? [] : Array.isArray(v) ? v : [v]);

  const getIndustry = c => c?.industry ?? c?.sector ?? "";

  function filterCompanies(data, filters = {}) {
    const q = norm(filters.q || "");
    const city = norm(filters.city || "");
    const state = norm(filters.state || "");
    const industry = norm(filters.industry || filters.sector || "");
    const isHiringRaw = filters.isHiring;
    const wantHiring =
      typeof isHiringRaw === "string"
        ? isHiringRaw.toLowerCase() === "true"
        : !!isHiringRaw;
    const tagsWanted = arr(filters.tags).map(norm).filter(Boolean);

    return (data || []).filter(c => {
      const name = c?.name || "";
      const ind = getIndustry(c);
      const cityVal = c?.city || "";
      const stateVal = c?.state || "";
      const tags = arr(c?.tags);
      const jobs = arr(c?.jobs);

      const byCity = !city || norm(cityVal) === city;
      const byState = !state || norm(stateVal) === state;
      const byIndustry = !industry || norm(ind) === industry;
      const byHiring =
        isHiringRaw == null ? true : Boolean(c?.is_hiring) === wantHiring;

      const companyTagsNorm = tags.map(norm);
      const byTags =
        tagsWanted.length === 0
          ? true
          : tagsWanted.every(t => companyTagsNorm.includes(t));

      const blob = [
        name,
        ind,
        cityVal,
        stateVal,
        ...tags,
        ...jobs.map(j => (typeof j === "string" ? j : j?.title || ""))
      ]
        .join(" ")
        .toString();

      const byText = !q || norm(blob).includes(q);

      return byCity && byState && byIndustry && byHiring && byTags && byText;
    });
  }

  function uniqueValues(list, key) {
    if (!list || !key) return [];
    const values =
      key === "industry" || key === "sector"
        ? (list || []).map(i => getIndustry(i)).filter(Boolean)
        : (list || []).map(i => i?.[key]).filter(Boolean);

    const seen = new Map();
    for (const v of values) {
      const n = norm(v);
      if (!seen.has(n)) seen.set(n, v);
    }

    try {
      return Array.from(seen.values()).sort((a, b) =>
        a.toString().localeCompare(b.toString(), "pt-BR")
      );
    } catch {
      return Array.from(seen.values()).sort();
    }
  }

  function buildFilterOptions(list) {
    const allTags = (list || []).flatMap(i => arr(i?.tags)).filter(Boolean);
    const tagsUnique = uniqueValues(allTags.map(t => ({ t })), "t");
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
