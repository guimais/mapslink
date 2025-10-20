(function () {
  "use strict";

  const $ = selector => document.querySelector(selector);

  const COLORS = {
    brand: readToken("--brand", "#102569"),
    muted: readToken("--muted", "#475569"),
    bar: "#1e90ff"
  };

  function readToken(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value && value.trim() ? value.trim() : fallback;
  }

  function drawBarChart(canvas, dataset) {
    if (!canvas || !Array.isArray(dataset)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const title = parent ? parent.querySelector(".chart-title") : null;
    const padding = 18;
    const availHeight = parent
      ? Math.max(260, parent.clientHeight - (title ? title.offsetHeight : 0) - padding * 2)
      : 260;

    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(320, Math.floor(rect.width || (parent ? parent.clientWidth : 320)));
    const cssH = Math.floor(availHeight);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);

    const margin = { top: 12, right: 24, bottom: 56, left: 44 };
    const innerW = cssW - margin.left - margin.right;
    const innerH = cssH - margin.top - margin.bottom;

    const values = dataset.map(item => Number(item?.value) || 0);
    const maxVal = values.length ? Math.max(...values) : 0;
    const yMax = Math.max(12, Math.ceil(maxVal / 4) * 4);
    const tick = yMax / 5;

    const yScale = v => margin.top + innerH - (v / yMax) * innerH;

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + innerH);
    ctx.lineTo(margin.left + innerW, margin.top + innerH);
    ctx.stroke();

    ctx.font = '12px "Open Sans", system-ui, -apple-system, sans-serif';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLORS.muted;
    for (let v = 0; v <= yMax + 0.001; v += tick) {
      const y = yScale(v);
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + innerW, y);
      ctx.stroke();
      ctx.fillText(String(Math.round(v)), margin.left - 6, y);
    }

    const n = Math.max(1, dataset.length);
    const gapRatio = 0.28;
    const band = innerW / n;
    const barWidth = Math.max(24, Math.floor(band * (1 - gapRatio)));

    dataset.forEach((item, index) => {
      const value = Number(item?.value) || 0;
      const label = item?.label || "";
      const x = margin.left + index * band + (band - barWidth) / 2;
      const y = yScale(value);
      const barHeight = margin.top + innerH - y;

      ctx.fillStyle = COLORS.bar;
      roundRect(ctx, x, y, barWidth, barHeight, 6);
      ctx.fill();

      ctx.fillStyle = COLORS.brand;
      ctx.font = 'bold 12px "Montserrat", system-ui, -apple-system, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(value), x + barWidth / 2, y - 4);

      ctx.fillStyle = "#1f2937";
      ctx.font = '12px "Open Sans", system-ui, -apple-system, sans-serif';
      ctx.textBaseline = "top";
      ctx.fillText(label, x + barWidth / 2, margin.top + innerH + 8);
    });
  }

  function drawDonutChart(canvas, dataset) {
    if (!canvas || !Array.isArray(dataset)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const group = canvas.closest(".chart-with-legend");
    const legend = group ? group.querySelector(".chart-legend") : null;
    const box = canvas.closest(".chart-box");
    const title = box ? box.querySelector(".chart-title") : null;
    const padding = 18;
    const availHeight = box
      ? Math.max(240, box.clientHeight - (title ? title.offsetHeight : 0) - padding * 2)
      : 240;

    const groupRect = group ? group.getBoundingClientRect() : { width: 0 };
    const legendRect = legend ? legend.getBoundingClientRect() : { width: 0 };
    const gap = 24;
    const baseWidth = Math.max(260, Math.floor(groupRect.width || canvas.getBoundingClientRect().width || 260));
    const legendWidth = legendRect.width && legendRect.width < baseWidth * 0.6 ? legendRect.width : 0;
    const cssW = Math.max(260, Math.floor(baseWidth - legendWidth - gap));
    const cssH = Math.floor(availHeight);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);

    const cx = Math.floor(cssW / 2);
    const cy = Math.floor(cssH / 2);
    const radius = Math.floor(Math.min(cssW, cssH) * 0.38);
    const thickness = Math.max(22, Math.min(52, Math.floor(radius * 0.5)));
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";

    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const total = dataset.reduce((sum, item) => sum + (Number(item?.value) || 0), 0) || 1;
    let start = -Math.PI / 2;
    dataset.forEach(item => {
      const value = Number(item?.value) || 0;
      const fraction = Math.max(0, value / total);
      const slice = fraction * Math.PI * 2;
      if (slice <= 0) return;
      ctx.strokeStyle = item?.color || COLORS.bar;
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
      const percent = value => Math.round((value / total) * 100);
      items.forEach((li, index) => {
        const seg = dataset[index];
        if (!seg) return;
        li.innerHTML = `<span class="legend-dot" style="background:${seg.color}"></span> ${seg.label} - ${seg.value} (${percent(seg.value)}%)`;
      });
    }
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

  function renderCharts() {
    drawBarChart($("#chartCandidatos"), [
      { label: "Desenvolvedor", value: 13 },
      { label: "Designer", value: 9 },
      { label: "Gerente", value: 2 }
    ]);

    drawDonutChart($("#chartStatus"), [
      { label: "Em analise", value: 6, color: "#a5b4fc" },
      { label: "Aberta", value: 12, color: "#1e90ff" },
      { label: "Fechada", value: 18, color: "#ef4444" }
    ]);
  }

  function init() {
    renderCharts();
    window.addEventListener("resize", debounce(renderCharts, 120));
  }

  function debounce(fn, wait) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

