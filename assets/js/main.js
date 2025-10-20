(() => {
  const win = window;
  const doc = document;
  const script = doc.currentScript || Array.from(doc.scripts).find(s => (s.src || "").includes("/main.js"));
  const usersUrl = script ? new URL("../data/users.json", script.src).href : "assets/data/users.json";
  const USERS_KEY = "mapslink:users";
  const SESSION_KEY = "mapslink:session";
  const watchers = new Set();
  let cache = null;
  let loading = null;
  const encode = v => btoa(unescape(encodeURIComponent(v || "")));
  const normalize = v => (v || "").replace(/\D/g, "").toLowerCase();
  const persist = () => localStorage.setItem(USERS_KEY, JSON.stringify(cache));
  const read = key => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };
  const setSession = data => {
    if (!data) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(data));
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
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        try {
          cache = JSON.parse(raw) || [];
        } catch {
          cache = [];
        }
        return cache;
      }
      const res = await fetch(usersUrl, { cache: "no-store" });
      const data = await res.json();
      cache = Array.isArray(data) ? data : [];
      persist();
      return cache;
    })();
    return loading;
  }
  const MapsAuth = {
    ready: () => load(),
    current: () => read(SESSION_KEY),
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
      persist();
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
      persist();
      return setSession(base(entry));
    },
    require(type, redirect) {
      const data = read(SESSION_KEY);
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
      persist();
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
    const gate = doc.body?.dataset?.page;
    if (gate === "perfilusuario") MapsAuth.require("personal", "loginpessoal.html");
    if (gate === "perfilempresa" || gate === "paginadashboard") MapsAuth.require("business", "loginempresa.html");
  });
})();
