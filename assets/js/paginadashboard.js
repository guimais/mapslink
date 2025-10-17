(function () {
  "use strict";

  let booted = false;
  let rszTimer = null;

  function token(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  const COLORS = {
    brand: token("--brand", "#102569"),
    muted: token("--muted", "#475569"),
    surface2: token("--surface-2", "#e6edf5"),
    bar: "#1e90ff"
  };

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawBarChart(canvas, dataset) {
    if (!canvas || !Array.isArray(dataset)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const title = parent ? parent.querySelector(".chart-title") : null;
    const padding = 18;
    const availH = parent
      ? Math.max(260, parent.clientHeight - (title ? title.offsetHeight : 0) - padding * 2)
      : 260;

    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(320, Math.floor(rect.width || 320));
    const cssH = Math.floor(availH);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const margin = { top: 12, right: 24, bottom: 56, left: 44 };
    const w = cssW - margin.left - margin.right;
    const h = cssH - margin.top - margin.bottom;

    ctx.clearRect(0, 0, cssW, cssH);

    const maxVal = Math.max.apply(null, dataset.map(d => d.value));
    let yMax = Math.max(4, Math.ceil(maxVal / 4) * 4);
    if (yMax < 12) yMax = 12;
    const tick = yMax / 5;
    const yScale = v => margin.top + h - (v / yMax) * h;

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + h);
    ctx.lineTo(margin.left + w, margin.top + h);
    ctx.stroke();

    ctx.fillStyle = COLORS.muted;
    ctx.font = '12px "Open Sans", system-ui, -apple-system, sans-serif';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let v = 0; v <= yMax + 0.0001; v += tick) {
      const yy = yScale(v);
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.moveTo(margin.left, yy);
      ctx.lineTo(margin.left + w, yy);
      ctx.stroke();
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(String(Math.round(v)), margin.left - 6, yy);
    }

    const n = dataset.length;
    const gapRatio = 0.28;
    const band = w / n;
    const barW = Math.max(24, Math.floor(band * (1 - gapRatio)));
    const barColor = COLORS.bar;

    const start = performance.now();
    const duration = 500;

    function drawFrame(now) {
      const t = Math.min(1, (now - start) / duration);
      const p = easeOutCubic(t);

      ctx.clearRect(margin.left + 1, margin.top + 1, w - 2, h - 2);
      for (let v = 0; v <= yMax + 0.0001; v += tick) {
        const yy = yScale(v);
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath();
        ctx.moveTo(margin.left, yy);
        ctx.lineTo(margin.left + w, yy);
        ctx.stroke();
      }

      dataset.forEach((d, i) => {
        const x = margin.left + i * band + (band - barW) / 2;
        const yTop = yScale(d.value * p);
        const barH = margin.top + h - yTop;

        ctx.fillStyle = barColor;
        drawRoundedRect(ctx, x, yTop, barW, barH, 6);
        ctx.fill();

        ctx.fillStyle = COLORS.brand;
        ctx.font = 'bold 12px "Montserrat", system-ui, -apple-system, sans-serif';
        ctx.textBaseline = "bottom";
        ctx.textAlign = "center";
        ctx.fillText(String(d.value), x + barW / 2, yTop - 4);

        ctx.fillStyle = "#1f2937";
        ctx.font = '12px "Open Sans", system-ui, -apple-system, sans-serif';
        ctx.textBaseline = "top";
        ctx.fillText(d.label, x + barW / 2, margin.top + h + 8);
      });

      if (t < 1) requestAnimationFrame(drawFrame);
    }

    requestAnimationFrame(drawFrame);
  }

  function drawDonutChart(canvas, dataset) {
    if (!canvas || !Array.isArray(dataset)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const box = canvas.closest(".chart-box");
    const title = box ? box.querySelector(".chart-title") : null;
    const padding = 18;
    const availH = box
      ? Math.max(240, box.clientHeight - (title ? title.offsetHeight : 0) - padding * 2)
      : 240;

    const group = canvas.closest(".chart-with-legend");
    const legend = group ? group.querySelector(".chart-legend") : null;
    const groupRect = group ? group.getBoundingClientRect() : { width: 0 };
    const legendRect = legend ? legend.getBoundingClientRect() : { width: 0 };
    const gapW = 24;
    const fallbackRect = canvas.getBoundingClientRect();
    const baseW = Math.max(260, Math.floor(groupRect.width || fallbackRect.width || 260));
    const effLegendW =
      legendRect.width && groupRect.width && legendRect.width < groupRect.width * 0.6
        ? legendRect.width
        : 0;

    const cssW = Math.max(260, Math.floor(baseW - effLegendW - gapW));
    const cssH = Math.floor(availH);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);

    const cx = Math.floor(cssW / 2);
    const cy = Math.floor(cssH / 2);
    const radius = Math.floor(Math.min(cssW, cssH) * 0.38);
    const thickness = Math.max(22, Math.min(52, Math.floor(radius * 0.5)));

    ctx.lineWidth = thickness;
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const total = dataset.reduce((s, d) => s + d.value, 0) || 1;
    const full = Math.PI * 2;
    const start = -Math.PI / 2;
    const gap = 0.06;

    const t0 = performance.now();
    const dur = 600;

    function frame(now) {
      const p = easeOutCubic(Math.min(1, (now - t0) / dur));
      const progressed = full * p;

      ctx.clearRect(
        cx - radius - thickness,
        cy - radius - thickness,
        (radius + thickness) * 2,
        (radius + thickness) * 2
      );

      ctx.lineWidth = thickness;
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      let acc = 0;
      dataset.forEach(seg => {
        const segAngle = (seg.value / total) * full;
        const target = Math.max(0, segAngle - gap);
        const drawAngle = Math.min(target, Math.max(0, progressed - acc));
        if (drawAngle > 0.0001) {
          ctx.strokeStyle = seg.color;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, start + acc + gap / 2, start + acc + gap / 2 + drawAngle);
          ctx.stroke();
        }
        acc += segAngle;
      });

      ctx.fillStyle = COLORS.brand;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '900 26px "Montserrat", system-ui, -apple-system, sans-serif';
      ctx.fillText(String(total), cx, cy - 6);
      ctx.fillStyle = COLORS.muted;
      ctx.font = '600 12px "Open Sans", system-ui, -apple-system, sans-serif';
      ctx.fillText("Total", cx, cy + 14);

      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function renderCandidatos() {
    const canvas = document.getElementById("chartCandidatos");
    if (!canvas) return;
    const data = [
      { label: "Desenvolvedor", value: 13 },
      { label: "Designer", value: 9 },
      { label: "Gerente", value: 2 }
    ];
    drawBarChart(canvas, data);
  }

  function renderStatus() {
    const canvas = document.getElementById("chartStatus");
    if (!canvas) return;

    const ANALISE = "#a5b4fc";
    const ABERTA = "#1e90ff";
    const FECHADA = "#ef4444";
    const data = [
      { label: "Em análise", value: 6, color: ANALISE },
      { label: "Aberta", value: 12, color: ABERTA },
      { label: "Fechada", value: 18, color: FECHADA }
    ];

    drawDonutChart(canvas, data);

    const legend = canvas.closest(".chart-with-legend")?.querySelector(".chart-legend");
    if (legend) {
      const items = legend.querySelectorAll("li");
      const sum = data.reduce((s, d) => s + d.value, 0) || 1;
      const percent = v => Math.round((v / sum) * 100);
      const colors = [ANALISE, ABERTA, FECHADA];
      items.forEach((li, i) => {
        const seg = data[i];
        if (!seg) return;
        li.innerHTML = `<span class="legend-dot" style="background:${colors[i]}"></span> ${seg.label} - ${seg.value} (${percent(seg.value)}%)`;
      });
    }
  }

  function renderAll() {
    renderCandidatos();
    renderStatus();
  }

  function boot() {
    if (booted) return;
    booted = true;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderAll, { once: true });
    } else {
      renderAll();
    }

    window.addEventListener("resize", () => {
      clearTimeout(rszTimer);
      rszTimer = setTimeout(renderAll, 120);
    });
  }

  boot();
})();
