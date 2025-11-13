const token = localStorage.getItem("jwt_token");
if (!token) {
  window.location.href = "loginempresa.html";
}

(() => {
  if (window.__ml_dashboard_init__) return;
  window.__ml_dashboard_init__ = true;

  const JOBS_STORAGE = "mapslink:vagas";
  const EMPTY_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const { normalizeText } = window.MapsUtils || {};
  const DEFAULT_STATS = {
    accepted: 0,
    open: 0,
    received: 0,
    reviewing: 0,
    interviews: 0,
    closed: 0,
  };
  const BAR_ITEMS = [
    { key: "received", label: "Recebidos" },
    { key: "accepted", label: "Aceitos" },
    { key: "reviewing", label: "Em análise" },
  ];
  const DONUT_ITEMS = [
    { key: "reviewing", label: "Em análise", color: "#a5b4fc" },
    { key: "open", label: "Aberta", color: "#1e90ff" },
    { key: "closed", label: "Fechada", color: "#ef4444" },
  ];
  const COLORS = {
    brand: getToken("--brand", "#102569"),
    muted: getToken("--muted", "#475569"),
    bar: "#1e90ff",
  };
  const numberFormatter = new Intl.NumberFormat("pt-BR");
  const TEXT_NODE = typeof Node !== "undefined" ? Node.TEXT_NODE : 3;

  const state = {
    stats: { ...DEFAULT_STATS },
    owner: null,
    barData: [],
    donutData: [],
  };

  function getToken(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      name,
    );
    return value && value.trim() ? value.trim() : fallback;
  }

  function toInt(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.round(num));
  }

  function loadJobs(owner) {
    if (!owner) return [];
    if (window.MapsJobsStore?.loadOwner) {
      return window.MapsJobsStore.loadOwner(owner);
    }
    try {
      const raw = localStorage.getItem(`${JOBS_STORAGE}:${owner}`);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function summarizeJobs(jobs) {
    return jobs.reduce(
      (summary, job) => {
        const status = normalizeText(job?.status || "aberta");
        if (status.includes("fech")) summary.closed += 1;
        else if (status.includes("analise") || status.includes("andamento"))
          summary.reviewing += 1;
        else summary.open += 1;
        return summary;
      },
      { open: 0, reviewing: 0, closed: 0 },
    );
  }

  function applyAvatar(src) {
    const img = document.querySelector("[data-dashboard-avatar]");
    if (!img) return;
    const has = !!src;
    img.src = has ? src : EMPTY_IMAGE;
    img.alt = has ? "Logo da empresa" : "Logo da empresa";
    const wrapper = img.closest(".empresa-logo");
    if (wrapper) wrapper.classList.toggle("is-empty", !has);
  }

  function updateStatNodes() {
    document.querySelectorAll("[data-stat]").forEach((node) => {
      const key = node.dataset.stat;
      const value = state.stats[key] ?? 0;
      node.textContent = numberFormatter.format(value);
    });
  }

  function buildDatasets() {
    state.barData = BAR_ITEMS.map((item) => ({
      label: item.label,
      value: state.stats[item.key] || 0,
    }));
    state.donutData = DONUT_ITEMS.map((item) => ({
      label: item.label,
      value: state.stats[item.key] || 0,
      color: item.color,
    }));
  }

  function updateCharts() {
    buildDatasets();
    renderCharts();
  }

  function toggleFallback(canvas, show, message) {
    const fallback = canvas
      ?.closest(".chart-box")
      ?.querySelector(".chart-fallback");
    if (!fallback) return;
    if (show) {
      fallback.textContent =
        message || "Sem dados suficientes para exibir o gráfico.";
      fallback.style.display = "block";
      fallback.setAttribute("aria-hidden", "false");
    } else {
      fallback.textContent = "";
      fallback.style.display = "none";
      fallback.setAttribute("aria-hidden", "true");
    }
  }

  function updateLegend(legend, data, total) {
    if (!legend) return;
    const items = legend.querySelectorAll("li");
    items.forEach((item, index) => {
      const segment = data[index];
      if (!segment) return;
      const dot = item.querySelector(".legend-dot");
      if (dot && segment.color) dot.style.background = segment.color;
      const value = Number(segment.value) || 0;
      const percent = total > 0 ? Math.round((value / total) * 100) : 0;
      const text = ` ${segment.label} - ${value} (${percent}%)`;
      const textNode = Array.from(item.childNodes).find(
        (node) => node.nodeType === TEXT_NODE,
      );
      if (textNode) textNode.textContent = text;
      else item.append(document.createTextNode(text));
    });
  }

  function measureBarCanvas(canvas) {
    const parent = canvas.parentElement;
    const title = parent?.querySelector(".chart-title");
    const padding = 18;
    const minHeight = 260;
    const height = parent
      ? Math.max(
          minHeight,
          parent.clientHeight - (title?.offsetHeight || 0) - padding * 2,
        )
      : minHeight;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(
      320,
      Math.floor(rect.width || parent?.clientWidth || 320),
    );
    return { width: cssWidth, height };
  }

  function measureDonutCanvas(canvas) {
    const box = canvas.closest(".chart-box");
    const group = canvas.closest(".chart-with-legend");
    const legend = group?.querySelector(".chart-legend");
    const title = box?.querySelector(".chart-title");
    const padding = 18;
    const minHeight = 240;
    const baseHeight = box
      ? Math.max(
          minHeight,
          box.clientHeight - (title?.offsetHeight || 0) - padding * 2,
        )
      : minHeight;
    const baseWidth =
      group?.getBoundingClientRect().width ||
      canvas.getBoundingClientRect().width ||
      260;
    const legendWidth = legend?.getBoundingClientRect().width || 0;
    const maxLegend =
      legendWidth && legendWidth < baseWidth * 0.6 ? legendWidth : 0;
    return {
      width: Math.max(260, Math.floor(baseWidth - maxLegend - 24)),
      height: baseHeight,
    };
  }

  function configureCanvas(canvas, size) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    return ctx;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawBarChart(canvas, data) {
    if (!canvas) return;
    const total = data.reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0,
    );
    toggleFallback(
      canvas,
      total <= 0,
      "Cadastre currículos para visualizar este gráfico.",
    );
    if (total <= 0) {
      configureCanvas(canvas, measureBarCanvas(canvas));
      return;
    }

    const size = measureBarCanvas(canvas);
    const ctx = configureCanvas(canvas, size);
    if (!ctx) return;

    const margin = { top: 12, right: 24, bottom: 56, left: 44 };
    const innerWidth = size.width - margin.left - margin.right;
    const innerHeight = size.height - margin.top - margin.bottom;
    const values = data.map((item) => Number(item.value) || 0);
    const maxValue = Math.max(...values);
    const yMax = Math.max(4, Math.ceil(maxValue / 4) * 4);
    const step = yMax / 4;
    const scaleY = (value) =>
      margin.top + innerHeight - (value / yMax) * innerHeight;

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + innerHeight);
    ctx.lineTo(margin.left + innerWidth, margin.top + innerHeight);
    ctx.stroke();

    ctx.font = '12px "Open Sans", system-ui, -apple-system, sans-serif';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLORS.muted;
    for (let value = 0; value <= yMax + 0.001; value += step) {
      const y = scaleY(value);
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + innerWidth, y);
      ctx.stroke();
      ctx.fillText(String(Math.round(value)), margin.left - 6, y);
    }

    const band = innerWidth / Math.max(1, data.length);
    const barWidth = Math.max(24, Math.floor(band * 0.72));

    data.forEach((item, index) => {
      const value = Number(item.value) || 0;
      const label = item.label || "";
      const x = margin.left + index * band + (band - barWidth) / 2;
      const y = scaleY(value);
      const height = margin.top + innerHeight - y;

      ctx.fillStyle = COLORS.bar;
      roundRect(ctx, x, y, barWidth, height, 6);
      ctx.fill();

      ctx.fillStyle = COLORS.brand;
      ctx.font = 'bold 12px "Montserrat", system-ui, -apple-system, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(value), x + barWidth / 2, y - 4);

      ctx.fillStyle = "#1f2937";
      ctx.font = '12px "Open Sans", system-ui, -apple-system, sans-serif';
      ctx.textBaseline = "top";
      ctx.fillText(label, x + barWidth / 2, margin.top + innerHeight + 8);
    });
  }

  function drawDonutChart(canvas, data) {
    if (!canvas) return;
    const total = data.reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0,
    );
    toggleFallback(canvas, total <= 0, "Abra vagas para gerar este gráfico.");

    const legend = canvas
      .closest(".chart-with-legend")
      ?.querySelector(".chart-legend");
    updateLegend(legend, data, total);
    if (total <= 0) {
      configureCanvas(canvas, measureDonutCanvas(canvas));
      return;
    }

    const size = measureDonutCanvas(canvas);
    const ctx = configureCanvas(canvas, size);
    if (!ctx) return;

    const cx = Math.floor(size.width / 2);
    const cy = Math.floor(size.height / 2);
    const radius = Math.floor(Math.min(size.width, size.height) * 0.38);
    const thickness = Math.max(22, Math.min(52, Math.floor(radius * 0.5)));

    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    let start = -Math.PI / 2;
    data.forEach((segment) => {
      const value = Number(segment.value) || 0;
      if (!value) return;
      const slice = (value / total) * Math.PI * 2;
      ctx.strokeStyle = segment.color || COLORS.bar;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + slice - 0.04);
      ctx.stroke();
      start += slice;
    });

    ctx.fillStyle = COLORS.brand;
    ctx.font = '900 26px "Montserrat", system-ui, -apple-system, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(total), cx, cy - 6);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '600 12px "Open Sans", system-ui, -apple-system, sans-serif';
    ctx.fillText("Total", cx, cy + 14);
  }

  function renderCharts() {
    const barCanvas = document.querySelector("#chartCandidatos");
    const donutCanvas = document.querySelector("#chartStatus");
    drawBarChart(barCanvas, state.barData);
    drawDonutChart(donutCanvas, state.donutData);
  }

  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function pick(metrics, profile, ...keys) {
    for (const key of keys) {
      if (metrics && Object.prototype.hasOwnProperty.call(metrics, key)) {
        const value = toInt(metrics[key]);
        if (value) return value;
      }
      if (profile && Object.prototype.hasOwnProperty.call(profile, key)) {
        const value = toInt(profile[key]);
        if (value) return value;
      }
    }
    return 0;
  }

  function deriveStats(session) {
    const profile = session?.profile || {};
    const metrics =
      (profile.dashboard && typeof profile.dashboard === "object"
        ? profile.dashboard
        : null) ||
      profile.metrics ||
      {};
    const stats = { ...DEFAULT_STATS };
    stats.accepted = pick(
      metrics,
      profile,
      "accepted",
      "curriculosAceitos",
      "aceitos",
    );
    stats.open = pick(metrics, profile, "open", "vagasAbertas", "abertas");
    stats.received = pick(
      metrics,
      profile,
      "received",
      "curriculos",
      "curriculosRecebidos",
    );
    stats.reviewing = pick(
      metrics,
      profile,
      "reviewing",
      "emAnalise",
      "analise",
    );
    stats.interviews = pick(
      metrics,
      profile,
      "interviews",
      "entrevistas",
      "agendaToday",
    );
    stats.closed = pick(
      metrics,
      profile,
      "closed",
      "vagasFechadas",
      "fechadas",
    );

    const owner = session?.id || null;
    const summary = summarizeJobs(loadJobs(owner));
    if (!stats.open && summary.open) stats.open = summary.open;
    if (!stats.reviewing && summary.reviewing)
      stats.reviewing = summary.reviewing;
    if (!stats.closed && summary.closed) stats.closed = summary.closed;

    const derivedTotal = stats.accepted + stats.reviewing + stats.closed;
    if (!stats.received && derivedTotal) stats.received = derivedTotal;
    stats.received = Math.max(0, stats.received);

    if (stats.received && !stats.accepted && stats.reviewing) {
      const rest = stats.received - stats.reviewing - stats.closed;
      stats.accepted = Math.max(0, rest);
    }
    if (stats.received && !stats.reviewing && stats.accepted) {
      const rest = stats.received - stats.accepted - stats.closed;
      stats.reviewing = Math.max(0, rest);
    }
    if (stats.received && !stats.closed) {
      const rest = stats.received - stats.accepted - stats.reviewing;
      stats.closed = Math.max(0, rest);
    }

    stats.interviews = stats.interviews || 0;
    return stats;
  }

  function applyStats(session) {
    const stats = session ? deriveStats(session) : { ...DEFAULT_STATS };
    state.stats = stats;
    state.owner = session?.id || null;
    applyAvatar(session?.profile?.avatar || "");
    updateStatNodes();
    updateCharts();
  }

  function initAuth() {
    const auth = window.MapsAuth;
    if (!auth) {
      applyStats(null);
      return;
    }
    const refresh = () => applyStats(auth.current ? auth.current() : null);
    if (typeof auth.ready === "function") {
      auth
        .ready()
        .then(refresh)
        .catch(() => applyStats(null));
    } else {
      refresh();
    }
    if (typeof auth.onSession === "function") auth.onSession(applyStats);
  }

  function init() {
    applyStats(null);
    initAuth();
    window.addEventListener("resize", debounce(renderCharts, 120));
    window.MapsDashboard = Object.assign({}, window.MapsDashboard, {
      setStats(partial) {
        if (!partial || typeof partial !== "object") return;
        Object.entries(partial).forEach(([key, value]) => {
          if (Object.prototype.hasOwnProperty.call(state.stats, key)) {
            state.stats[key] = toInt(value);
          }
        });
        updateStatNodes();
        updateCharts();
      },
      setAvatar(src) {
        applyAvatar(src || "");
      },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
