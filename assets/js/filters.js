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
    const q = norm(filters.q || filters.search || "");
    const location = norm(filters.location || "");
    const city = norm(filters.city || "");
    const state = norm(filters.state || "");

    const industries =
      arr(filters.industries || filters.industry || filters.sector)
        .map(norm)
        .filter(Boolean);

    const sizes =
      arr(filters.sizes || filters.size || filters.companySize)
        .map(norm)
        .filter(Boolean);

    const workModes =
      arr(filters.workModes || filters.workMode || filters.modalities)
        .map(norm)
        .filter(Boolean);

    const isHiringRaw = filters.isHiring;
    const wantHiring =
      isHiringRaw == null
        ? null
        : typeof isHiringRaw === "string"
        ? isHiringRaw.toLowerCase() === "true"
        : Boolean(isHiringRaw);

    const tagsWanted = arr(filters.tags).map(norm).filter(Boolean);

    return (data || []).filter(c => {
      const name = c?.name || "";
      const ind = getIndustry(c);
      const cityVal = c?.city || "";
      const stateVal = c?.state || "";
      const tags = arr(c?.tags);
      const jobs = arr(c?.jobs);
      const sizeVal = c?.size ?? c?.company_size ?? "";
      const workModesVal = arr(c?.work_modes ?? c?.workModes);

      const cityNorm = norm(cityVal);
      const stateNorm = norm(stateVal);
      const industryNorm = norm(ind);
      const sizeNorm = norm(sizeVal);
      const workModesNorm = workModesVal.map(norm);

      const locationMatch =
        !location ||
        cityNorm.includes(location) ||
        stateNorm.includes(location) ||
        norm(`${cityVal} ${stateVal}`).includes(location);

      const byCity = !city || cityNorm === city;
      const byState = !state || stateNorm === state;
      const byIndustry =
        industries.length === 0 || industries.includes(industryNorm);
      const bySize = sizes.length === 0 || sizes.includes(sizeNorm);
      const byWorkModes =
        workModes.length === 0 ||
        workModes.every(mode => workModesNorm.includes(mode));

      const byHiring =
        wantHiring == null ? true : Boolean(c?.is_hiring) === wantHiring;

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
        sizeVal,
        ...workModesVal,
        ...tags,
        ...jobs.map(j => (typeof j === "string" ? j : j?.title || ""))
      ]
        .join(" ")
        .toString();

      const byText = !q || norm(blob).includes(q);

      return (
        locationMatch &&
        byCity &&
        byState &&
        byIndustry &&
        bySize &&
        byWorkModes &&
        byHiring &&
        byTags &&
        byText
      );
    });
  }

  function uniqueValues(list, key) {
    if (!list || !key) return [];
    const values =
      key === "industry" || key === "sector"
        ? (list || []).map(i => getIndustry(i)).filter(Boolean)
        : (list || []).flatMap(i => {
            const value = i?.[key];
            if (Array.isArray(value)) {
              return value.filter(Boolean);
            }
            return value != null ? [value] : [];
          });

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
