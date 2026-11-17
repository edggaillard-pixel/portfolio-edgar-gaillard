// =============================================================
//  app.js: builds the whole portfolio from data.js
//  Vanilla JavaScript, no framework, no build step.
// =============================================================

/* ---------- 1. Tiny DOM helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === false || v == null) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "style" && typeof v === "object") for (const [sk, sv] of Object.entries(v)) el.style.setProperty(sk.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()), sv);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  kids.flat(Infinity).forEach((c) => {
    if (c == null || c === false) return;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return el;
}

const SVGNS = "http://www.w3.org/2000/svg";
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  kids.flat().forEach((c) => c != null && el.append(c instanceof Node ? c : document.createTextNode(c)));
  return el;
}

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 2. Icons (inline SVG, no icon font) ---------- */
const ICONS = {
  github: { fill: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  linkedin: { fill: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  youtube: { fill: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  mail: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M22 6l-10 7L2 6"],
  phone: ["M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"],
  pin: ["M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  sun: ["M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", "M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"],
  ext: ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14L21 3"],
  copy: ["M9 9h13v13H9z", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"],
  x: ["M18 6L6 18M6 6l12 12"],
  menu: ["M3 12h18M3 6h18M3 18h18"],
  up: ["M12 19V5M5 12l7-7 7 7"],
  right: ["M5 12h14M12 5l7 7-7 7"],
  play: ["M5 3l14 9-14 9V3z"],
  send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4 20-7z"],
};

function icon(name, size = 18) {
  const def = ICONS[name];
  const svg = s("svg", { viewBox: "0 0 24 24", width: size, height: size, "aria-hidden": "true", class: "ico" });
  if (!Array.isArray(def)) svg.append(s("path", { d: def.fill, fill: "currentColor" }));
  else def.forEach((d) => svg.append(s("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" })));
  return svg;
}

const DEVICON = (n) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${n}/${n}-original.svg`;

function techLogo(skill) {
  const box = h("span", { class: "logo" }, skill.name.slice(0, 2));
  if (!skill.icon) return box;
  const img = h("img", { src: DEVICON(skill.icon), alt: "", loading: "lazy", width: 22, height: 22 });
  img.onerror = () => img.remove();
  img.onload = () => { box.textContent = ""; box.append(img); };
  return box;
}

/* ---------- 3. Generated covers for projects without screenshots ---------- */
function useCaseDiagram(big = false) {
  const svg = s("svg", { viewBox: "0 0 640 360", class: "uc", role: "img", "aria-label": "Simplified excerpt of the Benevolt use-case diagram" });
  const actor = (x, y, label) => s("g", { class: "actor" },
    s("circle", { cx: x, cy: y - 34, r: 10 }),
    s("path", { d: `M${x} ${y - 24}v26M${x - 16} ${y - 12}h32M${x} ${y + 2}l-13 20M${x} ${y + 2}l13 20` }),
    s("text", { x, y: y + 42, "text-anchor": "middle" }, label));
  const cases = ["Create a volunteer profile", "Register an association", "Post a mission", "Volunteer for a mission", "Subscribe to a plan", "Moderate the platform"];
  svg.append(s("rect", { x: 160, y: 16, width: 320, height: 328, rx: 14, class: "sys" }), s("text", { x: 320, y: 40, "text-anchor": "middle", class: "sysname" }, "Benevolt"));
  const ys = cases.map((_, i) => 78 + i * 48);
  const links = [[70, 140, [0, 3]], [70, 280, [1, 2, 4]], [570, 210, [5, 1]]];
  links.forEach(([ax, ay, idx]) => idx.forEach((i) => svg.append(s("line", { x1: ax + (ax < 320 ? 20 : -20), y1: ay - 12, x2: ax < 320 ? 215 : 425, y2: ys[i], class: "link" }))));
  cases.forEach((c, i) => svg.append(s("g", { class: "case" }, s("ellipse", { cx: 320, cy: ys[i], rx: 108, ry: 18 }), s("text", { x: 320, y: ys[i] + 4, "text-anchor": "middle" }, c))));
  svg.append(actor(70, 140, "Volunteer"), actor(70, 280, "Association"), actor(570, 210, "Admin"));
  if (big) svg.classList.add("big");
  return svg;
}

function cover(p, big = false) {
  if (p.cover === "diagram") return h("div", { class: "cover gen diagram" }, useCaseDiagram(big));
  if (p.cover === "terminal")
    return h("div", { class: "cover gen term" },
      h("div", { class: "dots" }, h("i"), h("i"), h("i")),
      p.terminal.map((l, i) => h("code", { style: { animationDelay: `${i * 0.25}s` } }, l)));
  if (p.cover === "icon") return h("div", { class: "cover gen iconcov" }, h("img", { src: p.icon, alt: `${p.title} logo`, loading: "lazy" }));
  return h("div", { class: "cover" }, h("img", { src: p.cover, alt: `${p.title} screenshot`, loading: "lazy" }));
}

/* ---------- 4. Small UI pieces ---------- */
const sectionHead = (kicker, title, text) =>
  h("header", { class: "shead" }, h("p", { class: "kicker" }, kicker), h("h2", {}, title), text && h("p", { class: "lead" }, text));

const chip = (txt, cls = "") => h("span", { class: `chip ${cls}` }, txt);

function toast(msg) {
  const t = h("div", { class: "toast", role: "status" }, icon("right", 16), msg);
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2200);
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(`Copied: ${text}`); }
  catch { toast("Copy failed. Select the text instead."); }
}

/* ---------- 5. Modal (projects, case study, CV viewer) ---------- */
let lastFocus = null;
function openModal(content, cls = "") {
  closeModal();
  lastFocus = document.activeElement;
  const box = h("div", { class: `modal ${cls}`, role: "dialog", "aria-modal": "true" },
    h("button", { class: "close", "aria-label": "Close", onclick: closeModal }, icon("x", 20)), content);
  const wrap = h("div", { class: "overlay", onclick: (e) => e.target === wrap && closeModal() }, box);
  document.body.append(wrap);
  document.body.classList.add("locked");
  requestAnimationFrame(() => wrap.classList.add("open"));
  $(".close", box).focus();
}
function closeModal() {
  const o = $(".overlay");
  if (!o) return;
  o.remove();
  document.body.classList.remove("locked");
  lastFocus?.focus?.();
}

function openCV() {
  const { file, name, preview } = PROFILE.cv;
  // The CV is shown as an image: embedded PDFs are blocked by many browsers, phones and sandboxed viewers.
  openModal(h("div", { class: "cvview" },
    h("div", { class: "cvbar" },
      h("h3", {}, "Curriculum Vitae"),
      h("a", { class: "btn ghost sm", href: file, target: "_blank", rel: "noopener" }, icon("ext", 16), "Open the PDF"),
      h("a", { class: "btn sm", href: file, download: name, target: "_blank", rel: "noopener" }, icon("download", 16), "Download PDF")),
    h("div", { class: "cvimg" }, h("img", { src: preview, alt: "CV of Edgar Gaillard, page 1", width: 1323, height: 1871 }))), "wide");
}

function safeImg(src, alt, p) {
  const img = h("img", { src, alt });
  img.addEventListener("error", () => { if (img.isConnected) img.replaceWith(cover({ ...p, cover: "terminal", terminal: [p.title, p.subtitle] }, true)); });
  return img;
}

function projectModal(p) {
  const media = h("div", { class: "pm-media" });
  if (p.video) {
    // No embedded player (often blocked): a still from the game that links to the trailer.
    media.append(h("a", { class: "shot video-link", href: p.links[0].url, target: "_blank", rel: "noopener" },
      safeImg(p.gallery?.[0] || p.cover, `${p.title} screenshot`, p),
      h("span", { class: "play" }, icon("play", 18), "Watch the trailer on YouTube")));
  } else if (p.gallery?.length) {
    const main = safeImg(p.gallery[0], `${p.title} screenshot`, p);
    media.append(h("div", { class: "shot" }, main));
    if (p.gallery.length > 1)
      media.append(h("div", { class: "thumbs" }, p.gallery.map((src, i) =>
        h("button", { class: i ? "" : "on", "aria-label": `Screenshot ${i + 1}`, onclick: (e) => { main.src = src; $$(".thumbs button", media).forEach((b) => b.classList.toggle("on", b === e.currentTarget)); } },
          h("img", { src, alt: "" })))));
  } else media.append(cover(p, true));

  const meta = h("div", { class: "pm-meta" },
    chip(p.date, "date"), chip(p.type, `type ${p.type.toLowerCase()}`), chip(p.team, "team"),
    p.tech.map((t) => h("button", { class: "chip tech", onclick: () => { closeModal(); filterByTech(t); } }, t)));

  const block = (title, body) => body && h("section", {}, h("h4", {}, title), body);
  const list = (arr) => arr && h("ul", { class: "ticks" }, arr.map((x) => h("li", {}, x)));
  const links = p.links?.length && h("div", { class: "pm-links" }, p.links.map((l) => h("a", { class: "btn", href: l.url, target: "_blank", rel: "noopener" }, l.label, icon("ext", 15))));

  let body;
  if (p.caseStudy) {
    body = [
      h("p", { class: "eyebrow" }, "Case study · BUT 2nd year"),
      block("Context", h("p", {}, p.context)),
      block("The problem", h("p", {}, p.problem)),
      block("My process", h("ol", { class: "steps" }, p.steps.map(([t, d], i) => h("li", {}, h("b", {}, `${String(i + 1).padStart(2, "0")} · ${t}`), h("span", {}, d))))),
      block("Deliverables", list(p.deliverables)),
      block("What I learned", h("p", {}, p.learned)),
    ];
  } else {
    body = [
      block("Context", h("p", {}, p.context)),
      block("Objectives", h("p", {}, p.objectives)),
      block("What I did", list(p.did)),
      p.stats && h("div", { class: "stats" }, p.stats.map(([n, l]) => h("div", {}, h("b", {}, n), h("span", {}, l)))),
      block("Organization", h("p", {}, p.organization)),
      p.note && h("p", { class: "note" }, p.note),
    ];
  }
  openModal(h("article", { class: "pm" }, media,
    h("div", { class: "pm-body" }, h("h3", {}, p.title), h("p", { class: "sub" }, p.subtitle), meta, body, links)), p.caseStudy ? "case" : "");
}

/* ---------- 6. Sections ---------- */
function Nav() {
  const links = SECTIONS.map((sct) => h("a", { href: `#${sct.id}`, "data-id": sct.id }, sct.label));
  const nav = h("nav", { class: "nav", "aria-label": "Main" },
    h("a", { class: "brand", href: "#top", "aria-label": "Back to top" }, h("span", { class: "mono" }, "EG"), h("span", {}, `${PROFILE.firstName} ${PROFILE.lastName}`)),
    h("div", { class: "links" }, links),
    h("div", { class: "actions" },
      h("button", { class: "btn sm", onclick: openCV }, icon("eye", 16), "View CV"),
      h("button", { class: "iconbtn burger", "aria-label": "Menu", onclick: () => document.body.classList.toggle("menu") }, icon("menu"))));
  links.forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu")));
  return h("header", { class: "top" }, h("div", { class: "progress" }), nav);
}

function Hero() {
  const nUni = PROJECTS.filter((p) => p.type === "University").length;
  return h("section", { class: "hero", id: "top" },
    h("div", { class: "wrap hero-in" },
      h("div", { class: "hero-txt" },
        h("h1", {}, PROFILE.firstName, " ", h("span", {}, PROFILE.lastName)),
        h("p", { class: "role" }, PROFILE.roles.join(" · ")),
        h("p", { class: "tagline" }, PROFILE.tagline),
        h("div", { class: "cta" },
          h("a", { class: "btn", href: "#portfolio" }, "See my projects", icon("right", 16)),
          h("button", { class: "btn ghost", onclick: openCV }, icon("eye", 16), "View CV")),
        h("p", { class: "facts-line" }, `${PROJECTS.length} projects, ${nUni} of them university projects · Annecy & Chambéry, France`),
        h("p", { class: "facts-line" }, PROFILE.links.slice(0, 2).map((l) => [h("a", { href: l.url, target: "_blank", rel: "noopener" }, l.name), " · "]),
          h("a", { href: "#contact" }, "Contact"))),
      h("figure", { class: "hero-pic" },
        h("img", { src: PROFILE.photo, alt: `Portrait of ${PROFILE.firstName} ${PROFILE.lastName}`, width: 400, height: 400 }))));
}

function About() {
  return h("section", { id: "about", class: "wrap" },
    sectionHead("About me", "Who I am", null),
    h("div", { class: "about" },
      h("div", { class: "about-txt" },
        PROFILE.about.map((t) => h("p", {}, t))),
      h("dl", { class: "facts" }, PROFILE.facts.map((f) => h("div", {}, h("dt", {}, f.label), h("dd", {}, f.value))))),
    h("h3", { class: "sub-h" }, "Soft skills"),
    h("dl", { class: "soft" }, SOFT_SKILLS.map((sk) => h("div", {}, h("dt", {}, sk.title), h("dd", {}, sk.text)))),
    h("h3", { class: "sub-h" }, "Languages"),
    h("div", { class: "langs" }, LANGUAGES.map((l) =>
      h("div", { class: "lang" }, h("div", {}, h("b", {}, l.name), h("span", {}, l.level)), h("div", { class: "bar" }, h("i", { style: { "--v": `${l.value}%` } }))))));
}

function Skills() {
  const used = new Set(PROJECTS.flatMap((p) => p.tech));
  const dots = (n) => h("span", { class: "dots5", "aria-label": `${SCALE[n - 1]} (${n}/5)`, title: SCALE[n - 1] }, [1, 2, 3, 4, 5].map((i) => h("i", { class: i <= n ? "on" : "" })));
  return h("section", { id: "skills", class: "wrap" },
    sectionHead("Skills", "Technical skills", "Click a technology to see the projects where I used it."),
    h("div", { class: "scale" }, h("span", {}, "Scale:"), SCALE.map((l, i) => h("span", {}, dots(i + 1), l))),
    h("div", { class: "skills" }, SKILLS.map((g) => h("article", { class: "card" }, h("h4", {}, g.group),
      h("ul", {}, g.items.map((it) => {
        const can = used.has(it.name);
        return h("li", {}, h(can ? "button" : "span", { class: `skill ${can ? "link" : ""}`, onclick: can ? () => filterByTech(it.name) : null, title: can ? `See projects using ${it.name}` : null },
          techLogo(it), h("span", { class: "nm" }, it.name, it.note && h("small", {}, ` (${it.note})`)), dots(it.level)));
      }))))),
    h("p", { class: "osline" }, "Operating systems: familiar with Windows and Linux environments · Software architecture with UML and MERISE"));
}

function Experience() {
  return h("section", { id: "experience", class: "wrap" },
    sectionHead("Experience", "Work experience", "In reverse chronological order, university projects (SAÉ) included. I have worked alongside my studies since 2022."),
    h("ol", { class: "timeline" }, EXPERIENCE.map((e) => h("li", { class: "xp-item" },
      h("span", { class: "when" }, e.dates),
      h("div", { class: "card xp" },
        h("h4", {}, e.role),
        h("p", { class: "org" }, h("b", {}, e.org), `, ${e.activity}`),
        h("p", { class: "place" }, icon("pin", 14), e.place),
        h("ul", { class: "ticks" }, e.missions.map((m) => h("li", {}, m))),
        h("div", { class: "gained" }, h("span", {}, "Skills gained:"), e.gained.map((g) => chip(g))),
        e.project && h("button", { class: "more", onclick: () => projectModal(PROJECTS.find((p) => p.id === e.project)) }, "See the project", icon("right", 15)))))));
}

function Education() {
  return h("section", { id: "education", class: "wrap" },
    sectionHead("Education", "Education and qualifications", "In reverse chronological order. French diplomas keep their French name, followed by what they correspond to in English."),
    h("div", { class: "edu" }, EDUCATION.map((e) => h("article", { class: "card" },
      h("span", { class: "when" }, e.dates), h("h4", {}, e.title), h("p", { class: "en" }, e.english), h("p", {}, e.explain),
      h("p", { class: "place" }, icon("pin", 14), `${e.school} · ${e.place}`)))));
}

/* ---- Portfolio with filters ---- */
const state = { type: "All", techs: new Set() };

function Portfolio() {
  const featured = PROJECTS.filter((p) => p.featured);
  const allTech = [...new Set(PROJECTS.flatMap((p) => p.tech))].sort((a, b) => a.localeCompare(b));
  const count = (t) => PROJECTS.filter((p) => p.tech.includes(t)).length;
  const types = ["All", ...new Set(PROJECTS.map((p) => p.type))];

  return h("section", { id: "portfolio", class: "wrap" },
    sectionHead("Portfolio", "Selected work", "University and personal projects, finished or in progress. Open a tile for the context, my role, the technologies and the links."),
    h("div", { class: "featured" }, featured.map((p) =>
      h("button", { class: `feat ${p.caseStudy ? "is-case" : ""}`, onclick: () => projectModal(p) },
        cover(p, true),
        h("div", { class: "feat-txt" },
          h("p", { class: "eyebrow" }, p.caseStudy ? "Case study · University" : "Best project · Personal"),
          h("h3", {}, p.title), h("p", {}, p.summary),
          h("div", { class: "tags" }, p.tech.map((t) => chip(t, "tech"))),
          h("span", { class: "more" }, p.caseStudy ? "Read the case study" : "Open the project", icon("right", 15)))))),
    h("div", { class: "filters", role: "group", "aria-label": "Filter projects" },
      h("div", { class: "seg" }, types.map((t) => h("button", { "data-type": t, class: t === "All" ? "on" : "", onclick: () => { state.type = t; updateGrid(); } }, t))),
      h("div", { class: "techs" }, h("span", { class: "lbl" }, "Technology:"),
        allTech.map((t) => h("button", { class: "chip tech f", "data-tech": t, "aria-pressed": "false", onclick: () => { state.techs.has(t) ? state.techs.delete(t) : state.techs.add(t); updateGrid(); } }, t, h("small", {}, count(t)))),
        h("button", { class: "clear", onclick: () => { state.techs.clear(); state.type = "All"; updateGrid(); } }, "Reset"))),
    h("p", { class: "result", "aria-live": "polite" }),
    h("div", { class: "grid" }, [...PROJECTS].sort((a, b) => b.sort - a.sort).map(Tile)));
}

function Tile(p) {
  return h("button", { class: "tile", "data-id": p.id, onclick: () => projectModal(p) },
    cover(p),
    h("div", { class: "tile-txt" },
      h("div", { class: "badges" }, chip(p.type, `type ${p.type.toLowerCase()}`), chip(p.team, "team"), p.caseStudy && chip("Case study", "case")),
      h("h4", {}, p.title), h("p", { class: "date" }, p.date), h("p", {}, p.summary),
      h("div", { class: "tags" }, p.tech.map((t) => chip(t, "tech")))));
}

function updateGrid() {
  let shown = 0;
  $$(".tile").forEach((t) => {
    const p = PROJECTS.find((x) => x.id === t.dataset.id);
    const ok = (state.type === "All" || p.type === state.type) && [...state.techs].every((x) => p.tech.includes(x));
    t.hidden = !ok;
    if (ok) shown++;
  });
  $$(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.type === state.type));
  $$(".techs .f").forEach((b) => { const on = state.techs.has(b.dataset.tech); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  const parts = [state.type !== "All" && state.type.toLowerCase(), state.techs.size && `using ${[...state.techs].join(" + ")}`].filter(Boolean);
  $(".result").textContent = `${shown} project${shown > 1 ? "s" : ""}${parts.length ? `: ${parts.join(", ")}` : ""}`;
}

function filterByTech(t) {
  state.type = "All";
  state.techs = new Set([t]);
  updateGrid();
  $(".filters").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}

function Interests() {
  return h("section", { id: "interests", class: "wrap" },
    sectionHead("Interests", "Interests and online footprint", null),
    h("div", { class: "cards4" }, INTERESTS.map((i) => h("article", { class: "card" }, chip(i.tag), h("h4", {}, i.title), h("p", {}, i.text)))),
    h("div", { class: "footprint" }, h("span", {}, "Find my work online:"),
      [...PROFILE.links, { name: "MousseOver (live)", url: "https://edggaillard-pixel.github.io/mousseover/", icon: "play" }, { name: "3D portfolio", url: "https://edggaillard-pixel.github.io/", icon: "ext" }]
        .map((l) => h("a", { class: "btn ghost sm", href: l.url, target: "_blank", rel: "noopener" }, icon(l.icon, 16), l.name))));
}

function Contact() {
  const { email, phone, phoneHref, location } = PROFILE.contact;
  const row = (ic, label, value, href) => h("li", {}, icon(ic), h("div", {}, h("small", {}, label), href ? h("a", { href }, value) : h("span", {}, value)),
    h("button", { class: "iconbtn", "aria-label": `Copy ${label}`, onclick: () => copy(value) }, icon("copy", 16)));

  const form = h("form", { class: "card form", novalidate: true, onsubmit: sendMail },
    h("h3", {}, "Contact me"),
    h("p", {}, "Tell me about your internship offer or your project. The message opens in your email app; nothing is stored on this site (", h("a", { href: "privacy.html" }, "privacy"), ")."),
    h("label", {}, "Your name", h("input", { name: "name", required: true, autocomplete: "name" })),
    h("label", {}, "Your email", h("input", { name: "email", type: "email", required: true, autocomplete: "email" })),
    h("label", {}, "Subject", h("select", { name: "subject" }, ["Internship offer", "Project", "Question", "Other"].map((o) => h("option", {}, o)))),
    h("label", {}, "Message", h("textarea", { name: "msg", rows: 5, required: true })),
    h("p", { class: "err", "aria-live": "polite" }),
    h("button", { class: "btn", type: "submit" }, icon("send", 16), "Send message"));

  return h("section", { id: "contact", class: "wrap" },
    sectionHead("References & contact", "Let's work together", null),
    h("h3", { class: "sub-h" }, "References"),
    h("div", { class: "refs" }, REFERENCES.map((r) => h("article", { class: "card ref" },
      h("span", { class: "avatar" }, r.name.split(" ").map((w) => w[0]).join("")),
      h("div", {}, h("h4", {}, r.name), h("p", {}, r.position), h("p", { class: "muted" }, `${r.org} · ${r.place}`), h("a", { href: `mailto:${r.email}` }, r.email))))),
    h("div", { class: "contact" }, form,
      h("div", { class: "card" },
        h("h3", {}, "Personal data"),
        h("ul", { class: "clist" }, row("mail", "Email", email, `mailto:${email}`), row("phone", "Phone", phone, `tel:${phoneHref}`), row("pin", "Location", location)),
        h("div", { class: "socials" }, PROFILE.links.map((l) => h("a", { class: "btn ghost sm", href: l.url, target: "_blank", rel: "noopener" }, icon(l.icon, 16), l.name))),
        h("div", { class: "cvbox" }, h("p", {}, "Prefer paper? My one-page CV is ready to print."),
          h("button", { class: "btn ghost", onclick: openCV }, icon("eye", 16), "View CV"),
          h("a", { class: "btn ghost", href: PROFILE.cv.file, download: PROFILE.cv.name }, icon("download", 16), "Download")))));
}

function sendMail(e) {
  e.preventDefault();
  const f = e.currentTarget;
  const d = Object.fromEntries(new FormData(f));
  const err = $(".err", f);
  if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || d.msg.trim().length < 10) {
    err.textContent = "Please fill in your name, a valid email and a message (10 characters minimum).";
    return;
  }
  err.textContent = "";
  const body = `${d.msg}\n\nFrom: ${d.name} (${d.email})`;
  location.href = `mailto:${PROFILE.contact.email}?subject=${encodeURIComponent(`[Portfolio] ${d.subject}`)}&body=${encodeURIComponent(body)}`;
  toast("Opening your email app…");
}

function Footer() {
  const modes = ["Auto", "Light", "Dark"];
  return h("footer", { class: "foot" },
    h("div", { class: "wrap" },
      h("p", {}, `© ${new Date().getFullYear()} ${PROFILE.firstName} ${PROFILE.lastName} · Built with vanilla JavaScript, no framework, no CMS.`),
      h("nav", { class: "foot-links", "aria-label": "Legal" },
        h("a", { href: "legal.html" }, "Legal notice"), h("a", { href: "privacy.html" }, "Privacy")),
      h("div", { class: "theme", role: "group", "aria-label": "Theme" }, h("span", {}, "Theme:"),
        modes.map((m) => h("button", { "data-mode": m.toLowerCase(), onclick: () => setTheme(m.toLowerCase()) }, m))),
      h("a", { href: "#top", class: "totop" }, "Back to top")));
}

/* ---------- 7. Behaviours ---------- */
function observe() {
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) $$(".links a").forEach((a) => a.classList.toggle("on", a.dataset.id === e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  SECTIONS.forEach((sct) => spy.observe(document.getElementById(sct.id)));

  const bar = $(".progress");
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max ? scrollY / max : 0})`;
    $(".top").classList.toggle("scrolled", scrollY > 20);
  }, { passive: true });
}

function setTheme(mode) {
  if (mode === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  store.set("theme", mode);
  $$(".theme button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === mode));
}

/* ---------- 8. Easter egg: the Konami code launches a mini MousseOver ---------- */
function konami() {
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let pos = 0;
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") return closeModal();
    pos = e.key.toLowerCase() === code[pos].toLowerCase() ? pos + 1 : e.key === code[0] ? 1 : 0;
    if (pos === code.length) { pos = 0; miniGame(); }
  });
}

function miniGame() {
  const cv = h("canvas", { class: "game", width: 640, height: 400 });
  const info = h("p", { class: "gameinfo" }, "Keep your cursor inside the circle. It shrinks every 3 seconds.");
  openModal(h("div", { class: "gamebox" }, h("h3", {}, "MousseOver, mini edition"), info, cv), "wide");
  const ctx = cv.getContext("2d");
  let m = { x: 320, y: 200 }, c = { x: 320, y: 200, r: 170, tx: 320, ty: 200 }, t0 = performance.now(), alive = true;
  cv.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); m = { x: ((e.clientX - r.left) / r.width) * 640, y: ((e.clientY - r.top) / r.height) * 400 }; });
  const loop = (t) => {
    if (!cv.isConnected) return;
    const el = (t - t0) / 1000;
    const target = Math.max(22, 170 - Math.floor(el / 3) * 18);
    c.r += (target - c.r) * 0.08;
    if (Math.random() < 0.01) { c.tx = 120 + Math.random() * 400; c.ty = 100 + Math.random() * 200; }
    c.x += (c.tx - c.x) * 0.01; c.y += (c.ty - c.y) * 0.01;
    if (alive && Math.hypot(m.x - c.x, m.y - c.y) > c.r) { alive = false; info.textContent = `Out! You survived ${el.toFixed(1)} s. Press Esc to close, or click to retry.`; cv.onclick = () => { closeModal(); miniGame(); }; }
    ctx.clearRect(0, 0, 640, 400);
    const css = getComputedStyle(document.documentElement);
    ctx.strokeStyle = alive ? css.getPropertyValue("--accent") : "#d64545"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.stroke();
    ctx.fillStyle = css.getPropertyValue("--text"); ctx.beginPath(); ctx.arc(m.x, m.y, 6, 0, 7); ctx.fill();
    ctx.fillStyle = css.getPropertyValue("--muted"); ctx.font = "16px monospace"; ctx.fillText(`${el.toFixed(1)} s`, 14, 26);
    if (alive) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- 9. Boot ---------- */
function init() {
  const app = $("#app");
  app.replaceChildren(Nav(), h("main", {}, Hero(), About(), Skills(), Experience(), Education(), Portfolio(), Interests(), Contact()), Footer());
  setTheme(store.get("theme") || "auto");
  updateGrid();
  observe();
  konami();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

// GROGNON
