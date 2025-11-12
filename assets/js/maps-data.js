(() => {
  if (window.MapsCompanyService) return;

  const FALLBACK_COMPANIES = Object.freeze([
    {
      id: "sidi",
      name: "SIDI",
      address: "Rua Angacu, 171 - Loteamento Alphaville Campinas, Campinas - SP, 13098-321",
      city: "Campinas",
      coords: [-22.8339, -47.0739],
      status: "open",
      areas: ["ti"],
      porte: "medium",
      modalities: ["hibrido", "presencial"]
    },
    {
      id: "samsung",
      name: "Samsung",
      address: "Rua Thomas Nilsen Junior, 150 - Parque Imperador, Campinas - SP, 13097-105",
      city: "Campinas",
      coords: [-22.942, -47.06],
      status: "closed",
      areas: ["ti"],
      porte: "large",
      modalities: ["presencial"]
    },
    {
      id: "cnpem",
      name: "CNPEM",
      address: "Polo II de Alta Tecnologia - Rua Giuseppe Maximo Scolfaro, 10000 - Bosque das Palmeiras, Campinas - SP, 13083-100",
      city: "Campinas",
      coords: [-22.8197, -47.0647],
      status: "open",
      areas: ["ti", "health"],
      porte: "large",
      modalities: ["presencial"]
    }
  ]);

  window.mapsLinkCompanies = FALLBACK_COMPANIES;

  const GEO_CACHE_PREFIX = "mapslink:geocode:";
  const GEO_CACHE_TTL = 1000 * 60 * 60 * 24 * 30;
  const geocodeQueue = new Map();

  const state = {
    staticCache: null,
    mergedCache: null,
    pending: null
  };

  function normalizeKey(value) {
    return (value || "").trim().toLowerCase();
  }

  function encodeKey(value) {
    const normalized = normalizeKey(value);
    if (!normalized) return "";
    try {
      return `${GEO_CACHE_PREFIX}${btoa(unescape(encodeURIComponent(normalized))).replace(/=+$/, "")}`;
    } catch {
      return `${GEO_CACHE_PREFIX}${encodeURIComponent(normalized)}`;
    }
  }

  function readGeocodeCache(address) {
    const key = encodeKey(address);
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data) return null;
      if (data.cachedAt && Date.now() - data.cachedAt > GEO_CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      const { cachedAt, ...value } = data;
      if (!Number.isFinite(value.lat) || !Number.isFinite(value.lng)) return null;
      return value;
    } catch {
      return null;
    }
  }

  function writeGeocodeCache(address, value) {
    const key = encodeKey(address);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ ...value, cachedAt: Date.now() }));
    } catch {}
  }

  function ownerJobsKey(owner) {
    return owner ? `mapslink:vagas:${owner}` : "";
  }

  function loadOwnerJobs(owner) {
    const key = ownerJobsKey(owner);
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function cleanJobs(list) {
    return (Array.isArray(list) ? list : [])
      .map(job => ({
        title: (job?.title || "").trim(),
        type: (job?.type || "").trim(),
        status: job?.status || "",
        url: job?.url || ""
      }))
      .filter(job => job.title.length);
  }

  function jobsAreOpen(list) {
    if (!list.length) return true;
    return list.some(job => !/fechad/i.test(job.status || ""));
  }

  function extractCityState(value) {
    if (!value) return { city: "", state: "" };
    const cleaned = value.replace(/\s+/g, " ").trim();
    if (!cleaned) return { city: "", state: "" };
    const stateMatch = cleaned.match(/\b([A-Z]{2})\b(?!.*\b[A-Z]{2}\b)/);
    const state = stateMatch ? stateMatch[1] : "";
    let city = "";
    if (state && stateMatch) {
      const before = cleaned
        .slice(0, stateMatch.index)
        .split(/[,|-]/)
        .map(part => part.trim())
        .filter(Boolean);
      city = before.pop() || "";
    } else {
      const parts = cleaned
        .split(/[,|-]/)
        .map(part => part.trim())
        .filter(Boolean);
      city = parts.length > 1 ? parts[parts.length - 1] : parts[0] || "";
    }
    return { city, state };
  }

  function normalizeCoords(raw) {
    if (!raw || typeof raw !== "object") return null;
    const lat = Number(raw.lat ?? raw.latitude);
    const lng = Number(raw.lng ?? raw.lon ?? raw.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function buildCompanyFromUser(user) {
    if (!user) return null;
    const profile = user.profile || {};
    const contact = profile.contact || {};
    const locationMeta = typeof profile.location === "object" ? profile.location : {};
    const coords = normalizeCoords(locationMeta);
    const tags = Array.isArray(profile.tags) ? profile.tags.filter(Boolean) : [];
    const jobs = cleanJobs(loadOwnerJobs(user.id));
    const fallbackLocation = extractCityState(locationMeta.formatted || profile.headquarters || contact.address || "");
    const city = locationMeta.city || locationMeta.town || fallbackLocation.city || "";
    const state = locationMeta.state || locationMeta.region || fallbackLocation.state || "";
    const address = contact.address || locationMeta.formatted || profile.headquarters || "";
    return {
      id: user.id,
      name: user.company || user.name || "Empresa",
      industry: profile.sector || "",
      city,
      state,
      address,
      website: profile.site || contact.website || contact.site || "",
      logo: profile.avatar || "",
      tags,
      is_hiring: jobsAreOpen(jobs),
      jobs: jobs.slice(0, 4),
      coordinates: coords,
      source: "user"
    };
  }

  function geocodeQuery(company) {
    if (!company) return "";
    const parts = [company.address, [company.city, company.state].filter(Boolean).join(", ")].filter(Boolean);
    return parts.join(", ").trim();
  }

  async function geocodeAddress(address) {
    const normalized = normalizeKey(address);
    if (!normalized) return null;
    const cached = readGeocodeCache(normalized);
    if (cached) return cached;
    if (geocodeQueue.has(normalized)) return geocodeQueue.get(normalized);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(address)}`;
    const promise = fetch(url, {
      headers: { "Accept-Language": "pt-BR" }
    })
      .then(async response => {
        if (!response.ok) throw new Error(`Geocode HTTP ${response.status}`);
        const data = await response.json();
        const hit = Array.isArray(data) ? data[0] : null;
        if (!hit) return null;
        const lat = Number(hit.lat);
        const lng = Number(hit.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const result = {
          lat,
          lng,
          city:
            hit.address?.city ||
            hit.address?.town ||
            hit.address?.village ||
            hit.address?.municipality ||
            hit.address?.county ||
            "",
          state: hit.address?.state || hit.address?.region || hit.address?.state_district || "",
          formatted: hit.display_name || address
        };
        writeGeocodeCache(normalized, result);
        return result;
      })
      .catch(() => null)
      .finally(() => {
        geocodeQueue.delete(normalized);
      });
    geocodeQueue.set(normalized, promise);
    return promise;
  }

  async function ensureCompanyCoordinates(company) {
    if (!company) return null;
    const hasCoords = Number.isFinite(company?.coordinates?.lat) && Number.isFinite(company?.coordinates?.lng);
    if (hasCoords) return company;
    const query = geocodeQuery(company);
    if (!query) return company;
    const geo = await geocodeAddress(query);
    if (!geo) return company;
    company.coordinates = { lat: geo.lat, lng: geo.lng };
    if (!company.city && geo.city) company.city = geo.city;
    if (!company.state && geo.state) company.state = geo.state;
    if (!company.address && geo.formatted) company.address = geo.formatted;
    return company;
  }

  async function fetchStaticCompanies() {
    if (Array.isArray(state.staticCache)) return state.staticCache;
    try {
      const dataUrl = location.pathname.includes("/pages/") ? "../assets/data/companies.json" : "assets/data/companies.json";
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar companies.json");
      const data = await response.json();
      state.staticCache = Array.isArray(data) ? data : [];
    } catch {
      state.staticCache = Array.isArray(window.__staticCompanies)
        ? window.__staticCompanies
        : Array.from(FALLBACK_COMPANIES);
    }
    window.__staticCompanies = state.staticCache;
    return state.staticCache;
  }

  async function loadUserCompanies() {
    const auth = window.MapsAuth;
    if (!auth || typeof auth.ready !== "function") return [];
    try {
      const users = await auth.ready();
      const business = (Array.isArray(users) ? users : []).filter(user => user?.type === "business");
      const mapped = business.map(buildCompanyFromUser).filter(Boolean);
      const enriched = await Promise.all(mapped.map(company => ensureCompanyCoordinates(company)));
      return enriched.filter(Boolean);
    } catch {
      return [];
    }
  }

  function companyKey(company) {
    if (!company) return "";
    if (company.id) return `id:${company.id}`;
    const name = normalizeKey(company.name);
    return name ? `name:${name}` : "";
  }

  async function mergeCompanies() {
    const [base, custom] = await Promise.all([fetchStaticCompanies(), loadUserCompanies()]);
    const seen = new Set();
    const merged = [];
    (custom || []).forEach(company => {
      if (!company) return;
      const key = companyKey(company);
      if (key) {
        if (seen.has(key)) return;
        seen.add(key);
      }
      merged.push(company);
    });
    (base || []).forEach(company => {
      if (!company) return;
      const key = companyKey(company);
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      merged.push(company);
    });
    return merged;
  }

  async function loadAll(options = {}) {
    if (!options.refresh && Array.isArray(state.mergedCache)) return state.mergedCache;
    if (!options.refresh && state.pending) return state.pending;
    state.pending = (async () => {
      const list = await mergeCompanies();
      state.mergedCache = list;
      window.__companies = list;
      state.pending = null;
      return list;
    })();
    return state.pending;
  }

  window.MapsCompanyService = {
    loadAll,
    fetchStatic: fetchStaticCompanies,
    loadUserCompanies,
    geocode: geocodeAddress,
    ensureCoordinates: ensureCompanyCoordinates,
    reset() {
      state.staticCache = null;
      state.mergedCache = null;
    }
  };
})();

