(() => {
  const script = document.currentScript || Array.from(document.scripts).find(s => (s.src || "").includes("/main.js"));
  const usersUrl = script ? new URL("../data/users.json", script.src).href : "assets/data/users.json";
  const USERS_KEY = "mapslink:users";
  const SESSION_KEY = "mapslink:session";
  const watchers = new Set();
  const storageState = { users: null, session: null };
  const storageLogged = { local: false, session: false };
  let cache = null;
  let loadingPromise = null;

  function warn(...args) {
    if (window.console?.warn) window.console.warn(...args);
  }

  function encode(value) {
    return btoa(unescape(encodeURIComponent(value || "")));
  }

  function normalize(value) {
    return (value || "").replace(/\D/g, "").toLowerCase();
  }

  function storageCandidates() {
    const list = [];
    function tryAdd(label, getter, flag) {
      try {
        const store = getter();
        if (store && typeof store.getItem === "function" && !list.some(item => item.store === store)) {
          list.push({ label, store });
        }
      } catch (error) {
        if (!storageLogged[flag]) {
          warn(`MapsAuth: ${label} indisponivel.`, error);
          storageLogged[flag] = true;
        }
      }
    }
    tryAdd("localStorage", () => window.localStorage, "local");
    tryAdd("sessionStorage", () => window.sessionStorage, "session");
    return list;
  }

  function storesFor(type) {
    const stores = storageCandidates();
    const preferred = storageState[type];
    if (!preferred) return stores;
    const match = stores.find(item => item.store === preferred.store);
    if (!match) return stores;
    return [match, ...stores.filter(item => item !== match)];
  }

  function writeStore(type, key, value) {
    for (const candidate of storesFor(type)) {
      try {
        candidate.store.setItem(key, value);
        storageState[type] = candidate;
        return true;
      } catch (error) {
        warn(`MapsAuth: falha ao salvar em ${candidate.label}.`, error);
      }
    }
    return false;
  }

  function readStore(type, key) {
    for (const candidate of storesFor(type)) {
      try {
        const raw = candidate.store.getItem(key);
        if (raw !== null && raw !== undefined) {
          storageState[type] = candidate;
          return raw;
        }
      } catch (error) {
        warn(`MapsAuth: falha ao ler de ${candidate.label}.`, error);
      }
    }
    return null;
  }

  function clearStore(type, key) {
    let removed = false;
    for (const candidate of storageCandidates()) {
      try {
        candidate.store.removeItem(key);
        removed = true;
      } catch (error) {
        warn(`MapsAuth: falha ao remover de ${candidate.label}.`, error);
      }
    }
    if (type) storageState[type] = null;
    return removed;
  }

  function fallbackUsers() {
    return [
      {
        id: "usr-001",
        type: "personal",
        email: "gelado@gmail.com",
        cpf: "12345678909",
        name: "Gelado da Silva",
        phone: "+55 19 99297-2688",
        pass: "U2VuaGFAMTIz",
        profile: {
          avatar: "../assets/images/3d_avatar_21.png",
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
          site: "https://amazon.com",
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
          avatar: "../assets/images/image 4.png",
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
          site: "https://amazon.com",
          agendaToday: 3,
          curriculos: 12,
          bio: "Uma gigante global de tecnologia focada em e-commerce, computacao em nuvem (AWS), streaming digital e inteligencia artificial. Reconhecida por inovacao constante e por ser uma das marcas mais valiosas do mundo."
        }
      }
    ];
  }

  function persist() {
    return Array.isArray(cache) && writeStore("users", USERS_KEY, JSON.stringify(cache));
  }

  function readSession() {
    const raw = readStore("session", SESSION_KEY);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setSession(data) {
    if (!data) {
      clearStore("session", SESSION_KEY);
    } else if (!writeStore("session", SESSION_KEY, JSON.stringify(data))) {
      warn("MapsAuth: nao foi possivel persistir a sessao do usuario.");
    }
    watchers.forEach(fn => fn(data));
    return data;
  }

  function baseUser(user) {
    return {
      id: user.id,
      type: user.type,
      email: user.email,
      name: user.name,
      company: user.company || null,
      phone: user.phone || null,
      profile: user.profile || null,
      token: `tok-${Date.now()}`
    };
  }

  async function loadUsers() {
    if (cache) return cache;
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      const stored = readStore("users", USERS_KEY);
      if (stored !== null) {
        try {
          cache = JSON.parse(stored) || [];
        } catch {
          warn("MapsAuth: dados corrompidos no localStorage, recriando lista de usuarios.");
          cache = fallbackUsers();
          if (!persist()) warn("MapsAuth: nao foi possivel salvar usuarios de fallback.");
        }
        return cache;
      }
      try {
        const response = await fetch(usersUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        cache = Array.isArray(data) ? data : [];
      } catch (error) {
        warn("MapsAuth: nao foi possivel carregar users.json, usando lista local.", error);
        cache = Array.isArray(cache) && cache.length ? cache : fallbackUsers();
      }
      if (!persist()) warn("MapsAuth: nao foi possivel salvar a lista de usuarios carregada.");
      return cache;
    })();
    return loadingPromise;
  }

  const MapsAuth = {
    ready: () => loadUsers(),
    current: () => readSession(),
    onSession(fn) {
      if (typeof fn === "function") watchers.add(fn);
      return () => watchers.delete(fn);
    },
    logout() {
      setSession(null);
    },
    async login(payload) {
      const list = await loadUsers();
      const identifier = (payload.identifier || "").trim();
      const hashed = encode(payload.password || "");
      const user = list.find(u => {
        if (payload.type && u.type !== payload.type) return false;
        if (u.pass !== hashed) return false;
        const lower = identifier.toLowerCase();
        return (
          u.email?.toLowerCase() === lower ||
          normalize(u.cnpj) === normalize(identifier) ||
          normalize(u.cpf) === normalize(identifier)
        );
      });
      if (!user) throw new Error("INVALID");
      user.lastLogin = new Date().toISOString();
      if (!persist()) warn("MapsAuth: nao foi possivel atualizar informacoes do usuario.");
      return setSession(baseUser(user));
    },
    async register(payload) {
      const list = await loadUsers();
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
      return setSession(baseUser(entry));
    },
    require(type, redirect) {
      const data = readSession();
      if (!data || (type && data.type !== type)) {
        if (redirect) window.location.href = redirect;
        return null;
      }
      return data;
    },
    async updateProfile(values) {
      const session = readSession();
      if (!session) throw new Error("NO_SESSION");
      const list = await loadUsers();
      const user = list.find(u => u.id === session.id);
      if (!user) throw new Error("NOT_FOUND");
      if (Object.prototype.hasOwnProperty.call(values, "name")) user.name = values.name || "";
      if (Object.prototype.hasOwnProperty.call(values, "phone")) user.phone = values.phone || "";
      if (Object.prototype.hasOwnProperty.call(values, "company")) user.company = values.company || "";
      if (values.profile) {
        const current = user.profile && typeof user.profile === "object" ? { ...user.profile } : {};
        Object.entries(values.profile).forEach(([key, value]) => {
          if (key === "contact" && value && typeof value === "object") {
            current.contact = { ...value };
          } else {
            current[key] = value;
          }
        });
        user.profile = current;
      }
      if (!persist()) warn("MapsAuth: nao foi possivel salvar alteracoes de perfil.");
      return setSession({ ...baseUser(user), token: session.token });
    }
  };

  window.MapsAuth = MapsAuth;

  function navLinks() {
    return Array.from(document.querySelectorAll(".nav-link"));
  }

  function highlight(target) {
    const current = (target || "").toLowerCase();
    navLinks().forEach(link => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      const key = (link.dataset?.navKey || "").toLowerCase();
      const label = (link.textContent || "").trim().toLowerCase();
      const match =
        current &&
        (href === current ||
          href.endsWith(current) ||
          href === current.replace(window.location.origin.toLowerCase(), "") ||
          key === current ||
          label === current);
      link.classList.toggle("active", !!match);
      if (match) link.setAttribute("aria-current", "page");
    });
  }

  window.MapsApp = Object.assign(window.MapsApp || {}, {
    navLinks,
    highlightNav: highlight,
    closeNav: () => window.MapsNav && window.MapsNav.close && window.MapsNav.close()
  });

  function hydrate() {
    const data = MapsAuth.current();
    if (!data) return;
    const nameNode = document.querySelector("[data-auth-name]");
    if (nameNode) nameNode.textContent = data.name;
    const companyNode = document.querySelector("[data-auth-company]");
    if (companyNode && data.company) companyNode.textContent = data.company;
  }

  function ensureFooterScript() {
    if (document.querySelector('script[data-site-footer="true"]')) return;
    const footerScript = document.createElement("script");
    footerScript.defer = true;
    footerScript.src = script ? new URL("./_shared-footer.js", script.src).href : "assets/js/_shared-footer.js";
    footerScript.dataset.siteFooter = "true";
    (document.body || document.head || document.documentElement).appendChild(footerScript);
  }

  document.addEventListener("DOMContentLoaded", () => {
    MapsAuth.ready();
    hydrate();
    const active = document.body?.dataset?.navActive;
    if (active) highlight(active);
    const gate = document.body?.dataset?.page;
    if (gate === "perfilusuario") MapsAuth.require("personal", "loginpessoal.html");
    if (gate === "perfilempresa") MapsAuth.require("business", "loginempresa.html");
    ensureFooterScript();
  });
})();





