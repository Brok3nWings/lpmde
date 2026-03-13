import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg:       "0D0D0D", // fond quasi-noir
  card:     "1A1A2E", // bleu nuit
  accent:   "C0392B", // rouge sang
  accent2:  "E74C3C", // rouge vif
  gold:     "F39C12", // or
  white:    "F0F0F0",
  grey:     "B2B2B2",
  lightBg:  "141428",
  green:    "27AE60",
  orange:   "E67E22",
};
const FONT_TITLE  = "Georgia";
const FONT_BODY   = "Calibri";

// ─── Helpers ──────────────────────────────────────────────────────────────────
let slideNum = 0;

function slide(opts = {}) {
  slideNum++;
  const s = pptx.addSlide();
  s.background = { color: opts.bg || C.bg };
  return s;
}

function addRedBar(s, h = 0.06) {
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h, fill: { color: C.accent } });
}

function addBottomBar(s) {
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.3, w: "100%", h: 0.2, fill: { color: C.accent } });
  s.addText("La Petite Maison de l'Épouvante — POC v1 · 2026", {
    x: 0.3, y: 7.3, w: 10.5, h: 0.2,
    fontSize: 8, color: C.grey, fontFace: FONT_BODY, valign: "middle",
  });
  s.addText(String(slideNum), {
    x: 11.5, y: 7.2, w: 1.6, h: 0.3,
    fontSize: 18, bold: true, color: C.white, fontFace: FONT_BODY, align: "right", valign: "middle",
  });
}

function sectionTitle(s, text) {
  s.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.15, w: 2.6, h: 0.06, fill: { color: C.accent } });
  s.addText(text, {
    x: 0.4, y: 0.7, w: 12, h: 0.6,
    fontSize: 11, bold: true, color: C.accent2, fontFace: FONT_BODY, charSpacing: 2,
  });
}

function mainTitle(s, title, subtitle = "") {
  s.addText(title, {
    x: 0.4, y: 1.4, w: 12.5, h: 1.4,
    fontSize: 34, bold: true, color: C.white, fontFace: FONT_TITLE,
    breakLine: false,
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.4, y: 2.9, w: 10, h: 0.6,
      fontSize: 17, color: C.grey, fontFace: FONT_BODY, italic: true,
    });
  }
}

// Titre compact pour les slides avec schémas denses (titre dans les 1.2" du haut)
function compactTitleSlide(s, section, title) {
  s.addText(section, {
    x: 0.4, y: 0.1, w: 12, h: 0.32,
    fontSize: 9, bold: true, color: C.accent2, fontFace: FONT_BODY, charSpacing: 2,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.4, y: 0.44, w: 2.6, h: 0.05, fill: { color: C.accent } });
  s.addText(title, {
    x: 0.4, y: 0.52, w: 12.5, h: 0.65,
    fontSize: 22, bold: true, color: C.white, fontFace: FONT_TITLE,
  });
}

function card(s, x, y, w, h, color = C.card) {
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color },
    line: { color: C.accent, width: 1.5 },
    rectRadius: 0.08,
  });
}

// ─── SLIDE 1 — Couverture ───────────────────────────────────────────────────
{
  const s = slide({ bg: C.bg });
  // bande verticale rouge à gauche
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.5, h: "100%", fill: { color: C.accent } });
  // grand titre
  s.addText("La Petite Maison\nde l'Épouvante", {
    x: 0.8, y: 0.6, w: 11, h: 3.2,
    fontSize: 48, bold: true, color: C.white, fontFace: FONT_TITLE,
  });
  s.addText("Superviser et assurer le développement des applications logicielles", {
    x: 0.8, y: 3.8, w: 10, h: 0.7,
    fontSize: 17, color: C.grey, fontFace: FONT_BODY, italic: true,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 4.7, w: 6, h: 0.05, fill: { color: C.accent } });
  s.addText("POC v1  ·  Lead Developer  ·  Mars 2026", {
    x: 0.8, y: 4.85, w: 8, h: 0.4,
    fontSize: 13, color: C.gold, fontFace: FONT_BODY,
  });
  s.addText("Bryan JOUBERT", {
    x: 0.8, y: 6.7, w: 12.3, h: 0.45,
    fontSize: 14, bold: true, color: C.white, fontFace: FONT_BODY, align: "right",
  });
  s.addNotes("Bonjour à tous. Je vais vous présenter le travail réalisé dans le cadre du module Superviser et assurer le développement logiciel. On va parcourir ensemble comment j'ai structuré ce projet de A à Z, du processus qualité jusqu'au déploiement automatique en production.");
}

// ─── SLIDE 2 — Sommaire ─────────────────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "PLAN DE LA PRÉSENTATION");
  s.addText("Sommaire", {
    x: 0.4, y: 1.4, w: 12.5, h: 0.9,
    fontSize: 34, bold: true, color: C.white, fontFace: FONT_TITLE,
  });

  const parts = [
    {
      num: "01",
      title: "Processus Qualité",
      items: ["4 métriques ISO 25010", "Politique de tests DevSecOps", "Pipeline CI/CD 11 jobs", "Compétences & formation"],
      color: "2E1A1A",
    },
    {
      num: "02",
      title: "Développement & Déploiement",
      items: ["Backlog & User Stories", "Architecture BFF / POC", "Disponibilité & montée en charge", "Résultats & chiffres clés"],
      color: "1A1A2E",
    },
    {
      num: "03",
      title: "Sécurité & Remédiation",
      items: ["Politique sécurité OWASP Top 10", "Plan de remédiation 3 sprints", "Mesures préventives v2", "Bilan de la mission"],
      color: "1A2E1A",
    },
  ];

  parts.forEach(({ num, title, items, color }, i) => {
    const x = 0.4 + i * 4.3;
    card(s, x, 3.0, 4.0, 4.0, color);
    s.addText(num, { x: x + 0.15, y: 3.1, w: 0.8, h: 0.65, fontSize: 28, bold: true, color: C.accent2, fontFace: FONT_TITLE });
    s.addText(title, { x: x + 0.15, y: 3.75, w: 3.7, h: 0.6, fontSize: 13, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.15, y: 4.4, w: 3.5, h: 0.04, fill: { color: C.accent } });
    items.forEach((item, j) => {
      s.addText("▸  " + item, { x: x + 0.2, y: 4.5 + j * 0.57, w: 3.6, h: 0.5, fontSize: 12, color: C.grey, fontFace: FONT_BODY });
    });
  });
  s.addNotes(`La présentation se découpe en trois parties.

PARTIE 1 — Processus Qualité :
- 4 métriques ISO 25010 : les indicateurs choisis pour mesurer objectivement la qualité du code — couverture de tests, vulnérabilités, performance et maintenabilité.
- Politique de tests DevSecOps : comment la sécurité est intégrée à chaque étape du cycle de vie, du plan au déploiement.
- Pipeline CI/CD 11 jobs : le schéma complet de la chaîne d'intégration et de livraison continue mise en place sur GitHub Actions.
- Compétences & formation : cartographie de l'équipe nécessaire et proposition de formation pour monter en compétences.

PARTIE 2 — Développement & Déploiement :
- Backlog & User Stories : les 4 fonctionnalités formalisées avant le développement — profil agrégé, authentification, catalogue produits, notifications.
- Architecture BFF / POC : le pattern Backend For Frontend retenu et validé en bac à sable avant intégration.
- Disponibilité & montée en charge : les mécanismes garantissant que l'application reste disponible en production — health check, restart automatique, persistance des données.
- Résultats & chiffres clés : les métriques concrètes issues des tests — 59 tests, 79% de couverture, p95 < 200ms, 0 CVE critique.

PARTIE 3 — Sécurité & Remédiation :
- Politique sécurité OWASP Top 10 : audit de la v1 selon le référentiel OWASP — 7 vulnérabilités identifiées dont 2 critiques.
- Plan de remédiation 3 sprints : traitement progressif des risques, du critique à la réduction de surface d'attaque.
- Mesures préventives v2 : les 3 dispositifs proactifs prévus pour la prochaine version — Vault, DAST, Dependabot.
- Bilan de la mission : récapitulatif de ce qui a été livré, mesuré, et les perspectives pour la v2.`);
}

// ─── SLIDE 3 — Contexte ─────────────────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "CONTEXTE");
  mainTitle(s, "La mission");

  const items = [
    { icon: "🏚", text: "Entreprise de 10 ans — SI fragmenté, pas\nde vente en ligne, CMS basique" },
    { icon: "🎯", text: "Mission : développer la v1 de la future\nplateforme numérique" },
    { icon: "👨‍💻", text: "Rôle Lead Developer : processus qualité,\nPOC fonctionnel, analyse sécurité" },
  ];
  items.forEach(({ icon, text }, i) => {
    const y = 3.6 + i * 1.1;
    card(s, 0.4, y, 12.5, 0.9);
    s.addText(icon + "  " + text, { x: 0.7, y: y + 0.1, w: 11.8, h: 0.7, fontSize: 14, color: C.white, fontFace: FONT_BODY });
  });
  s.addNotes("La Petite Maison de l'Epouvante est une société spécialisée dans le genre horrifique avec 10 ans d'existence. Le problème : leur SI est fragmenté et ils n'ont pas de vente en ligne. Ma mission en tant que Lead Dev : poser les bases d'une vraie plateforme numérique moderne.");
}

// ─── SLIDE 3 — Séparateur Partie 1 ──────────────────────────────────────────
{
  const s = slide({ bg: C.accent });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "1A0000" } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.5, w: "100%", h: 0.08, fill: { color: C.accent } });
  s.addText("PARTIE 1", {
    x: 0, y: 2.0, w: "100%", h: 0.7,
    fontSize: 14, bold: true, color: C.accent2, fontFace: FONT_BODY,
    align: "center", charSpacing: 6,
  });
  s.addText("Processus Qualité", {
    x: 0, y: 2.8, w: "100%", h: 1.5,
    fontSize: 54, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center",
  });
  s.addText("ISO 25010 · DevSecOps · CI/CD · Compétences", {
    x: 0, y: 4.4, w: "100%", h: 0.5,
    fontSize: 14, color: C.grey, fontFace: FONT_BODY, align: "center", italic: true,
  });
  s.addNotes("Commençons par le processus qualité. Comment garantit-on qu'on livre un produit fiable ? C'est la question centrale de cette première partie.");
}

// ─── SLIDE 4 — 4 Indicateurs ISO 25010 ──────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "QUALITE LOGICIELLE — ISO 25010");
  mainTitle(s, "4 métriques pour éviter\nla dette technique");

  const metrics = [
    { label: "Couverture\nde tests", val: "59,11%\nlignes", iso: "Fiabilité", tool: "PHPUnit + PCOV", color: "1A3A2E" },
    { label: "Vulnérabilités\n0-day", val: "0\nCRITICAL", iso: "Sécurité", tool: "Trivy", color: "3A1A1A" },
    { label: "Temps de\nréponse p95", val: "< 200ms", iso: "Performance", tool: "k6", color: "1A2A3A" },
    { label: "Code smells\n/ duplications", val: "SonarCloud\nactif", iso: "Maintenabilité", tool: "SonarCloud", color: "2A1A3A" },
  ];

  metrics.forEach(({ label, val, iso, tool, color }, i) => {
    const x = 0.3 + i * 3.2;
    card(s, x, 3.2, 3.0, 3.6, color);
    s.addText(label, { x: x + 0.15, y: 3.35, w: 2.7, h: 0.7, fontSize: 12, bold: true, color: C.grey, fontFace: FONT_BODY, align: "center" });
    s.addText(val, { x: x + 0.1, y: 4.1, w: 2.8, h: 1.0, fontSize: 22, bold: true, color: C.accent2, fontFace: FONT_TITLE, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.5, y: 5.15, w: 2.0, h: 0.04, fill: { color: C.accent } });
    s.addText(iso, { x: x + 0.1, y: 5.25, w: 2.8, h: 0.4, fontSize: 10, color: C.gold, fontFace: FONT_BODY, align: "center" });
    s.addText(tool, { x: x + 0.1, y: 5.7, w: 2.8, h: 0.4, fontSize: 11, color: C.grey, fontFace: FONT_BODY, align: "center", italic: true });
  });
  s.addNotes("J'ai sélectionné 4 indicateurs directement issus de la norme ISO 25010. Ce ne sont pas des métriques arbitraires — chacune est mesurée automatiquement dans le pipeline CI/CD. Si la couverture passe sous le seuil, le build échoue directement.");
}

// ─── SLIDE 5 — DevSecOps Cycle de vie ────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "DEVSECOPS");
  mainTitle(s, 'Shift Left Security\n— la sécurité à chaque étape');

  const steps = [
    { name: "Plan",   tools: "Backlog\nUser Stories", color: "1A1A2E" },
    { name: "Code",   tools: "SAST\nnpm audit", color: "2E1A1A" },
    { name: "Build",  tools: "Docker\nTrivy FS", color: "1A2E1A" },
    { name: "Test",   tools: "PHPUnit\nk6 E2E", color: "2E2A1A" },
    { name: "Deploy", tools: "Self-hosted\nRunner", color: "1A1A2E" },
  ];
  const arrows = ["→", "→", "→", "→"];

  steps.forEach(({ name, tools, color }, i) => {
    const x = 0.3 + i * 2.6;
    card(s, x, 3.0, 2.3, 2.8, color);
    s.addText(name, { x: x + 0.1, y: 3.15, w: 2.1, h: 0.55, fontSize: 16, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.4, y: 3.75, w: 1.5, h: 0.04, fill: { color: C.accent } });
    s.addText(tools, { x: x + 0.1, y: 3.85, w: 2.1, h: 1.5, fontSize: 12, color: C.grey, fontFace: FONT_BODY, align: "center" });
    s.addText("🔒", { x: x + 0.85, y: 5.45, w: 0.6, h: 0.4, fontSize: 14, align: "center" });
    if (i < 4) {
      s.addText(arrows[i], { x: x + 2.3, y: 4.0, w: 0.4, h: 0.6, fontSize: 22, color: C.accent, fontFace: FONT_BODY, align: "center", bold: true });
    }
  });
  s.addNotes("Le principe DevSecOps, c'est intégrer la sécurité à chaque étape plutôt qu'à la fin. Plan, Code, Build, Test, Deploy — à chaque phase, des outils automatiques vérifient que rien ne dérape. On appelle ça le Shift Left Security.");
}

// ─── SLIDE 6 — Pipeline CI/CD ────────────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  compactTitleSlide(s, "CI/CD — GITHUB ACTIONS", "Pipeline 11 jobs");

  // Ligne 1: install seul
  card(s, 5.9, 1.3, 1.6, 0.55, "1A2E1A");
  s.addText("install", { x: 5.9, y: 1.35, w: 1.6, h: 0.45, fontSize: 10, bold: true, color: C.green, fontFace: FONT_BODY, align: "center" });

  // Ligne 2: sast | trivy-fs | unit-test | e2e-test
  const l2 = ["sast\nnpm-audit", "trivy\nfs-audit", "unit\ntest", "e2e\ntest"];
  const l2colors = ["2E1A1A", "2E1A1A", "1A2E1A", "1A2E1A"];
  l2.forEach((name, i) => {
    const x = 1.0 + i * 3.0;
    card(s, x, 2.2, 2.5, 0.65, l2colors[i]);
    s.addText(name, { x: x, y: 2.25, w: 2.5, h: 0.55, fontSize: 9, color: i < 2 ? C.accent2 : C.green, fontFace: FONT_BODY, align: "center" });
  });
  s.addText("↓", { x: 6.5, y: 1.85, w: 0.5, h: 0.4, fontSize: 14, color: C.grey, align: "center" });

  // Ligne 3: sonar | k6
  [["sonar\naudit", "2E1A2E", C.gold, 2.5], ["k6\nsmoke-test", "1A2E2E", "#3498DB", 7.2]].forEach(([name, bg, col, x]) => {
    card(s, x, 3.15, 2.5, 0.65, bg);
    s.addText(name, { x: x, y: 3.2, w: 2.5, h: 0.55, fontSize: 9, color: col, fontFace: FONT_BODY, align: "center" });
  });

  // Ligne 4: build-image (self-hosted)
  card(s, 5.9, 4.1, 1.6, 0.6, "2E2A1A");
  s.addText("build-image\n🖥 self-hosted", { x: 5.9, y: 4.12, w: 1.6, h: 0.55, fontSize: 8, color: C.gold, fontFace: FONT_BODY, align: "center" });

  // Ligne 5: trivy-image
  card(s, 5.9, 5.0, 1.6, 0.6, "2E1A1A");
  s.addText("trivy\nimage-scan", { x: 5.9, y: 5.02, w: 1.6, h: 0.55, fontSize: 8, color: C.accent2, fontFace: FONT_BODY, align: "center" });

  // Ligne 6: staging | production
  [["deploy\nstaging\n:8089", 3.5], ["deploy\nproduction\n:8088", 8.4]].forEach(([name, x]) => {
    card(s, x, 5.95, 2.5, 0.75, "1A2A1A");
    s.addText(name, { x: x, y: 5.97, w: 2.5, h: 0.72, fontSize: 8, color: C.green, fontFace: FONT_BODY, align: "center" });
  });

  // Flèches verticales de liaison
  ["↓", "↓", "↓", "↓"].forEach((a, i) => {
    s.addText(a, { x: 6.55, y: 3.75 + i * 0.9, w: 0.4, h: 0.35, fontSize: 12, color: C.grey, align: "center" });
  });

  // Légende
  s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 6.85, w: 0.25, h: 0.18, fill: { color: "1A2E1A" } });
  s.addText("Tests / Build", { x: 0.6, y: 6.83, w: 2, h: 0.22, fontSize: 8, color: C.grey, fontFace: FONT_BODY });
  s.addShape(pptx.ShapeType.rect, { x: 3.0, y: 6.85, w: 0.25, h: 0.18, fill: { color: "2E1A1A" } });
  s.addText("Sécurité / Scan", { x: 3.3, y: 6.83, w: 2, h: 0.22, fontSize: 8, color: C.grey, fontFace: FONT_BODY });
  s.addShape(pptx.ShapeType.rect, { x: 5.8, y: 6.85, w: 0.25, h: 0.18, fill: { color: "2E2A1A" } });
  s.addText("Self-hosted runner", { x: 6.1, y: 6.83, w: 2.5, h: 0.22, fontSize: 8, color: C.grey, fontFace: FONT_BODY });
  s.addNotes("Voici le pipeline complet avec ses 11 jobs. Les blocs rouges sont les scans de sécurité, les verts les tests fonctionnels. Important à noter : les 3 jobs en bas — build, staging, production — tournent sur mon propre ordinateur grâce au self-hosted runner.");
}

// ─── SLIDE 7 — Compétences & Formation ──────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "EQUIPE & MONTEE EN COMPETENCES");
  mainTitle(s, "Cartographie des compétences");

  const profiles = [
    { role: "Lead Developer", skills: "Architecture · CI/CD\nSécurité · DevSecOps", nb: "×1", color: "2E1A1A" },
    { role: "Dev Backend",    skills: "PHP/Symfony · API\nTests unitaires", nb: "×2", color: "1A1A2E" },
    { role: "Dev Frontend",   skills: "JS/Stimulus · UX\nAsset Mapper", nb: "×1", color: "1A2E2E" },
    { role: "DevOps",         skills: "Docker · K8s\nGitHub Actions", nb: "×1", color: "1A2E1A" },
  ];
  profiles.forEach(({ role, skills, nb, color }, i) => {
    const x = 0.3 + i * 3.3;
    card(s, x, 3.0, 3.0, 2.8, color);
    s.addText(nb, { x: x + 0.15, y: 3.1, w: 2.7, h: 0.5, fontSize: 22, bold: true, color: C.accent2, fontFace: FONT_TITLE, align: "right" });
    s.addText(role, { x: x + 0.15, y: 3.6, w: 2.7, h: 0.5, fontSize: 13, bold: true, color: C.white, fontFace: FONT_BODY, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.5, y: 4.15, w: 2.0, h: 0.04, fill: { color: C.accent } });
    s.addText(skills, { x: x + 0.1, y: 4.25, w: 2.8, h: 1.2, fontSize: 12, color: C.grey, fontFace: FONT_BODY, align: "center" });
  });

  // Formation
  card(s, 0.3, 6.0, 12.8, 0.9, "1A1A1A");
  s.addText("📚  Formation proposée :", { x: 0.5, y: 6.1, w: 3, h: 0.55, fontSize: 12, bold: true, color: C.gold, fontFace: FONT_BODY });
  s.addText("Certification Kubernetes CKA pour le DevOps — 3 mois · 100% en ligne · Linux Foundation", {
    x: 3.5, y: 6.1, w: 9.4, h: 0.55, fontSize: 12, color: C.white, fontFace: FONT_BODY,
  });
  s.addNotes("Pour mener ce type de projet, il faut une équipe pluridisciplinaire couvrant 4 profils. La formation CKA pour le DevOps est particulièrement pertinente car Kubernetes est la prochaine étape d'infrastructure. C'est une certification reconnue, 100% en ligne, délivrée par la Linux Foundation.");
}

// ─── SLIDE 8 — Séparateur Partie 2 ──────────────────────────────────────────
{
  const s = slide({ bg: "1A0000" });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.5, w: "100%", h: 0.08, fill: { color: C.accent } });
  s.addText("PARTIE 2", {
    x: 0, y: 2.0, w: "100%", h: 0.7,
    fontSize: 14, bold: true, color: C.accent2, fontFace: FONT_BODY, align: "center", charSpacing: 6,
  });
  s.addText("Développement & Déploiement", {
    x: 0, y: 2.8, w: "100%", h: 1.5,
    fontSize: 46, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center",
  });
  s.addText("Backlog · Architecture BFF · POC · Disponibilité · Résultats", {
    x: 0, y: 4.4, w: "100%", h: 0.5,
    fontSize: 14, color: C.grey, fontFace: FONT_BODY, align: "center", italic: true,
  });
  s.addNotes("Passons maintenant à la partie réalisation. Comment a-t-on concrètement traduit les besoins métier en code fonctionnel déployé ?");
}

// ─── SLIDE 9 — Backlog / User Stories ───────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "ANALYSE DES EXIGENCES");
  mainTitle(s, "4 User Stories — Backlog v1");

  const us = [
    { id: "US-01", title: "Profil utilisateur agrégé", detail: "BFF · GET /api/profile/{id}\nCache 60s · statut 206 si service KO", color: "2E1A1A", tag: "IMPLEMENTED" },
    { id: "US-02", title: "Authentification Keycloak", detail: "OAuth2/OIDC · Authorization Code\nState CSRF · JWT claims", color: "1A1A2E", tag: "IMPLEMENTED" },
    { id: "US-03", title: "Catalogue produits", detail: "GET /api/products\nSans authentification", color: "1A2E1A", tag: "IMPLEMENTED" },
    { id: "US-04", title: "Notification asynchrone", detail: "Symfony Messenger\nGhostAlert + Login events", color: "2E2A1A", tag: "IMPLEMENTED" },
  ];

  us.forEach(({ id, title, detail, color, tag }, i) => {
    const x = 0.3 + (i % 2) * 6.6;
    const y = 3.0 + Math.floor(i / 2) * 2.15;
    card(s, x, y, 6.3, 1.9, color);
    s.addText(id, { x: x + 0.15, y: y + 0.1, w: 1.2, h: 0.45, fontSize: 13, bold: true, color: C.accent2, fontFace: FONT_BODY });
    s.addText(tag, { x: x + 4.3, y: y + 0.08, w: 1.8, h: 0.35, fontSize: 8, color: C.green, fontFace: FONT_BODY, bold: true, align: "right" });
    s.addText(title, { x: x + 0.15, y: y + 0.55, w: 6.0, h: 0.5, fontSize: 14, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addText(detail, { x: x + 0.15, y: y + 1.05, w: 6.0, h: 0.7, fontSize: 11, color: C.grey, fontFace: FONT_BODY });
  });
  s.addNotes("Avant d'écrire une seule ligne de code, on formalise les besoins sous forme de User Stories. Les 4 US couvrent les fonctionnalités clés : profil agrégé, authentification SSO, catalogue produits et notifications asynchrones. Toutes sont implémentées et couvertes par des tests.");
}

// ─── SLIDE 10 — Architecture technique ──────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  compactTitleSlide(s, "ARCHITECTURE TECHNIQUE", "API Gateway / BFF Pattern");

  // Client
  card(s, 5.6, 1.3, 2.2, 0.6, "2E1A2E");
  s.addText("CLIENT (Navigateur)", { x: 5.6, y: 1.38, w: 2.2, h: 0.45, fontSize: 9, bold: true, color: C.white, fontFace: FONT_BODY, align: "center" });

  // BFF
  card(s, 4.5, 2.35, 4.4, 0.75, "1A1A2E");
  s.addText("API Gateway / BFF\nGET /api/profile/{id} · Cache 60s", { x: 4.5, y: 2.38, w: 4.4, h: 0.65, fontSize: 9, color: C.gold, fontFace: FONT_BODY, align: "center" });

  // Keycloak
  card(s, 0.3, 2.35, 3.0, 0.75, "2E1A1A");
  s.addText("Keycloak\nOAuth2/OIDC · SSO", { x: 0.3, y: 2.38, w: 3.0, h: 0.65, fontSize: 9, color: C.accent2, fontFace: FONT_BODY, align: "center" });

  // Services
  [["UserService\n/internal/users", 4.5, 3.6, "1A2E2E"], ["SubscriptionService\n/internal/subscriptions", 8.0, 3.6, "1A2E2E"]].forEach(([t, x, y, c]) => {
    card(s, x, y, 3.0, 0.75, c);
    s.addText(t, { x, y: y + 0.05, w: 3.0, h: 0.65, fontSize: 8, color: C.white, fontFace: FONT_BODY, align: "center" });
  });

  // App Symfony
  card(s, 1.8, 4.7, 9.8, 0.85, "1A1A1A");
  s.addText("Application Symfony 6.4 / PHP 8.2\nControllers · Messenger · Security", { x: 1.8, y: 4.72, w: 9.8, h: 0.75, fontSize: 10, color: C.white, fontFace: FONT_BODY, align: "center" });

  // Infra
  [["PostgreSQL\nDoctrine", 0.3, 5.85, "1A2E1A"], ["RabbitMQ\nAMQP/sync://", 5.0, 5.85, "2E2A1A"], ["Monolog\nLogs JSON", 9.7, 5.85, "1A1A2E"]].forEach(([t, x, y, c]) => {
    card(s, x, y, 3.5, 0.75, c);
    s.addText(t, { x, y: y + 0.05, w: 3.5, h: 0.65, fontSize: 9, color: C.grey, fontFace: FONT_BODY, align: "center" });
  });

  // Flèches
  [
    { x: 6.6, y: 1.9, w: 0.3, h: 0.45 },
    { x: 6.6, y: 3.1, w: 0.3, h: 0.5 },
    { x: 6.6, y: 4.2, w: 0.3, h: 0.5 },
    { x: 6.6, y: 5.5, w: 0.3, h: 0.35 },
  ].forEach(pos => s.addText("↓", { ...pos, fontSize: 12, color: C.grey, align: "center" }));
  s.addNotes("L'architecture repose sur le pattern BFF, Backend For Frontend. Le client n'a qu'un seul point d'entrée qui agrège les réponses de plusieurs services. Le cache de 60 secondes évite de surcharger les services internes à chaque requête et améliore les performances.");
}

// ─── SLIDE 11 — Expérimentation ─────────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "BAC A SABLE — POC & EXPÉRIMENTATION");
  mainTitle(s, "5 technologies validées en POC\navant intégration");

  const exps = [
    { tech: "BFF ApiAggregator",   result: "✅ Validé",   detail: "Agrégation multi-services\nCache filesystem 60s · 206 si KO" },
    { tech: "Keycloak OAuth2",     result: "✅ Validé",   detail: "SSO local · Auth Code Flow\nState CSRF · claims JWT" },
    { tech: "Symfony Messenger",   result: "✅ Validé",   detail: "sync:// transparent en dev\nAMQP en prod — sans code change" },
    { tech: "GitHub Actions",      result: "✅ Validé",   detail: "Self-hosted runner Windows\n11 jobs · déploiement automatique" },
    { tech: "Docker / Apache",     result: "⚠️ Problème résolu", detail: "mod_php ne passe pas\nles vars Docker → SetEnv Apache" },
  ];

  exps.forEach(({ tech, result, detail }, i) => {
    const x = 0.3 + (i % 3) * 4.4;
    const y = i < 3 ? 3.1 : 4.95;
    const xAlt = i === 3 ? 2.5 : i === 4 ? 6.9 : x;
    card(s, xAlt, y, 4.0, 1.6, i === 4 ? "2E2A1A" : "1A1A2E");
    s.addText(tech, { x: xAlt + 0.15, y: y + 0.1, w: 3.7, h: 0.45, fontSize: 12, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addText(result, { x: xAlt + 0.15, y: y + 0.55, w: 3.7, h: 0.3, fontSize: 10, color: i === 4 ? C.orange : C.green, fontFace: FONT_BODY, bold: true });
    s.addText(detail, { x: xAlt + 0.15, y: y + 0.85, w: 3.7, h: 0.65, fontSize: 9, color: C.grey, fontFace: FONT_BODY });
  });
  s.addNotes("Chaque technologie a été testée dans un bac à sable avant intégration. La difficulté principale : Apache mod_php ne transmet pas automatiquement les variables Docker à PHP. J'ai dû ajouter une directive SetEnv dans la configuration Apache pour contourner ce problème.");
}

// ─── SLIDE 12 — Résultats des tests ─────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "QUALITE MESUREE");
  mainTitle(s, "Résultats — chiffres clés");

  const stats = [
    { val: "59",      sub: "tests PHPUnit",        detail: "186 assertions · 0 échec", color: "1A2E1A" },
    { val: "78,95%",  sub: "couverture classes",   detail: "59,11% lignes · PCOV", color: "1A1A2E" },
    { val: "35/35",   sub: "checks k6",            detail: "p95 < 200ms · 0% erreurs", color: "2E2A1A" },
    { val: "0",       sub: "CVE Critical",         detail: "Trivy image scan", color: "2E1A1A" },
  ];

  stats.forEach(({ val, sub, detail, color }, i) => {
    const x = 0.3 + i * 3.3;
    card(s, x, 3.0, 3.0, 3.6, color);
    s.addText(val, { x: x + 0.1, y: 3.2, w: 2.8, h: 1.3, fontSize: 40, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.5, y: 4.55, w: 2.0, h: 0.05, fill: { color: C.accent } });
    s.addText(sub, { x: x + 0.1, y: 4.65, w: 2.8, h: 0.5, fontSize: 12, bold: true, color: C.gold, fontFace: FONT_BODY, align: "center" });
    s.addText(detail, { x: x + 0.1, y: 5.2, w: 2.8, h: 0.5, fontSize: 11, color: C.grey, fontFace: FONT_BODY, align: "center" });
  });

  card(s, 0.3, 6.65, 12.8, 0.45, "1A1A1A");
  s.addText("✅  Pipeline complet : install → sast → sonar → trivy → unit-test → e2e → k6 → build-image → trivy-image → staging → production", {
    x: 0.5, y: 6.68, w: 12.4, h: 0.35, fontSize: 10, color: C.green, fontFace: FONT_BODY,
  });
  s.addNotes("Les chiffres valident la qualité de la réalisation. 59 tests, zéro échec, 186 assertions. La couverture de classes dépasse 78%. Les tests k6 confirment des temps de réponse inférieurs à 200ms au 95e percentile. Trivy ne remonte aucune CVE critique sur l'image Docker.");
}

// ─── SLIDE 12b — Disponibilité & Montée en charge ───────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "MISE EN PRODUCTION — DISPONIBILITÉ");
  mainTitle(s, "Orchestrer la production\npour garantir la disponibilité");

  const items = [
    { icon: "🔄", title: "Restart automatique",      detail: "--restart=unless-stopped\nRedémarrage auto si crash conteneur",   color: "1A2E1A" },
    { icon: "🏥", title: "Health check /healthy",    detail: "12 tentatives × 5s dans le pipeline\nVérification DB + endpoint Symfony",  color: "1A1A2E" },
    { icon: "🗄️",  title: "Persistance des données", detail: "Volume Docker lpmde_pg_data\nDonnées conservées entre déploiements",  color: "2E2A1A" },
    { icon: "⚡", title: "Performance validée k6",   detail: "35/35 checks · p95 < 200ms\n0% d'erreurs sous charge simulée",      color: "1A2E2E" },
  ];

  items.forEach(({ icon, title, detail, color }, i) => {
    const x = 0.3 + (i % 2) * 6.6;
    const y = 3.0 + Math.floor(i / 2) * 2.0;
    card(s, x, y, 6.3, 1.75, color);
    s.addText(icon + "  " + title, { x: x + 0.15, y: y + 0.12, w: 6.0, h: 0.55, fontSize: 14, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addText(detail, { x: x + 0.15, y: y + 0.72, w: 6.0, h: 0.9, fontSize: 12, color: C.grey, fontFace: FONT_BODY });
  });

  card(s, 0.3, 6.82, 12.8, 0.35, "1A1A1A");
  s.addText("🚀  Roadmap scalabilité : Kubernetes (CKA) → Load Balancer → Multi-instances → SLA 99,9%", {
    x: 0.5, y: 6.84, w: 12.4, h: 0.28, fontSize: 10, color: C.gold, fontFace: FONT_BODY,
  });
  s.addNotes("La disponibilité est garantie par plusieurs mécanismes complémentaires : le restart automatique Docker en cas de crash, le health check automatisé avec 12 tentatives dans le pipeline, la persistance via volume nommé, et les tests k6 qui valident les performances sous charge. La prochaine étape vers la vraie montée en charge horizontale : Kubernetes.");
}

// ─── SLIDE 13 — Séparateur Partie 3 ─────────────────────────────────────────
{
  const s = slide({ bg: "1A0000" });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.5, w: "100%", h: 0.08, fill: { color: C.accent } });
  s.addText("PARTIE 3", {
    x: 0, y: 2.0, w: "100%", h: 0.7,
    fontSize: 14, bold: true, color: C.accent2, fontFace: FONT_BODY, align: "center", charSpacing: 6,
  });
  s.addText("Sécurité & Remédiation", {
    x: 0, y: 2.8, w: "100%", h: 1.5,
    fontSize: 50, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center",
  });
  s.addText("OWASP Top 10 · Plan de remédiation · Mesures préventives v2", {
    x: 0, y: 4.4, w: "100%", h: 0.5,
    fontSize: 14, color: C.grey, fontFace: FONT_BODY, align: "center", italic: true,
  });
  s.addNotes("Passons maintenant à l'analyse de sécurité. Un bon logiciel c'est aussi un logiciel sécurisé. Dans cette v1, j'ai identifié plusieurs points d'amélioration et proposé un plan d'action concret.");
}

// ─── SLIDE 14 — Vulnérabilités OWASP ────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "ANALYSE SECURITE — OWASP TOP 10");
  mainTitle(s, "7 vulnérabilités identifiées en v1");

  const vulns = [
    { id: "V-01", label: "access_control: [] en dev",          crit: "CRITIQUE", color: C.accent2 },
    { id: "V-02", label: "SQLite sans chiffrement en prod",     crit: "HAUTE",    color: C.orange },
    { id: "V-03", label: "APP_SECRET potentiellement exposé",   crit: "CRITIQUE", color: C.accent2 },
    { id: "V-04", label: "Pas de rate limiting sur /api/*",     crit: "HAUTE",    color: C.orange },
    { id: "V-05", label: "Headers CSP / HSTS absents",          crit: "MOYENNE",  color: C.gold },
    { id: "V-06", label: "Logs sans anonymisation RGPD",        crit: "MOYENNE",  color: C.gold },
    { id: "V-07", label: "Image Docker php:8.2-apache (large)", crit: "BASSE",    color: C.grey },
  ];

  vulns.forEach(({ id, label, crit, color }, i) => {
    const y = 2.85 + i * 0.61;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 9.5, h: 0.5, fill: { color: "1A1A2E" }, line: { color: "2A2A3E", width: 1 } });
    s.addText(id, { x: 0.45, y: y + 0.05, w: 0.8, h: 0.4, fontSize: 10, bold: true, color: color, fontFace: FONT_BODY });
    s.addText(label, { x: 1.3, y: y + 0.05, w: 7.0, h: 0.4, fontSize: 11, color: C.white, fontFace: FONT_BODY });
    s.addShape(pptx.ShapeType.rect, { x: 10.0, y: y + 0.07, w: 2.8, h: 0.35, fill: { color: "0D0D0D" }, line: { color, width: 1.5 } });
    s.addText(crit, { x: 10.0, y: y + 0.07, w: 2.8, h: 0.35, fontSize: 9, bold: true, color, fontFace: FONT_BODY, align: "center", valign: "middle" });
  });
  s.addNotes("J'ai audité la v1 selon le référentiel OWASP Top 10. Résultat : 7 vulnérabilités identifiées dont 2 critiques. Le contrôle d'accès ouvert en développement et l'APP_SECRET potentiellement exposé sont les risques les plus sérieux à traiter en priorité.");
}

// ─── SLIDE 15 — Plan de remédiation ─────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "PLAN DE REMEDIATION");
  mainTitle(s, "3 sprints — du critique au préventif");

  const sprints = [
    {
      sprint: "Sprint 1\nImmédiat",
      actions: "• Activer access_control en prod\n• Secrets via GitHub Secrets / Vault\n• Migrer vers PostgreSQL",
      impact: "Critique → Résolu",
      color: "2E1A1A",
      impactColor: C.green,
    },
    {
      sprint: "Sprint 2\n1 mois",
      actions: "• Rate limiting Symfony\n• Headers CSP / HSTS\n• Anonymisation logs RGPD",
      impact: "Haute → Résolu",
      color: "2E2A1A",
      impactColor: C.gold,
    },
    {
      sprint: "Sprint 3\n3 mois",
      actions: "• Image Docker alpine/distroless\n• WAF en frontal\n• Audit RGPD complet",
      impact: "Surface réduite",
      color: "1A1A2E",
      impactColor: C.grey,
    },
  ];

  sprints.forEach(({ sprint, actions, impact, color, impactColor }, i) => {
    const x = 0.4 + i * 4.3;
    card(s, x, 3.0, 4.0, 4.0, color);
    s.addText(sprint, { x: x + 0.15, y: 3.1, w: 3.7, h: 0.7, fontSize: 14, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.5, y: 3.85, w: 3.0, h: 0.05, fill: { color: C.accent } });
    s.addText(actions, { x: x + 0.2, y: 3.95, w: 3.6, h: 2.4, fontSize: 12, color: C.grey, fontFace: FONT_BODY, paraSpaceAfter: 4 });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.3, y: 6.45, w: 3.4, h: 0.38, fill: { color: "0A0A0A" }, line: { color: impactColor, width: 1.5 } });
    s.addText(impact, { x: x + 0.3, y: 6.45, w: 3.4, h: 0.38, fontSize: 11, bold: true, color: impactColor, fontFace: FONT_BODY, align: "center", valign: "middle" });
  });
  s.addNotes("Le plan de remédiation est organisé en 3 sprints progressifs. En sprint 1, on traite l'essentiel : fermer le contrôle d'accès, sécuriser les secrets via GitHub Secrets, migrer vers PostgreSQL. Les sprints 2 et 3 adressent les vulnérabilités de niveau haute et basse.");
}

// ─── SLIDE 16 — Mesures préventives v2 ──────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "VERSION 2 — DEVSECOPS RENFORCE");
  mainTitle(s, "3 mesures préventives\npour la v2");

  const measures = [
    {
      num: "01",
      title: "Secrets Management",
      desc: "HashiCorp Vault ou GitHub Secrets\navec rotation automatique des clés\net audit trail des accès",
      icon: "🔐",
      color: "2E1A1A",
    },
    {
      num: "02",
      title: "DAST Pipeline",
      desc: "OWASP ZAP intégré au job staging\nTest dynamique automatisé\nRapport SARIF → GitHub Security",
      icon: "🕵️",
      color: "1A1A2E",
    },
    {
      num: "03",
      title: "SCA — Dépendances",
      desc: "Dependabot activé sur composer.json\nAlertes CVE automatiques\nMise à jour PR automatique",
      icon: "📦",
      color: "1A2E1A",
    },
  ];

  measures.forEach(({ num, title, desc, icon, color }, i) => {
    const x = 0.4 + i * 4.3;
    card(s, x, 3.0, 4.0, 4.1, color);
    s.addText(num, { x: x + 0.2, y: 3.1, w: 1.0, h: 0.8, fontSize: 36, bold: true, color: C.accent2, fontFace: FONT_TITLE });
    s.addText(icon, { x: x + 2.8, y: 3.1, w: 1.0, h: 0.8, fontSize: 28, align: "right" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.3, y: 3.9, w: 3.4, h: 0.05, fill: { color: C.accent } });
    s.addText(title, { x: x + 0.2, y: 4.0, w: 3.6, h: 0.55, fontSize: 14, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addText(desc, { x: x + 0.2, y: 4.6, w: 3.6, h: 2.0, fontSize: 12, color: C.grey, fontFace: FONT_BODY });
  });
  s.addNotes("Pour la v2, la sécurité devient proactive. HashiCorp Vault pour la gestion des secrets avec rotation automatique, OWASP ZAP intégré dans le pipeline pour les tests dynamiques, et Dependabot pour la surveillance continue des dépendances. On ne réagit plus, on anticipe.");
}

// ─── SLIDE 17 — Bilan ───────────────────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "BILAN DE LA MISSION");
  mainTitle(s, "Livraison complète de la v1");

  const cols = [
    {
      title: "✅ Livré",
      items: ["Pipeline CI/CD 11 jobs", "BFF + Keycloak + Messenger", "Déploiement auto self-hosted", "4 livrables documentaires"],
      color: "1A2E1A",
      titleColor: C.green,
    },
    {
      title: "📊 Mesuré",
      items: ["59 tests · 79% coverage", "k6 p95 < 200ms · 0 erreur", "0 CVE Critical (Trivy)", "SonarCloud actif"],
      color: "1A1A2E",
      titleColor: C.gold,
    },
    {
      title: "🚀 Perspective v2",
      items: ["PostgreSQL + RabbitMQ", "WAF + DAST pipeline", "Kubernetes en production", "Espace communautaire"],
      color: "2E1A1A",
      titleColor: C.accent2,
    },
  ];

  cols.forEach(({ title, items, color, titleColor }, i) => {
    const x = 0.4 + i * 4.3;
    card(s, x, 3.0, 4.0, 4.1, color);
    s.addText(title, { x: x + 0.15, y: 3.1, w: 3.7, h: 0.55, fontSize: 14, bold: true, color: titleColor, fontFace: FONT_BODY, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.5, y: 3.7, w: 3.0, h: 0.05, fill: { color: C.accent } });
    items.forEach((item, j) => {
      s.addText("▸  " + item, { x: x + 0.2, y: 3.85 + j * 0.72, w: 3.6, h: 0.6, fontSize: 11, color: C.white, fontFace: FONT_BODY });
    });
  });
  s.addNotes("Pour conclure : on a livré une application fonctionnelle avec un pipeline de 11 jobs, une architecture BFF éprouvée, et une analyse de sécurité complète. Les métriques sont au vert et les perspectives v2 sont clairement définies. C'est une base solide pour la suite.");
}

// ─── SLIDE 18 — Questions ────────────────────────────────────────────────────
{
  const s = slide({ bg: C.bg });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.5, h: "100%", fill: { color: C.accent } });
  s.addText("Merci", {
    x: 0.8, y: 1.2, w: 11, h: 2.0,
    fontSize: 72, bold: true, color: C.white, fontFace: FONT_TITLE,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 3.4, w: 5, h: 0.06, fill: { color: C.accent } });
  s.addText("Questions ?", {
    x: 0.8, y: 3.6, w: 8, h: 0.9,
    fontSize: 30, color: C.grey, fontFace: FONT_TITLE, italic: true,
  });

  const links = [
    "🔗  github.com/Brok3nWings/lpmde",
    "🖥  Staging : http://localhost:8089",
    "🚀  Production : http://localhost:8088",
  ];
  links.forEach((l, i) => {
    s.addText(l, { x: 0.8, y: 4.8 + i * 0.55, w: 10, h: 0.45, fontSize: 13, color: C.gold, fontFace: FONT_BODY });
  });
  s.addNotes("Voilà, c'est la fin de cette présentation. Je suis disponible pour toutes vos questions. N'hésitez pas à demander une démonstration live — les environnements staging et production sont actifs sur ma machine en ce moment.");
}

// ─── Génération ───────────────────────────────────────────────────────────────
const outputPath = "presentation-LPMDE.pptx";
await pptx.writeFile({ fileName: outputPath });
console.log(`✅  Fichier généré : ${outputPath}`);
