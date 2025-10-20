(() => {
  if (window.__ml_dashboard_init__) return;
  window.__ml_dashboard_init__ = true;

  const DATASETS = {
    bar: [
      { label: "Desenvolvedor", value: 13 },
      { label: "Designer", value: 9 },
      { label: "Gerente", value: 2 }
    ],
    donut: [
      { label: "Em análise", value: 6, color: "#a5b4fc" },
      { label: "Aberta", value: 12, color: "#1e90ff" },
      { label: "Fechada", value: 18, color: "#ef4444" }
    ]
  };

  const COLORS = {
    brand: getToken("--brand", "#102569"),
    muted: getToken("--muted", "#475569"),
    bar: "#1e90ff"
  };

  function getToken(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value && value.trim() ? value.trim() : fallback;
  }

  function measureBarCanvas(canvas) {
    const parent = canvas.parentElement;
    const title = parent?.querySelector(".chart-title");
    const padding = 18;
    const minHeight = 260;
    const height = parent ? Math.max(minHeight, parent.clientHeight - (title?.offsetHeight || 0) - padding * 2) : minHeight;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(320, Math.floor(rect.width || parent?.clientWidth || 320));
    return { width: cssWidth, height };
  }

  function measureDonutCanvas(canvas) {
    const box = canvas.closest(".chart-box");
    const group = canvas.closest(".chart-with-legend");
    const legend = group?.querySelector(".chart-legend");
    const title = box?.querySelector(".chart-title");
    const padding = 18;
    const minHeight = 240;
    const baseHeight = box ? Math.max(minHeight, box.clientHeight - (title?.offsetHeight || 0) - padding * 2) : minHeight;
    const baseWidth = group?.getBoundingClientRect().width || canvas.getBoundingClientRect().width || 260;
    const legendWidth = legend?.getBoundingClientRect().width || 0;
    const maxLegend = legendWidth && legendWidth < baseWidth * 0.6 ? legendWidth : 0;
    return { width: Math.max(260, Math.floor(baseWidth - maxLegend - 24)), height: baseHeight };
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
    const size = measureBarCanvas(canvas);
    const ctx = configureCanvas(canvas, size);
    if (!ctx || !data.length) return;

    const margin = { top: 12, right: 24, bottom: 56, left: 44 };
    const innerWidth = size.width - margin.left - margin.right;
    const innerHeight = size.height - margin.top - margin.bottom;
    const values = data.map(item => Number(item.value) || 0);
    const maxValue = values.length ? Math.max(...values) : 0;
    const yMax = Math.max(12, Math.ceil(maxValue / 4) * 4);
    const step = yMax / 5;

    const scaleY = value => margin.top + innerHeight - (value / yMax) * innerHeight;

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
    const size = measureDonutCanvas(canvas);
    const ctx = configureCanvas(canvas, size);
    if (!ctx || !data.length) return;

    const group = canvas.closest(".chart-with-legend");
    const legend = group?.querySelector(".chart-legend");
    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
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
    data.forEach(segment => {
      const value = Number(segment.value) || 0;
      const slice = Math.max(0, value / total) * Math.PI * 2;
      if (!slice) return;
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

    if (legend) {
      const items = legend.querySelectorAll("li");
      items.forEach((item, index) => {
        const segment = data[index];
        if (!segment) return;
        const percent = Math.round((segment.value / total) * 100);
        item.innerHTML = `<span class="legend-dot" style="background:${segment.color}"></span> ${segment.label} - ${segment.value} (${percent}%)`;
      });
    }
  }

  function render() {
    const barCanvas = document.querySelector("#chartCandidatos");
    const donutCanvas = document.querySelector("#chartStatus");
    if (barCanvas) drawBarChart(barCanvas, DATASETS.bar);
    if (donutCanvas) drawDonutChart(donutCanvas, DATASETS.donut);
  }

  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function init() {
    render();
    window.addEventListener("resize", debounce(render, 120));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
