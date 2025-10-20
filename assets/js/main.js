(() => {
  const win = window;
  const doc = document;
  const script = doc.currentScript || Array.from(doc.scripts).find(s => (s.src || "").includes("/main.js"));
  const usersUrl = script ? new URL("../data/users.json", script.src).href : "assets/data/users.json";
  const USERS_KEY = "mapslink:users";
  const SESSION_KEY = "mapslink:session";
  const watchers = new Set();
  const storageState = {
    users: null,
    session: null
  };
  const storageLogged = {
    local: false,
    session: false
  };
  const logWarn = (...args) => {
    if (win && win.console && typeof win.console.warn === "function") {
      win.console.warn(...args);
    }
  };
  let cache = null;
  let loading = null;
  const encode = v => btoa(unescape(encodeURIComponent(v || "")));
  const normalize = v => (v || "").replace(/\D/g, "").toLowerCase();
  const storageCandidates = () => {
    const items = [];
    const add = (label, getter, flag) => {
      try {
        const store = getter();
        if (store && typeof store.getItem === "function" && !items.some(entry => entry.store === store)) {
          items.push({ label, store });
        }
      } catch (error) {
        if (!storageLogged[flag]) {
          logWarn(`MapsAuth: ${label} indisponivel.`, error);
          storageLogged[flag] = true;
        }
      }
    };
    add("localStorage", () => win.localStorage, "local");
    add("sessionStorage", () => win.sessionStorage, "session");
    return items;
  };
  const storesFor = type => {
    const stores = storageCandidates();
    const preferred = storageState[type];
    if (preferred) {
      const found = stores.find(item => item.store === preferred.store);
      if (found) {
        return [found, ...stores.filter(item => item !== found)];
      }
    }
    return stores;
  };
  const writeStore = (type, key, value) => {
    const stores = storesFor(type);
    for (const { label, store } of stores) {
      try {
        store.setItem(key, value);
        storageState[type] = { label, store };
        return true;
      } catch (error) {
        logWarn(`MapsAuth: falha ao salvar em ${label}.`, error);
      }
    }
    return false;
  };
  const readStore = (type, key) => {
    const stores = storesFor(type);
    for (const { label, store } of stores) {
      try {
        const raw = store.getItem(key);
        if (raw !== null && raw !== undefined) {
          storageState[type] = { label, store };
          return raw;
        }
      } catch (error) {
        logWarn(`MapsAuth: falha ao ler de ${label}.`, error);
      }
    }
    return null;
  };
  const clearStore = (type, key) => {
    const stores = storageCandidates();
    let removed = false;
    stores.forEach(({ label, store }) => {
      try {
        store.removeItem(key);
        removed = true;
      } catch (error) {
        logWarn(`MapsAuth: falha ao remover de ${label}.`, error);
      }
    });
    if (type) storageState[type] = null;
    return removed;
  };
  const fallbackUsers = () => ([
    {
      id: "usr-001",
      type: "personal",
      email: "gelado@gmail.com",
      cpf: "12345678909",
      name: "Gelado da Silva",
      phone: "+55 19 99297-2688",
      pass: "U2VuaGFAMTIz",
      profile: {
        headline: "Desenvolvedor full stack apaixonado por criar experiencias uteis, acessiveis e escalaveis.",
        specialty: "Engenharia Full Stack",
        location: "Campinas, SP",
        experience: "12 anos em tecnologia",
        availability: "Hibrido - Imediata",
        skills: ["Full-stack", "Node.js", "React", "Arquitetura Cloud"],
        bio: "Desenvolvedor senior com mais de 10 anos de experiencia em solucoes escalaveis. Focado em resultados, entrega produtos que impactam usuarios e negocios, liderando times multidisciplinares com boas praticas de engenharia.",
        experiences: [
          "Tech Lead - InovaTech - 2019-2024",
          "Engenheiro de Software Senior - Conecta Dados - 2015-2019",
          "Desenvolvedor Pleno - Digital Way - 2012-2015",
          "Desenvolvedor Junior - Digital Way - 2011-2012",
          "Estagiario de Desenvolvimento - Tech Start - 2010-2011"
        ],
        contact: {
          email: "gelado@gmail.com",
          phone: "+55 19 99297-2688",
          instagram: "@gelado.tech",
          linkedin: "/in/geladodasilva"
        },
        interviewsToday: 2
      }
    },
    {
      id: "biz-001",
      type: "business",
      email: "contato@amazon.com",
      cnpj: "12345678000199",
      name: "Amazon",
      company: "Amazon Brasil",
      phone: "+55 11 4002-8922",
      pass: "RW1wcmVzYUAxMjM=",
      profile: {
        caption: "Tecnologia, logistica e inovacao para conectar milhoes de clientes e talentos ao redor do mundo.",
        tags: ["Cloud & AWS", "E-commerce", "Inteligencia Artificial"],
        sector: "Tecnologia & E-commerce",
        headquarters: "Seattle, EUA",
        model: "Global - Hibrido",
        contact: {
          instagram: "@amazon",
          linkedin: "@amazon",
          email: "support@amazon.com",
          address: "Rua Plinio Luis de Siqueira Jr"
        },
        agendaToday: 3,
        curriculos: 12,
        bio: "Uma gigante global de tecnologia focada em e-commerce, computacao em nuvem (AWS), streaming digital e inteligencia artificial. Reconhecida por inovacao constante e por ser uma das marcas mais valiosas do mundo."
      }
    }
  ]);
  const persist = () => {
    if (!Array.isArray(cache)) return false;
    return writeStore("users", USERS_KEY, JSON.stringify(cache));
  };
  const readSession = () => {
    const raw = readStore("session", SESSION_KEY);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const setSession = data => {
    if (!data) clearStore("session", SESSION_KEY);
    else if (!writeStore("session", SESSION_KEY, JSON.stringify(data))) {
      logWarn("MapsAuth: nao foi possivel persistir a sessao do usuario.");
    }
    watchers.forEach(fn => fn(data));
    return data;
  };
  const base = u => ({
    id: u.id,
    type: u.type,
    email: u.email,
    name: u.name,
    company: u.company || null,
    phone: u.phone || null,
    profile: u.profile || null,
    token: `tok-${Date.now()}`
  });
  async function load() {
    if (cache) return cache;
    if (loading) return loading;
    loading = (async () => {
      const raw = readStore("users", USERS_KEY);
      if (raw !== null) {
        try {
          cache = JSON.parse(raw) || [];
        } catch {
          logWarn("MapsAuth: dados corrompidos no localStorage, recriando lista de usuarios.");
          cache = fallbackUsers();
          if (!persist()) logWarn("MapsAuth: nao foi possivel salvar usuarios de fallback.");
        }
        return cache;
      }
      try {
        const res = await fetch(usersUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        cache = Array.isArray(data) ? data : [];
      } catch (error) {
        logWarn("MapsAuth: nao foi possivel carregar users.json, usando lista local.", error);
        cache = cache && Array.isArray(cache) && cache.length ? cache : fallbackUsers();
      }
      if (!persist()) logWarn("MapsAuth: nao foi possivel salvar a lista de usuarios carregada.");
      return cache;
    })();
    return loading;
  }
  const MapsAuth = {
    ready: () => load(),
    current: () => readSession(),
    onSession(fn) {
      if (typeof fn === "function") watchers.add(fn);
      return () => watchers.delete(fn);
    },
    logout() {
      setSession(null);
    },
    async login(payload) {
      const list = await load();
      const identifier = (payload.identifier || "").trim();
      const hashed = encode(payload.password || "");
      const user = list.find(u => {
        if (payload.type && u.type !== payload.type) return false;
        if (u.pass !== hashed) return false;
        const lower = identifier.toLowerCase();
        return u.email?.toLowerCase() === lower || normalize(u.cnpj) === normalize(identifier) || normalize(u.cpf) === normalize(identifier);
      });
      if (!user) throw new Error("INVALID");
      user.lastLogin = new Date().toISOString();
      if (!persist()) logWarn("MapsAuth: nao foi possivel atualizar informacoes do usuario.");
      return setSession(base(user));
    },
    async register(payload) {
      const list = await load();
      const email = (payload.email || "").trim().toLowerCase();
      if (!email) throw new Error("EMAIL_REQUIRED");
      if (list.some(u => u.email?.toLowerCase() === email)) throw new Error("EMAIL_TAKEN");
      const cleanCnpj = normalize(payload.cnpj);
      if (cleanCnpj && list.some(u => normalize(u.cnpj) === cleanCnpj)) throw new Error("CNPJ_TAKEN");
      const cleanCpf = normalize(payload.cpf);
      if (cleanCpf && list.some(u => normalize(u.cpf) === cleanCpf)) throw new Error("CPF_TAKEN");
      const password = payload.password || "";
      if (!password) throw new Error("PASSWORD_REQUIRED");
      const id = `${payload.type === "business" ? "biz" : "usr"}-${Math.random().toString(36).slice(2, 10)}`;
      const entry = {
        id,
        type: payload.type || "personal",
        email,
        pass: encode(password),
        name: payload.name || payload.company || "",
        phone: payload.phone || "",
        cpf: payload.cpf || "",
        cnpj: payload.cnpj || "",
        company: payload.company || "",
        profile: payload.profile || {}
      };
      list.push(entry);
      if (!persist()) {
        list.pop();
        throw new Error("STORAGE_UNAVAILABLE");
      }
      return setSession(base(entry));
    },
    require(type, redirect) {
      const data = readSession();
      if (!data || (type && data.type !== type)) {
        if (redirect) win.location.href = redirect;
        return null;
      }
      return data;
    },
    async updateProfile(values) {
      const data = read(SESSION_KEY);
      if (!data) throw new Error("NO_SESSION");
      const list = await load();
      const user = list.find(u => u.id === data.id);
      if (!user) throw new Error("NOT_FOUND");
      if (values.name) user.name = values.name;
      if (values.phone) user.phone = values.phone;
      if (values.profile) {
        user.profile = user.profile || {};
        Object.assign(user.profile, values.profile);
      }
      if (!persist()) logWarn("MapsAuth: nao foi possivel salvar alteracoes de perfil.");
      return setSession({ ...base(user), token: data.token });
    }
  };
  win.MapsAuth = MapsAuth;
  const navLinks = () => Array.from(doc.querySelectorAll(".nav-link"));
  const highlight = target => {
    const current = (target || "").toLowerCase();
    navLinks().forEach(link => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      const match = current && (href === current || href.endsWith(current) || href === current.replace(win.location.origin.toLowerCase(), ""));
      link.classList.toggle("active", !!match);
      if (match) link.setAttribute("aria-current", "page");
    });
  };
  win.MapsApp = Object.assign(win.MapsApp || {}, {
    navLinks,
    highlightNav: highlight,
    closeNav: () => win.MapsNav && win.MapsNav.close && win.MapsNav.close()
  });
  const hydrate = () => {
    const data = MapsAuth.current();
    if (!data) return;
    const nameNode = doc.querySelector("[data-auth-name]");
    if (nameNode) nameNode.textContent = data.name;
    const companyNode = doc.querySelector("[data-auth-company]");
    if (companyNode && data.company) companyNode.textContent = data.company;
  };
  doc.addEventListener("DOMContentLoaded", () => {
    MapsAuth.ready();
    hydrate();
    const active = doc.body?.dataset?.navActive;
    if (active) highlight(active);
    const gate = doc.body?.dataset?.page;
    if (gate === "perfilusuario") MapsAuth.require("personal", "loginpessoal.html");
    if (gate === "perfilempresa") MapsAuth.require("business", "loginempresa.html");
  });
})();
