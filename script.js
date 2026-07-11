const video = document.querySelector(".hero-video__media");
const hero = document.querySelector(".hero-video");
const shell = document.querySelector(".presentation-shell");
const revealSections = document.querySelectorAll(".reveal-section");
const snapSections = shell
  ? [...shell.querySelectorAll(":scope > section")].filter(
      (section) =>
        section.id !== "development-legacy" &&
        section.id !== "development-slide" &&
        section.id !== "multi-market-legacy" &&
        section.id !== "financial"
    )
  : [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealTimer;
let isScrollLocked = false;

const revealIntro = () => {
  if (!hero || hero.classList.contains("is-revealed")) return;

  window.clearTimeout(revealTimer);
  revealTimer = window.setTimeout(
    () => hero.classList.add("is-revealed"),
    prefersReducedMotion ? 100 : 3200,
  );
};

const tryAutoplay = async () => {
  if (!video) {
    revealIntro();
    return;
  }

  try {
    await video.play();
    revealIntro();
  } catch {
    video.controls = true;
    revealIntro();
  }
};

const formatFaNumber = (value, decimals = 0) =>
  new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);

const animateCount = (element) => {
  if (!element || element.dataset.animated === "true") return;

  const target = Number(element.dataset.count || "0");
  const decimals = Number(element.dataset.decimals || "0");
  const suffix = element.dataset.suffix || "";
  const compact = element.dataset.compact === "true";
  const duration = prefersReducedMotion ? 1 : 1400;
  const startAt = performance.now();

  element.dataset.animated = "true";

  const step = (now) => {
    const progress = Math.min((now - startAt) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const current = target * eased;
    element.textContent = compact
      ? `${formatFaNumber(current / 1000000, 2)} میلیون`
      : `${formatFaNumber(current, decimals)}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

const CHART_THEMES = {
  gold: { a: ["#f7d98a", "#c9972d"], b: ["#8eb2ed", "#335780"], accent: "#f0c565" },
  blue: { a: ["#f7d98a", "#c9972d"], b: ["#8eb2ed", "#335780"], accent: "#f0c565" },
};

const faPercent = (value) => `${formatFaNumber(Math.round(value))}٪`;

const buildMetricChart = (el) => {
  if (!el || el.dataset.built === "true" || typeof ApexCharts === "undefined") return;
  el.dataset.built = "true";

  const a = Number(el.dataset.valueA || "0");
  const b = Number(el.dataset.valueB || "0");
  const nameA = el.dataset.nameA || "بورس تهران";
  const nameB = el.dataset.nameB || "فرابورس ایران";
  const unit = el.dataset.unit || "";
  const theme = CHART_THEMES[el.dataset.theme] || CHART_THEMES.gold;
  const totalValue = formatFaNumber(a);

  const options = {
    chart: {
      type: "donut",
      height: 288,
      fontFamily: "inherit",
      foreColor: "#e9e4d7",
      animations: {
        enabled: !prefersReducedMotion,
        speed: 900,
        easing: "easeinout",
        animateGradually: { enabled: true, delay: 200 },
        dynamicAnimation: { enabled: true, speed: 400 },
      },
      dropShadow: { enabled: true, top: 6, blur: 12, opacity: 0.32, color: "#000" },
    },
    series: [a, b],
    labels: [nameA, nameB],
    colors: [theme.a[0], theme.b[0]],
    fill: {
      type: "gradient",
      gradient: {
        type: "diagonal2",
        shadeIntensity: 0.55,
        gradientToColors: [theme.a[1], theme.b[1]],
        inverseColors: false,
        stops: [0, 100],
      },
    },
    stroke: { width: 2, colors: ["#0b1a30"] },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { fontSize: "15px", fontWeight: 700, color: "#e9e4d7", offsetY: -6 },
            value: {
              fontSize: "30px",
              fontWeight: 800,
              color: "#fbf7ec",
              offsetY: 6,
              formatter: (val) => formatFaNumber(Number(val)),
            },
            total: {
              show: true,
              showAlways: true,
              label: "سهم بورس تهران",
              fontSize: "13px",
              fontWeight: 700,
              color: theme.accent,
              formatter: () => totalValue,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => faPercent(val),
      style: { fontSize: "15px", fontWeight: 800, colors: ["#0b1a30"] },
      dropShadow: { enabled: false },
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => `${formatFaNumber(val)} ${unit}`.trim() },
    },
    states: {
      hover: { filter: { type: "lighten", value: 0.06 } },
      active: { filter: { type: "darken", value: 0.1 } },
    },
    responsive: [
      { breakpoint: 720, options: { chart: { height: 260 } } },
    ],
  };

  const chart = new ApexCharts(el, options);
  chart.render();
};

const activateTodaySection = (section) => {
  if (!section || section.dataset.activated === "true") return;

  section.dataset.activated = "true";
  section.classList.add("is-visible");

  section.querySelectorAll("[data-count]").forEach(animateCount);
  section.querySelectorAll(".metric-chart").forEach(buildMetricChart);
};

/* ---- Interactive 3D industry pie (stylized SVG, no dependencies) ---- */
const PIE_ICONS = {
  flask:
    '<path d="M9 3h6M10 3v5.5L5.2 17.4A2 2 0 0 0 7 20.4h10a2 2 0 0 0 1.8-3L14 8.5V3M8.5 14h7"/>',
  ingot:
    '<path d="M6 10h12l2 4H4zM3 18h18M8 10l1-3h6l1 3"/>',
  layers:
    '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
  drop:
    '<path d="M12 3.5s6.5 7 6.5 11.2A6.5 6.5 0 0 1 5.5 14.7C5.5 10.5 12 3.5 12 3.5z"/>',
  bank:
    '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
  grid:
    '<path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/>',
};

const hexShade = (hex, factor) => {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * factor);
  const g = clamp(((n >> 8) & 255) * factor);
  const b = clamp((n & 255) * factor);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const buildIndustryPie = (root) => {
  if (!root || root.dataset.built === "true") return;
  root.dataset.built = "true";

  const cx = 450;
  const cy = 272;
  const R = 156;
  const K = 0.48;
  const startDeg = -90;
  const VBW = 900;
  const VBH = 560;
  const heightOf = (share) => share * 3.6 + 16;

  const data = [
    { key: "chem", name: "محصولات شیمیایی", short: "محصولات شیمیایی", share: 26, top: "#f0c565", dark: "#9a6b17", big: true, icon: PIE_ICONS.flask },
    { key: "metal", name: "فلزات اساسی", short: "فلزات اساسی", share: 22, top: "#6f94cf", dark: "#274a79", big: true, icon: PIE_ICONS.ingot },
    { key: "multi", name: "شرکت‌های چندرشته‌ای صنعتی", short: "چندرشته‌ای صنعتی", share: 9, top: "#39c0b8", dark: "#0f726f", big: true, icon: PIE_ICONS.layers },
    { key: "oil", name: "فرآورده‌های نفتی", short: "فرآورده‌های نفتی", share: 9, top: "#ef8d37", dark: "#8d4c14", big: true, icon: PIE_ICONS.drop },
    { key: "bank", name: "بانک‌ها و مؤسسات اعتباری", short: "بانک‌ها و مؤسسات", share: 8, top: "#8f8ff0", dark: "#464191", big: true, icon: PIE_ICONS.bank },
    { key: "other", name: "سایر صنایع", short: "سایر صنایع", share: 26, top: "#98a4b8", dark: "#465264", big: false, icon: PIE_ICONS.grid },
  ];

  const rad = (deg) => (deg * Math.PI) / 180;
  let acc = startDeg;
  data.forEach((d) => {
    d.a1 = acc;
    d.a2 = acc + (d.share / 100) * 360;
    acc = d.a2;
    d.mid = (d.a1 + d.a2) / 2;
    d.midRad = rad(d.mid);
    d.h = heightOf(d.share);
  });

  const P = (deg, r, h) => {
    const a = rad(deg);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a) * K - h];
  };
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const arcTo = (p, r, large, sweep) =>
    `A ${r} ${(r * K).toFixed(1)} 0 ${large} ${sweep} ${f(p)}`;

  // ---- faces, drawn back-to-front by slice depth ----
  const order = [...data].sort((a, b) => Math.sin(a.midRad) - Math.sin(b.midRad));
  let defs = "";
  let faces = "";
  order.forEach((d) => {
    const large = d.a2 - d.a1 > 180 ? 1 : 0;
    const parts = [];

    defs +=
      `<linearGradient id="wall-${d.key}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${hexShade(d.top, 0.78)}"/>` +
      `<stop offset="1" stop-color="${hexShade(d.dark, 0.82)}"/>` +
      `</linearGradient>`;

    if (Math.sin(d.midRad) > 0) {
      parts.push(
        `<path class="pie3d__wall" d="M ${f(P(d.a1, R, 0))} ${arcTo(P(d.a2, R, 0), R, large, 1)} L ${f(P(d.a2, R, d.h))} ${arcTo(P(d.a1, R, d.h), R, large, 0)} Z" fill="url(#wall-${d.key})"/>`,
      );
    }
    [d.a1, d.a2].forEach((edge) => {
      if (Math.sin(rad(edge)) < -0.15) return;
      parts.push(
        `<path class="pie3d__wall" d="M ${cx} ${cy} L ${f(P(edge, R, 0))} L ${f(P(edge, R, d.h))} L ${cx} ${(cy - d.h).toFixed(1)} Z" fill="${hexShade(d.dark, 0.66)}"/>`,
      );
    });
    parts.push(
      `<path class="pie3d__top" d="M ${cx} ${(cy - d.h).toFixed(1)} L ${f(P(d.a1, R, d.h))} ${arcTo(P(d.a2, R, d.h), R, large, 1)} Z" fill="${d.top}"/>`,
    );

    faces += `<g class="pie-slice" data-key="${d.key}">${parts.join("")}</g>`;
  });

  // ---- leader lines + labels, stacked in left/right columns ----
  const groups = { right: [], left: [] };
  data.forEach((d) => groups[Math.cos(d.midRad) >= 0 ? "right" : "left"].push(d));

  const boxW = 196;
  const boxH = 84;
  const gap = 20;
  let leaders = "";
  let labels = "";

  Object.entries(groups).forEach(([side, list]) => {
    list.sort((a, b) => P(a.mid, R, a.h / 2)[1] - P(b.mid, R, b.h / 2)[1]);
    const totalH = list.length * boxH + (list.length - 1) * gap;
    let y = (VBH - totalH) / 2;

    list.forEach((d) => {
      const boxX = side === "right" ? VBW - 12 - boxW : 12;
      const dotX = side === "right" ? boxX : boxX + boxW;
      const dotY = y + boxH / 2;
      const anchor = P(d.mid, R, d.h / 2);

      leaders +=
        `<g class="pie-leader" data-key="${d.key}">` +
        `<polyline points="${f(anchor)} ${anchor[0].toFixed(1)},${dotY} ${dotX},${dotY}" fill="none" stroke="${d.top}" stroke-width="1.5"/>` +
        `<circle cx="${dotX}" cy="${dotY}" r="4.5" fill="${d.top}"/></g>`;

      const styleStr =
        `--c:${d.top};` +
        `left:${((boxX / VBW) * 100).toFixed(2)}%;` +
        `top:${((y / VBH) * 100).toFixed(2)}%;` +
        `width:${((boxW / VBW) * 100).toFixed(2)}%;` +
        `height:${((boxH / VBH) * 100).toFixed(2)}%;`;
      labels +=
        `<div class="pie-label ind-label ind-label--${side}" data-key="${d.key}" style="${styleStr}">` +
        `<span class="ind-label__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d.icon}</svg></span>` +
        `<span class="ind-label__text"><span class="ind-label__name">${d.short}</span><span class="ind-label__value">${faPercent(d.share)}</span></span>` +
        `</div>`;

      y += boxH + gap;
    });
  });

  root.innerHTML =
    `<svg class="pie3d" viewBox="0 0 ${VBW} ${VBH}" role="img" aria-label="سهم صنایع از ارزش بازار سهام">` +
    `<defs>${defs}</defs>` +
    `<g class="pie3d__faces">${faces}</g>` +
    `<g class="pie3d__leaders">${leaders}</g>` +
    `</svg>` +
    labels;

  // ---- interactivity: link slices <-> labels <-> summary card ----
  const svg = root.querySelector("svg");
  const els = {
    card: document.getElementById("focus-summary"),
    ring: document.getElementById("focus-ring"),
    ringVal: document.getElementById("focus-ring-value"),
    eyebrow: document.getElementById("focus-eyebrow"),
    title: document.getElementById("focus-title"),
    text: document.getElementById("focus-text"),
    barMajor: document.getElementById("focus-bar-major"),
    barMinor: document.getElementById("focus-bar-minor"),
    barMajorLabel: document.getElementById("focus-bar-major-label"),
    barMinorLabel: document.getElementById("focus-bar-minor-label"),
    barMajorValue: document.getElementById("focus-bar-major-value"),
    barMinorValue: document.getElementById("focus-bar-minor-value"),
  };
  const defaults = {
    title: els.title?.textContent || "",
    text: els.text?.textContent || "",
    eyebrow: els.eyebrow?.textContent || "",
  };

  const updateSummary = (d) => {
    const rest = 100 - d.share;
    if (els.ring) {
      els.ring.style.setProperty("--share", d.share);
      els.ring.style.setProperty("--c", d.top);
    }
    if (els.ringVal) els.ringVal.textContent = faPercent(d.share);
    if (els.eyebrow) {
      els.eyebrow.textContent = d.big ? "جزو پنج صنعت بزرگ" : "خارج از پنج صنعت بزرگ";
      els.eyebrow.style.color = d.top;
    }
    if (els.title) {
      els.title.innerHTML =
        `<span class="focus-title__icon" style="color:${d.top}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d.icon}</svg></span>${d.name}`;
    }
    if (els.text) els.text.textContent = `این گروه ${faPercent(d.share)} از ارزش بازار سهام بورس تهران را در اختیار دارد.`;

    if (els.barMajor) {
      els.barMajor.style.setProperty("--w", d.share);
      els.barMajor.style.background = `linear-gradient(90deg, ${hexShade(d.top, 0.72)}, ${d.top})`;
    }
    if (els.barMinor) els.barMinor.style.setProperty("--w", rest);
    if (els.barMajorLabel) els.barMajorLabel.textContent = d.short;
    if (els.barMinorLabel) els.barMinorLabel.textContent = "سایر بازار";
    if (els.barMajorValue) els.barMajorValue.textContent = faPercent(d.share);
    if (els.barMinorValue) els.barMinorValue.textContent = faPercent(rest);
  };

  const resetSummary = () => {
    if (els.ring) {
      els.ring.style.setProperty("--share", 74);
      els.ring.style.removeProperty("--c");
    }
    if (els.ringVal) els.ringVal.textContent = "۷۴٪";
    if (els.eyebrow) {
      els.eyebrow.textContent = defaults.eyebrow;
      els.eyebrow.style.removeProperty("color");
    }
    if (els.title) els.title.textContent = defaults.title;
    if (els.text) els.text.textContent = defaults.text;

    if (els.barMajor) {
      els.barMajor.style.setProperty("--w", 74);
      els.barMajor.style.removeProperty("background");
    }
    if (els.barMinor) els.barMinor.style.setProperty("--w", 26);
    if (els.barMajorLabel) els.barMajorLabel.textContent = "پنج صنعت بزرگ";
    if (els.barMinorLabel) els.barMinorLabel.textContent = "سایر صنایع";
    if (els.barMajorValue) els.barMajorValue.textContent = "۷۴٪";
    if (els.barMinorValue) els.barMinorValue.textContent = "۲۶٪";
  };

  const setActive = (key) => {
    root.classList.toggle("has-active", Boolean(key));
    root.querySelectorAll("[data-key]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.key === key);
    });
    const d = key && data.find((x) => x.key === key);
    if (d) updateSummary(d);
    else resetSummary();
  };

  root.querySelectorAll(".pie-slice, .pie-label, .pie-leader").forEach((el) => {
    el.addEventListener("mouseenter", () => setActive(el.dataset.key));
    el.addEventListener("mouseleave", () => setActive(null));
  });
};

const toTrillionToman = (billionRial) => billionRial / 10000;

const IRAN_SILHOUETTE_PATH =
  "M169 78 L132 104 L115 145 L88 191 L96 239 L125 284 L121 331 L140 371 L184 410 L208 451 L245 491 L294 525 L349 550 L403 545 L454 516 L494 485 L520 458 L553 427 L584 384 L615 339 L650 292 L671 245 L671 197 L641 155 L603 120 L559 93 L507 81 L465 58 L418 54 L374 68 L335 91 L288 106 L246 102 L208 88 Z";

const ACCESS_MAP_DATA = [
  { key: "tabriz", name: "تبریز", value: 287436, x: 205, y: 118, labelDx: -40, labelDy: -30, pinned: true },
  { key: "ardabil", name: "اردبیل", value: 214216, x: 268, y: 82, labelDx: 16, labelDy: -34, pinned: false },
  { key: "rasht", name: "رشت", value: 2426189, x: 294, y: 126, labelDx: 74, labelDy: -10, pinned: true },
  { key: "sari", name: "ساری", value: 69617, x: 430, y: 126, labelDx: 68, labelDy: -28, pinned: false },
  { key: "alborz", name: "البرز", value: 167038, x: 332, y: 169, labelDx: 68, labelDy: -10, pinned: false },
  { key: "qazvin", name: "قزوین", value: 55428, x: 272, y: 196, labelDx: -92, labelDy: 6, pinned: false },
  { key: "zanjan", name: "زنجان", value: 76399, x: 221, y: 178, labelDx: -90, labelDy: -2, pinned: false },
  { key: "urmia", name: "ارومیه", value: 44517, x: 155, y: 156, labelDx: -92, labelDy: 10, pinned: false },
  { key: "qom", name: "قم", value: 96597, x: 324, y: 222, labelDx: -98, labelDy: 8, pinned: false },
  { key: "kermanshah", name: "کرمانشاه", value: 33325, x: 222, y: 262, labelDx: -102, labelDy: 10, pinned: false },
  { key: "hamedan", name: "همدان", value: 28614, x: 257, y: 302, labelDx: -98, labelDy: 2, pinned: false },
  { key: "isfahan", name: "اصفهان", value: 774102, x: 351, y: 342, labelDx: -88, labelDy: 24, pinned: true },
  { key: "ahvaz", name: "اهواز", value: 69291, x: 273, y: 430, labelDx: -36, labelDy: 62, pinned: false },
  { key: "shiraz", name: "شیراز", value: 69626, x: 363, y: 455, labelDx: -88, labelDy: 72, pinned: false },
  { key: "kish", name: "کیش", value: 136304, x: 412, y: 520, labelDx: -22, labelDy: 44, pinned: false },
  { key: "bandarabbas", name: "بندرعباس", value: 1336, x: 455, y: 506, labelDx: 72, labelDy: 42, pinned: false },
  { key: "yazd", name: "یزد", value: 26915, x: 437, y: 284, labelDx: 118, labelDy: 0, pinned: false },
  { key: "birjand", name: "بیرجند", value: 1660, x: 508, y: 326, labelDx: 118, labelDy: -10, pinned: false },
  { key: "kerman", name: "کرمان", value: 13174, x: 542, y: 398, labelDx: 116, labelDy: -2, pinned: false },
  { key: "zahedan", name: "زاهدان", value: 2764, x: 593, y: 512, labelDx: 116, labelDy: 2, pinned: false },
  { key: "semnan", name: "سمنان", value: 1023, x: 522, y: 170, labelDx: 118, labelDy: -18, pinned: false },
  { key: "mashhad", name: "مشهد", value: 2309975, x: 618, y: 204, labelDx: 88, labelDy: -8, pinned: true },
];

const getHeatColor = (value) => {
  if (value >= 1000000) return "#e7c46f";
  if (value >= 200000) return "#7994c7";
  return "#5f6f88";
};

const MAP_REGION_LABELS = {
  "IR-19": "رشت",
  "IR-29": "بیرجند",
  "IR-11": "زنجان",
  "IR-10": "اهواز",
  "IR-14": "شیراز",
  "IR-28": "قزوین",
  "IR-01": "تبریز",
  "IR-26": "قم",
  "IR-30": "مشهد",
  "IR-04": "اصفهان",
  "IR-21": "ساری",
  "IR-23": "بندرعباس",
  "IR-15": "کرمان",
  "IR-25": "یزد",
  "IR-24": "همدان",
  "IR-12": "سمنان",
  "IR-02": "ارومیه",
  "IR-17": "کرمانشاه",
  "IR-03": "اردبیل",
  "IR-32": "کرج",
  "IR-13": "زاهدان",
};

const MAP_MARKER_OVERRIDES = {
  "IR-23-136304": "کیش",
};

const getMapRegionLabel = (item) =>
  MAP_MARKER_OVERRIDES[`${item.provinceId}-${item.value}`] ||
  MAP_REGION_LABELS[item.provinceId] ||
  item.label;

const formatTrillionToman = (value) => `${formatFaNumber(value, 0)} هزار میلیارد تومان`;

const buildIranHeatmap = (root) => {
  if (!root || root.dataset.built === "true") return;
  root.dataset.built = "true";

  const mapData = window.IRAN_MAP;
  if (!mapData) {
    root.innerHTML = "";
    return;
  }

  const [vbX, vbY, vbw, vbh] = mapData.viewBox;
  const maxValue = Math.max(...mapData.markers.map((item) => item.value));

  const provincePaths = mapData.provinces.map((province) => {
    const value = mapData.provinceValues[province.id] || 0;
    const level = value >= 1000000 ? "high" : value >= 200000 ? "mid" : value > 0 ? "low" : "base";
    return `<path class="iran-province iran-province--${level}" data-key="${province.id}" d="${province.d}"></path>`;
  }).join("");

  const heatCircles = mapData.markers.map((item) => {
    const score = Math.max(item.value / maxValue, 0.06);
    const radius = 20 + score * 34;
    const color = getHeatColor(item.value);
    return `<circle class="iran-map__heat" cx="${item.x}" cy="${item.y}" r="${radius.toFixed(1)}" fill="${color}" opacity="${(0.18 + score * 0.62).toFixed(2)}"></circle>`;
  }).join("");

  const hubs = mapData.markers.map((item) => {
    const pulse = item.value >= 500000 ? 18 : item.value >= 100000 ? 14 : 11;
    const label = getMapRegionLabel(item);
    return (
      `<g class="iran-map__hub" data-key="${item.provinceId}" data-marker="${label}" transform="translate(${item.x} ${item.y})">` +
      `<circle class="hub-ring" r="${pulse}"></circle>` +
      `<circle class="hub-dot" r="6"></circle>` +
      `</g>`
    );
  }).join("");

  const labels = mapData.markers.filter((item) => item.pinned).map((item) => {
    const label = getMapRegionLabel(item);
    return (
      `<g class="iran-map__pin-label" data-key="${item.provinceId}" transform="translate(${item.x} ${item.y - 42})">` +
      `<rect x="-76" y="-36" width="152" height="70" rx="14"></rect>` +
      `<text class="pin-label__name" y="-11">${label}</text>` +
      `<text class="pin-label__value" y="20">${formatFaNumber(toTrillionToman(item.value), 0)} همت</text>` +
      `</g>`
    );
  }).join("");

  root.innerHTML =
    `<svg class="iran-heatmap__svg" viewBox="${vbX} ${vbY} ${vbw} ${vbh}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="نقشه حرارتی دسترسی معاملاتی ایران">` +
    `<defs>` +
    `<filter id="heat-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"></feGaussianBlur></filter>` +
    `</defs>` +
    `<g class="iran-map__surface">` +
    `<g class="iran-provinces">${provincePaths}</g>` +
    `<g class="iran-map__heat-layer" filter="url(#heat-blur)">${heatCircles}</g>` +
    `${hubs}` +
    `${labels}` +
    `</g>` +
    `</svg>` +
    `<div class="iran-heatmap__legend" aria-hidden="true">` +
    `<div class="legend-row legend-row--high"><i></i><span>بیش از ۲۰۰ همت منطقه‌ای</span></div>` +
    `<div class="legend-row legend-row--mid"><i></i><span>بین ۲۰ تا ۲۰۰ همت</span></div>` +
    `<div class="legend-row legend-row--low"><i></i><span>کمتر از ۲۰ همت</span></div>` +
    `</div>`;

  const setActive = (key) => {
    root.querySelectorAll("[data-key]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.key === key);
    });
  };

  root.querySelectorAll(".iran-map__hub, .iran-map__pin-label, .iran-province").forEach((el) => {
    el.addEventListener("mouseenter", () => setActive(el.dataset.key));
    el.addEventListener("mouseleave", () => setActive(null));
  });
};

const activateMarketFocusSection = (section) => {
  if (!section || section.dataset.activated === "true") return;

  section.dataset.activated = "true";
  section.classList.add("is-visible");
  section.querySelectorAll("[data-count]").forEach(animateCount);
  buildIndustryPie(section.querySelector("#industry-pie"));
};

const activateAccessNetworkSection = (section) => {
  if (!section || section.dataset.activated === "true") return;

  section.dataset.activated = "true";
  section.classList.add("is-visible");
  section.querySelectorAll("[data-count]").forEach(animateCount);
  buildIranHeatmap(section.querySelector("#iran-heatmap"));
};

const toFaDigits = (value) => String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const wipeInChart = (el) => {
  if (!el || prefersReducedMotion) return;
  el.classList.remove("pulse-draw");
  // force reflow so the animation restarts cleanly, then reveal left-to-right
  void el.offsetWidth;
  el.classList.add("pulse-draw");
};

const buildIndexSeasonChart = (el) => {
  if (!el || el.dataset.built === "true" || typeof ApexCharts === "undefined") return;
  const chartData = window.TSE_INDEX_CHART_DATA;
  if (!chartData) return;
  el.dataset.built = "true";

  const highlightedYear = "1404";
  const series = chartData.series.map((item) => ({
    name: toFaDigits(item.year),
    data: item.data,
  }));
  const highlightIndex = chartData.series.findIndex((item) => item.year === highlightedYear);
  const grayPalette = ["#8f98a5", "#a6afbb", "#c5ccd4", "#7e8794", "#b4bdc8"];
  const colors = chartData.series.map((item, index) =>
    item.year === highlightedYear ? "#f0c565" : grayPalette[index % grayPalette.length],
  );
  const widths = chartData.series.map((item) => (item.year === highlightedYear ? 5.8 : 2.6));
  const yValues = chartData.series.flatMap((item) => item.data.map((point) => point[1]));
  const minY = Math.floor((Math.min(...yValues) - 6) / 10) * 10;
  const maxY = Math.ceil((Math.max(...yValues) + 8) / 10) * 10;

  const options = {
    chart: {
      type: "line",
      height: "100%",
      fontFamily: "inherit",
      foreColor: "#eee8dc",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
    },
    series,
    colors,
    stroke: {
      curve: "smooth",
      width: widths,
      lineCap: "round",
    },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    dataLabels: {
      enabled: highlightIndex >= 0,
      enabledOnSeries: highlightIndex >= 0 ? [highlightIndex] : [],
      formatter: (_value, opts) => {
        const lastPoint = opts.w.config.series[opts.seriesIndex].data.length - 1;
        return opts.dataPointIndex === lastPoint ? "۱۴۰۴" : "";
      },
      background: {
        enabled: true,
        foreColor: "#fff8e7",
        borderRadius: 7,
        padding: 7,
        opacity: 0.96,
        borderWidth: 0,
      },
      style: { fontSize: "16px", fontWeight: 900, colors: ["#fff8e7"] },
      offsetX: 26,
    },
    grid: {
      borderColor: "rgba(255,255,255,0.08)",
      strokeDashArray: 5,
      padding: { right: 42, left: 22, top: 12, bottom: 28 },
    },
    xaxis: {
      type: "numeric",
      min: 0,
      max: 100,
      tickAmount: 11,
      labels: {
        show: true,
        rotateAlways: true,
        hideOverlappingLabels: false,
        trim: false,
        offsetY: 10,
        rotate: -90,
        formatter: (value) => {
          const labels = chartData.monthLabels;
          const index = Math.min(labels.length - 1, Math.max(0, Math.round(Number(value) / (100 / 11))));
          return labels[index] || "";
        },
        style: { colors: "rgba(243, 240, 232, 0.9)", fontSize: "9px", fontWeight: 900 },
      },
      axisBorder: { show: true, color: "rgba(255,255,255,0.16)" },
      axisTicks: { show: true, color: "rgba(255,255,255,0.16)" },
      title: {
        text: "ماه‌های سال",
        offsetY: -4,
        style: { color: "rgba(243,240,232,0.72)", fontSize: "12px", fontWeight: 800 },
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: minY,
      max: maxY,
      tickAmount: 5,
      title: { text: "شاخص پایه ۱۰۰", style: { color: "rgba(243, 240, 232, 0.72)", fontSize: "12px" } },
      labels: {
        formatter: (value) => formatFaNumber(value, 0),
        offsetX: -4,
        style: { colors: "rgba(243, 240, 232, 0.76)", fontSize: "12px", fontWeight: 800 },
      },
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      shared: false,
      x: { formatter: (value) => chartData.monthLabels[Math.min(11, Math.max(0, Math.round(Number(value) / (100 / 11))))] },
      y: { formatter: (value, opts) => `${formatFaNumber(value, 1)} | سال ${opts.w.config.series[opts.seriesIndex].name}` },
    },
    annotations: {
      yaxis: [
        {
          y: 100,
          borderColor: "rgba(240,197,101,0.48)",
          strokeDashArray: 6,
          label: {
            text: "پایه ۱۰۰",
            position: "left",
            offsetX: 40,
            style: { background: "rgba(12,26,45,0.82)", color: "rgba(243,240,232,0.7)", fontSize: "10px" },
          },
        },
      ],
    },
  };

  new ApexCharts(el, options).render().then(() => wipeInChart(el));
};

const buildAnnualIndexChart = (el) => {
  if (!el || el.dataset.built === "true" || typeof ApexCharts === "undefined") return;
  const chartData = window.TSE_INDEX_CHART_DATA;
  if (!chartData?.series?.length) return;
  el.dataset.built = "true";

  const START_YEAR = 1396;
  const END_YEAR = 1405;
  const years = chartData.series.filter((s) => Number(s.year) >= START_YEAR);

  // continuous daily series across years: x = year + pct/100, y = reconstructed raw index
  const daily = [];
  years.forEach((yr) => {
    const yNum = Number(yr.year);
    yr.data.forEach(([pct, base100]) => {
      daily.push([yNum + pct / 100, Math.round((yr.start * base100) / 100)]);
    });
  });

  // downsample to keep the SVG path light while staying visually daily
  const STRIDE = 3;
  const series = daily.filter((_, i) => i % STRIDE === 0);
  if (series[series.length - 1] !== daily[daily.length - 1]) series.push(daily[daily.length - 1]);
  const splitIndex1404 = series.findIndex((point) => point[0] >= 1404);
  const boundary1404 = splitIndex1404 > 0 ? series[splitIndex1404 - 1] : series[0];
  const before1404 = splitIndex1404 > 0 ? [...series.slice(0, splitIndex1404), boundary1404] : [...series];
  const year1404 = splitIndex1404 > 0 ? [boundary1404, ...series.slice(splitIndex1404)] : [...series];

  const lastPoint = daily[daily.length - 1];
  const values = daily.map((point) => point[1]);
  const maxY = Math.ceil((Math.max(...values) * 1.05) / 250000) * 250000;

  const options = {
    chart: {
      type: "area",
      height: "100%",
      fontFamily: "inherit",
      foreColor: "#eee8dc",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
    },
    series: [
      { name: "پیش از ۱۴۰۴", data: before1404 },
      { name: "۱۴۰۴", data: year1404 },
    ],
    colors: ["#f0c565", "#f0c565"],
    stroke: { curve: "straight", width: [2.2, 2.2], lineCap: "round" },
    fill: {
      colors: ["#f0c565", "#7ea2da"],
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 0.35,
        opacityFrom: [0.14, 0.72],
        opacityTo: [0.02, 0.16],
        stops: [0, 100],
      },
    },
    markers: { size: 0, hover: { size: 5 } },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(255,255,255,0.08)",
      strokeDashArray: 5,
      padding: { right: 20, left: 6, top: 12, bottom: 18 },
    },
    xaxis: {
      type: "numeric",
      min: START_YEAR,
      max: END_YEAR,
      tickAmount: END_YEAR - START_YEAR,
      labels: {
        rotate: 0,
        formatter: (value) => {
          const y = Math.round(Number(value));
          return y >= END_YEAR ? "" : toFaDigits(String(y));
        },
        style: { colors: "rgba(243, 240, 232, 0.86)", fontSize: "11px", fontWeight: 900 },
      },
      axisBorder: { show: true, color: "rgba(255,255,255,0.16)" },
      axisTicks: { show: true, color: "rgba(255,255,255,0.16)" },
      title: {
        text: "سال",
        offsetY: -4,
        style: { color: "rgba(243,240,232,0.72)", fontSize: "12px", fontWeight: 800 },
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      max: maxY,
      tickAmount: 4,
      labels: {
        formatter: (value) => `${formatFaNumber(value / 1000000, 1)}م`,
        offsetX: -4,
        style: { colors: "rgba(243, 240, 232, 0.72)", fontSize: "11px", fontWeight: 800 },
      },
    },
    annotations: {
      points: [
        {
          x: lastPoint[0],
          y: lastPoint[1],
          marker: { size: 6, fillColor: "#f0c565", strokeColor: "#fff8e7", radius: 2 },
          label: {
            text: formatFaNumber(lastPoint[1], 0),
            borderColor: "rgba(240,197,101,0.7)",
            offsetY: -6,
            offsetX: -36,
            style: { background: "#101b2b", color: "#fff8e7", fontSize: "13px", fontWeight: 900 },
          },
        },
      ],
    },
    tooltip: {
      theme: "dark",
      x: { formatter: (value) => `سال ${toFaDigits(String(Math.floor(Number(value))))}` },
      y: { formatter: (value) => formatFaNumber(value, 0) },
    },
  };

  new ApexCharts(el, options).render().then(() => wipeInChart(el));
};

const buildTradingValueChart = (el) => {
  if (!el || el.dataset.built === "true") return;
  const chartData = window.TSE_INDEX_CHART_DATA;
  if (!chartData) return;
  el.dataset.built = "true";

  const values = chartData.tradingValue.map((item) => item.value);
  const maxValue = Math.max(...values);
  const niceMax = Math.ceil((maxValue * 1.08) / 500) * 500;
  const ticks = 4;
  const gridLines = Array.from({ length: ticks }, (_, index) => {
    const value = (niceMax / ticks) * (ticks - index);
    const pct = ((ticks - index) / ticks) * 100;
    return { value, pct };
  });

  const bars = chartData.tradingValue.map((item, index) => {
    const height = Math.max(16, (item.value / niceMax) * 100);
    const accent = index === chartData.tradingValue.length - 1 ? "trading-bar--focus" : "trading-bar--muted";
    const growth = item.growth == null ? "" : `<span class="trading-bar__delta">${formatFaNumber(item.growth, 1)}٪ رشد</span>`;
    return (
      `<article class="trading-bar ${accent}" style="--h:${height.toFixed(2)}%">` +
      `<div class="trading-bar__value">${formatFaNumber(item.value, 0)}</div>` +
      `<div class="trading-bar__column">` +
      `<div class="trading-bar__fill"></div>` +
      `${growth}` +
      `</div>` +
      `<div class="trading-bar__year">${item.year}</div>` +
      `</article>`
    );
  }).join("");

  const lines = gridLines.map((tick) => (
    `<div class="trading-bars__gridline" style="--y:${tick.pct}%">` +
    `<span>${formatFaNumber(tick.value, 0)}</span>` +
    `</div>`
  )).join("");

  el.innerHTML =
    `<div class="trading-bars">` +
    `<div class="trading-bars__grid">${lines}</div>` +
    `<div class="trading-bars__stage">${bars}</div>` +
    `</div>`;

  wipeInChart(el);
};

const activateMarketPulseSection = (section) => {
  if (!section || section.dataset.activated === "true") return;

  section.dataset.activated = "true";
  section.classList.add("is-visible");
  section.querySelectorAll("[data-count]").forEach(animateCount);
  buildAnnualIndexChart(section.querySelector("#annual-index-chart"));
  buildIndexSeasonChart(section.querySelector("#index-season-chart"));
  buildTradingValueChart(section.querySelector("#trading-value-chart"));
};

const activateRevealSection = (section) => {
  if (!section) return;
  if (section.id === "today") return activateTodaySection(section);
  if (section.id === "market-focus") return activateMarketFocusSection(section);
  if (section.id === "access-network") return activateAccessNetworkSection(section);
  if (section.id === "market-pulse") return activateMarketPulseSection(section);
  section.classList.add("is-visible");
};

const prepareMobileVisuals = () => {
  if (!window.matchMedia("(max-width: 720px)").matches) return;

  // Build size-changing visuals before they enter the viewport so section
  // offsets stay stable while native mobile scroll snapping is active.
  buildIndustryPie(document.querySelector("#industry-pie"));
  buildIranHeatmap(document.querySelector("#iran-heatmap"));
  buildAnnualIndexChart(document.querySelector("#annual-index-chart"));
  buildIndexSeasonChart(document.querySelector("#index-season-chart"));
  buildTradingValueChart(document.querySelector("#trading-value-chart"));
};

const watchSections = () => {
  if (!revealSections.length) return;
  prepareMobileVisuals();
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealSections.forEach(activateRevealSection);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        activateRevealSection(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.28, root: shell || null },
  );

  revealSections.forEach((section) => observer.observe(section));
};

const getCurrentSectionIndex = () => {
  if (!shell || !snapSections.length) return 0;

  const shellTop = shell.scrollTop;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  snapSections.forEach((section, index) => {
    const distance = Math.abs(section.offsetTop - shellTop);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

const updateSectionTheme = () => {
  if (!shell || !snapSections.length) return;

  const activeSection = snapSections[getCurrentSectionIndex()];
  const isLightSection = activeSection?.id === "development-divider";
  document.body.classList.toggle("theme-light-section", isLightSection);
};

const scrollToSection = (index) => {
  if (!shell || !snapSections[index]) return;

  isScrollLocked = true;
  shell.scrollTo({
    top: snapSections[index].offsetTop,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });

  window.setTimeout(() => {
    isScrollLocked = false;
  }, prefersReducedMotion ? 80 : 820);
};

const enableSectionSnapScroll = () => {
  if (!shell || prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

  shell.addEventListener(
    "wheel",
    (event) => {
      if (isScrollLocked || Math.abs(event.deltaY) < 20) return;

      event.preventDefault();

      const currentIndex = getCurrentSectionIndex();
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(snapSections.length - 1, currentIndex + direction));

      if (nextIndex !== currentIndex) {
        scrollToSection(nextIndex);
      }
    },
    { passive: false },
  );
};

/* ---- Shared fixed background for part 1 (today + market) ---- */
const initPart1Background = () => {
  const bg = document.getElementById("part1-bg");
  const img = document.getElementById("part1-bg-img");
  if (!bg || !img || !shell) return;

  const part1Sections = ["today", "market-focus", "access-network", "market-pulse", "development-rebuilt", "multi-market", "financing-path"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!part1Sections.length) return;

  const first = part1Sections[0];
  const last = part1Sections[part1Sections.length - 1];
  const multiMarketSection = document.getElementById("multi-market");
  let pending = false;

  const render = () => {
    pending = false;

    const scrollTop = shell.scrollTop;
    const vh = shell.clientHeight || window.innerHeight;
    const active =
      scrollTop > first.offsetTop - vh * 0.6 &&
      scrollTop < last.offsetTop + vh * 0.6;
    bg.classList.toggle("is-active", active);
    const multiMarketActive =
      multiMarketSection &&
      scrollTop > multiMarketSection.offsetTop - vh * 0.42 &&
      scrollTop < multiMarketSection.offsetTop + multiMarketSection.offsetHeight - vh * 0.38;
    bg.classList.toggle("is-multi-market-active", Boolean(multiMarketActive));
    img.style.transform = "scale(1.16)";
  };

  const schedule = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(render);
  };

  shell.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);

  render();
};

const initSectionTheme = () => {
  if (!shell || !snapSections.length) return;

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(() => {
      pending = false;
      updateSectionTheme();
    });
  };

  shell.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
};

const initReportNav = () => {
  const nav = document.querySelector(".report-nav");
  const toggle = nav?.querySelector(".report-nav__toggle");
  const links = nav ? [...nav.querySelectorAll(".report-nav__item")] : [];
  if (!nav || !toggle || !links.length || !shell) return;

  const setOpen = (isOpen, returnFocus = false) => {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "بستن فهرست بخش‌های گزارش" : "باز کردن فهرست بخش‌های گزارش",
    );
    if (!isOpen && returnFocus) toggle.focus();
  };

  const updateActiveItem = () => {
    const currentTop = shell.scrollTop + shell.clientHeight * .34;
    let activeLink = links[0];

    links.forEach((link) => {
      const target = document.getElementById(link.dataset.navTarget);
      if (target && target.offsetTop <= currentTop) activeLink = link;
    });

    links.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.navTarget);
      if (!target) return;
      event.preventDefault();
      shell.scrollTo({
        top: target.offsetTop,
        behavior:
          prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches
            ? "auto"
            : "smooth",
      });
      setOpen(false);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) setOpen(false, true);
  });

  let navFramePending = false;
  shell.addEventListener("scroll", () => {
    if (navFramePending) return;
    navFramePending = true;
    window.requestAnimationFrame(() => {
      navFramePending = false;
      updateActiveItem();
    });
  }, { passive: true });

  updateActiveItem();
};

video?.addEventListener("playing", revealIntro, { once: true });
video?.addEventListener("loadeddata", revealIntro, { once: true });

tryAutoplay();
watchSections();
enableSectionSnapScroll();
initPart1Background();
initSectionTheme();
initReportNav();
