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
const FONT_TITLE  = "Palatino Linotype";
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
  s.addNotes(`Bonjour à tous. Je m'appelle Bryan JOUBERT, je vais vous présenter le travail réalisé dans le cadre du module Superviser et assurer le développement des applications logicielles.

Sur ce projet, j'ai endossé le rôle de Lead Developer pour La Petite Maison de l'Épouvante — une entreprise spécialisée dans l'univers horrifique.

La présentation couvre trois grandes dimensions :
- Comment j'ai structuré le processus qualité, du choix des indicateurs à la mise en place du pipeline CI/CD
- Comment le POC fonctionnel a été conçu et déployé, de l'architecture aux résultats mesurés
- Comment j'ai audité la sécurité et proposé un plan de remédiation concret

On parcourt tout ça ensemble, n'hésitez pas à m'interrompre si quelque chose mérite d'être précisé.`);
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
    {
      num: "01",
      title: "L'entreprise",
      desc: "10 ans dans le secteur horrifique\nSI fragmenté — CMS basique\nAucune vente en ligne",
      color: "2E1A1A",
    },
    {
      num: "02",
      title: "La mission",
      desc: "Développer la v1 de la future\nplateforme numérique\nBase technique solide et évolutive",
      color: "1A1A2E",
    },
    {
      num: "03",
      title: "Mon rôle — Lead Developer",
      desc: "Processus qualité & ISO 25010\nPOC fonctionnel & architecture\nAnalyse sécurité & remédiation",
      color: "1A2E1A",
    },
  ];
  items.forEach(({ num, title, desc, color }, i) => {
    const x = 0.4 + i * 4.3;
    card(s, x, 3.0, 4.0, 4.0, color);
    s.addText(num, { x: x + 0.15, y: 3.1, w: 0.8, h: 0.65, fontSize: 28, bold: true, color: C.accent2, fontFace: FONT_TITLE });
    s.addText(title, { x: x + 0.15, y: 3.75, w: 3.7, h: 0.55, fontSize: 13, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.15, y: 4.35, w: 3.5, h: 0.04, fill: { color: C.accent } });
    s.addText(desc, { x: x + 0.2, y: 4.45, w: 3.6, h: 2.2, fontSize: 12, color: C.grey, fontFace: FONT_BODY });
  });
  s.addNotes(`Cette diapositive pose le contexte de la mission.

🏚 L'entreprise : La Petite Maison de l'Épouvante a 10 ans d'existence dans le secteur horrifique. Leur système d'information est fragmenté — un CMS basique, pas de vente en ligne, pas de plateforme digitale cohérente. Le potentiel est là, mais les outils ne suivent pas.

🎯 La mission : développer la v1 de leur future plateforme numérique. L'objectif n'est pas de tout livrer d'un coup, c'est de poser une base technique solide, testée et sécurisée, sur laquelle la v2 pourra s'appuyer.

👨‍💻 Mon rôle de Lead Developer : je suis responsable de trois choses — définir le processus qualité pour que le code soit fiable, livrer un POC fonctionnel qui valide les choix techniques, et réaliser une analyse de sécurité complète avec un plan d'action. Ce n'est pas uniquement développer — c'est structurer la démarche de bout en bout.`);
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
  s.addNotes(`Commençons par le processus qualité. La question fondamentale de cette partie : comment garantit-on qu'on livre un produit fiable, et pas juste "ça marche sur ma machine" ?

On va voir 4 choses concrètes :
- Les indicateurs ISO 25010 qui permettent de mesurer objectivement la qualité
- L'approche DevSecOps qui intègre la sécurité à chaque étape
- Le pipeline de 11 jobs qui automatise tout ça
- La cartographie de l'équipe nécessaire pour faire tourner ce type de projet`);
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
  s.addNotes(`Les 4 indicateurs présentés ici sont directement issus de la norme ISO 25010, qui définit la qualité logicielle selon plusieurs dimensions. Ce ne sont pas des métriques décoratives — elles sont mesurées automatiquement à chaque build.

Couverture de tests (Fiabilité) : 59,11% de lignes couvertes, mesurée par PHPUnit avec l'extension PCOV. C'est un seuil bloquant dans le pipeline — si la couverture baisse, le build échoue et le déploiement est stoppé.

Vulnérabilités 0-day (Sécurité) : 0 CVE CRITICAL détectées par Trivy, qui scanne à la fois les dépendances et l'image Docker finale. Ce résultat est validé à chaque build, pas juste une fois.

Temps de réponse p95 (Performance) : toutes les requêtes répondent en moins de 200ms au 95e percentile. Mesuré sous charge simulée par k6 — c'est un indicateur réaliste, pas un test à vide.

Code smells / duplications (Maintenabilité) : SonarCloud analyse en continu le code poussé sur GitHub et remonte les duplications, les mauvaises pratiques et la dette technique. L'objectif est de garder un code maintenable dans le temps.`);
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
    if (i < 4) {
      s.addText(arrows[i], { x: x + 2.3, y: 4.0, w: 0.4, h: 0.6, fontSize: 22, color: C.accent, fontFace: FONT_BODY, align: "center", bold: true });
    }
  });
  s.addNotes(`Le principe du DevSecOps, c'est ce qu'on appelle le 'Shift Left Security' : intégrer les contrôles de sécurité le plus tôt possible dans le cycle de développement, plutôt que de tout auditer à la fin quand il est trop tard.

Plan : dès cette phase, on formalise les besoins sous forme de Backlog et User Stories. Définir les critères d'acceptance dès le départ, c'est aussi une forme de prévention des erreurs.

Code : à chaque push, un SAST — analyse statique du code source — et un npm audit vérifient qu'aucune vulnérabilité n'est introduite par le développeur.

Build : Docker construit l'image et Trivy scanne immédiatement le système de fichiers pour détecter les CVE dans les dépendances installées. Si une faille est trouvée, le build s'arrête.

Test : PHPUnit pour les tests unitaires et k6 pour les tests end-to-end de performance. La qualité fonctionnelle est vérifiée avant tout déploiement.

Deploy : le déploiement est assuré par un runner self-hosted sur ma machine locale, qui gère les environnements staging et production de manière automatisée.`);
}

// ─── SLIDE 6 — Pipeline CI/CD ────────────────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  compactTitleSlide(s, "CI/CD — GITHUB ACTIONS", "Pipeline 11 jobs");

  // Layout horizontal : 6 stages de gauche à droite
  const stageW  = 1.65;
  const gapW    = 0.40;
  const xStart  = 0.50;
  const yCenter = 4.15;
  const jobH    = 0.70;
  const jobGap  = 0.10;

  const stages = [
    {
      label: "① INSTALL",
      jobs: [{ name: "install", color: "1A2E1A", textColor: C.green }],
    },
    {
      label: "② SECURITY · TESTS",
      jobs: [
        { name: "sast\nnpm-audit",  color: "2E1A1A", textColor: C.accent2 },
        { name: "trivy\nfs-audit",  color: "2E1A1A", textColor: C.accent2 },
        { name: "unit\ntest",       color: "1A2E1A", textColor: C.green   },
        { name: "e2e\ntest",        color: "1A2E1A", textColor: C.green   },
      ],
    },
    {
      label: "③ QUALITY",
      jobs: [
        { name: "sonar\naudit",    color: "2E1A2E", textColor: C.gold    },
        { name: "k6\nsmoke-test", color: "1A2E2E", textColor: "#3498DB" },
      ],
    },
    {
      label: "④ BUILD",
      jobs: [{ name: "build-image\n🖥 self-hosted", color: "2E2A1A", textColor: C.gold }],
    },
    {
      label: "⑤ SCAN",
      jobs: [{ name: "trivy\nimage-scan", color: "2E1A1A", textColor: C.accent2 }],
    },
    {
      label: "⑥ DEPLOY",
      jobs: [
        { name: "staging\n:8089",    color: "1A2A1A", textColor: C.green },
        { name: "production\n:8088", color: "1A2A1A", textColor: C.green },
      ],
    },
  ];

  stages.forEach(({ label, jobs }, i) => {
    const x      = xStart + i * (stageW + gapW);
    const totalH = jobs.length * jobH + (jobs.length - 1) * jobGap;
    const yTop   = yCenter - totalH / 2;

    // Étiquette du stage
    s.addText(label, {
      x, y: 1.38, w: stageW, h: 0.30,
      fontSize: 7.5, bold: true, color: C.grey, fontFace: FONT_BODY,
      align: "center", charSpacing: 0.3,
    });
    s.addShape(pptx.ShapeType.rect, {
      x: x + stageW / 2 - 0.55, y: 1.68, w: 1.1, h: 0.03,
      fill: { color: C.accent },
    });

    // Boîtes de jobs
    jobs.forEach(({ name, color, textColor }, j) => {
      const y = yTop + j * (jobH + jobGap);
      card(s, x, y, stageW, jobH, color);
      s.addText(name, {
        x, y: y + 0.03, w: stageW, h: jobH - 0.06,
        fontSize: 9, color: textColor, fontFace: FONT_BODY,
        align: "center", valign: "middle",
      });
    });

    // Flèche vers le stage suivant
    if (i < stages.length - 1) {
      s.addText("→", {
        x: x + stageW + 0.02, y: yCenter - 0.18, w: gapW - 0.04, h: 0.36,
        fontSize: 16, bold: true, color: C.accent, fontFace: FONT_BODY,
        align: "center", valign: "middle",
      });
    }
  });

  // Légende
  s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 6.85, w: 0.25, h: 0.18, fill: { color: "1A2E1A" } });
  s.addText("Tests / Build", { x: 0.6, y: 6.83, w: 2, h: 0.22, fontSize: 8, color: C.grey, fontFace: FONT_BODY });
  s.addShape(pptx.ShapeType.rect, { x: 3.0, y: 6.85, w: 0.25, h: 0.18, fill: { color: "2E1A1A" } });
  s.addText("Sécurité / Scan", { x: 3.3, y: 6.83, w: 2, h: 0.22, fontSize: 8, color: C.grey, fontFace: FONT_BODY });
  s.addShape(pptx.ShapeType.rect, { x: 5.8, y: 6.85, w: 0.25, h: 0.18, fill: { color: "2E2A1A" } });
  s.addText("Self-hosted runner", { x: 6.1, y: 6.83, w: 2.5, h: 0.22, fontSize: 8, color: C.grey, fontFace: FONT_BODY });
  s.addNotes(`Voici le pipeline complet de 11 jobs organisé en 6 étapes de gauche à droite. Chaque étape doit être complétée avant que la suivante puisse démarrer.

① INSTALL : installation des dépendances — prérequis de tous les autres jobs.

② SECURITY · TESTS — 4 jobs en parallèle :
- sast / npm-audit : analyse statique du code et audit des dépendances JavaScript
- trivy fs-audit : scan du système de fichiers pour les CVE dans les librairies installées
- unit-test : exécution complète de la suite PHPUnit
- e2e-test : tests de bout en bout

③ QUALITY — 2 jobs en parallèle :
- sonar : analyse SonarCloud de la qualité du code et de la dette technique
- k6 smoke-test : test de performance léger pour valider les temps de réponse

④ BUILD : construction de l'image Docker finale. S'exécute exclusivement sur le self-hosted runner.

⑤ SCAN : Trivy scanne l'image Docker construite. Si une CVE critique est trouvée, le déploiement est bloqué.

⑥ DEPLOY — 2 environnements en parallèle :
- staging sur le port 8089 : environnement de recette
- production sur le port 8088 : environnement de production

Les étapes ④ ⑤ ⑥ s'exécutent uniquement sur le self-hosted runner car elles nécessitent l'accès à l'infrastructure locale.`);
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
  s.addText("Formation proposée :", { x: 0.5, y: 6.1, w: 3, h: 0.55, fontSize: 12, bold: true, color: C.gold, fontFace: FONT_BODY });
  s.addText("Certification Kubernetes CKA pour le DevOps — 3 mois · 100% en ligne · Linux Foundation", {
    x: 3.5, y: 6.1, w: 9.4, h: 0.55, fontSize: 12, color: C.white, fontFace: FONT_BODY,
  });
  s.addNotes(`Pour mener ce type de projet, 4 profils complémentaires sont nécessaires.

Lead Developer (×1) : responsable de l'architecture globale, de la mise en place du CI/CD, de la politique de sécurité et de l'approche DevSecOps. C'est le rôle que j'ai endossé sur ce POC. Il est le garant de la cohérence technique.

Dev Backend (×2) : développeurs PHP/Symfony en charge des APIs, des services internes et des tests unitaires. 2 profils car c'est le cœur de l'application — le plus grand volume de code.

Dev Frontend (×1) : développeur JavaScript avec Stimulus et Asset Mapper, en charge de l'interface utilisateur et de l'intégration côté navigateur.

DevOps (×1) : ingénieur infrastructure, responsable de Docker, de la chaîne CI/CD GitHub Actions, et de la future migration vers Kubernetes.

Formation proposée — CKA (Certified Kubernetes Administrator) :
C'est la certification de référence pour l'administration Kubernetes, délivrée par la Linux Foundation. 3 mois de formation entièrement en ligne. Pourquoi cette formation ? Parce que Kubernetes est l'étape suivante pour passer à une vraie scalabilité horizontale — c'est directement dans la roadmap v2 du projet.`);
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
  s.addNotes(`Passons maintenant à la partie réalisation. La question centrale de cette partie : comment a-t-on traduit les besoins métier en code fonctionnel, testé et déployé en production ?

On va voir 4 choses :
- Comment les besoins ont été formalisés avant d'écrire une seule ligne de code — le Backlog et les User Stories
- L'architecture technique retenue et pourquoi — le pattern BFF
- Les expérimentations en bac à sable avant intégration
- Les résultats concrets et les mécanismes qui garantissent la disponibilité`);
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
  s.addNotes(`Avant d'écrire une seule ligne de code, les besoins sont formalisés sous forme de User Stories. C'est un prérequis — ça définit le périmètre fonctionnel et les critères d'acceptance.

US-01 — Profil utilisateur agrégé : le BFF expose un endpoint GET /api/profile/{id} qui agrège les données de plusieurs services internes. Si un service est indisponible, l'API répond avec un statut 206 — Partial Content — plutôt que d'échouer complètement. Le cache de 60 secondes réduit la charge sur les services internes.

US-02 — Authentification Keycloak : mise en place du protocole OAuth2/OIDC avec le flux Authorization Code. Le paramètre 'state' prévient les attaques CSRF. Les informations utilisateur sont transmises via des JWT claims vérifiés côté serveur.

US-03 — Catalogue produits : endpoint public GET /api/products accessible sans authentification. C'est délibéré — la navigation sur le catalogue doit fonctionner sans connexion pour favoriser la conversion.

US-04 — Notifications asynchrones : Symfony Messenger gère les notifications de manière asynchrone. En développement, le transport sync:// est transparent — pas de RabbitMQ à configurer. En production, il bascule sur AMQP sans aucune modification du code applicatif. C'est le concept d'infrastructure transparente.`);
}

// ─── SLIDE 10 — Architecture technique ──────────────────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  compactTitleSlide(s, "ARCHITECTURE TECHNIQUE", "API Gateway / BFF Pattern");

  // Layout horizontal : 5 couches de gauche à droite
  const colW   = 2.0;
  const gapW   = 0.36;
  const xStart = 0.35;
  const xs     = [0, 1, 2, 3, 4].map(i => xStart + i * (colW + gapW));
  const lastW  = 13.33 - xs[4] - 0.30;
  const widths = [colW, colW, colW, colW, lastW];

  const colLabels = ["ENTRÉE", "GATEWAY / BFF", "SERVICES", "APPLICATION", "INFRASTRUCTURE"];
  colLabels.forEach((lbl, i) => {
    s.addText(lbl, {
      x: xs[i], y: 1.30, w: widths[i], h: 0.30,
      fontSize: 8, bold: true, color: C.accent2, fontFace: FONT_BODY,
      align: "center", charSpacing: 1,
    });
    s.addShape(pptx.ShapeType.rect, {
      x: xs[i] + widths[i] / 2 - 0.55, y: 1.60, w: 1.1, h: 0.04,
      fill: { color: C.accent },
    });
  });

  // Col 1 — Entrée : Client + Keycloak
  card(s, xs[0], 2.20, colW, 0.80, "2E1A2E");
  s.addText("CLIENT\n(Navigateur)", {
    x: xs[0], y: 2.20, w: colW, h: 0.80,
    fontSize: 9, bold: true, color: C.white, fontFace: FONT_BODY,
    align: "center", valign: "middle",
  });
  card(s, xs[0], 3.25, colW, 0.80, "2E1A1A");
  s.addText("Keycloak\nOAuth2/OIDC · SSO", {
    x: xs[0], y: 3.25, w: colW, h: 0.80,
    fontSize: 9, color: C.accent2, fontFace: FONT_BODY,
    align: "center", valign: "middle",
  });

  // Col 2 — BFF (boîte haute couvrant la hauteur des 2 éléments de la col 1)
  card(s, xs[1], 2.10, colW, 2.10, "1A1A2E");
  s.addText("API Gateway / BFF\nGET /api/profile/{id}\nCache filesystem 60s\n206 si service KO", {
    x: xs[1], y: 2.10, w: colW, h: 2.10,
    fontSize: 9, color: C.gold, fontFace: FONT_BODY,
    align: "center", valign: "middle",
  });

  // Col 3 — Services internes
  card(s, xs[2], 2.20, colW, 0.85, "1A2E2E");
  s.addText("UserService\n/internal/users", {
    x: xs[2], y: 2.20, w: colW, h: 0.85,
    fontSize: 9, color: C.white, fontFace: FONT_BODY,
    align: "center", valign: "middle",
  });
  card(s, xs[2], 3.30, colW, 0.85, "1A2E2E");
  s.addText("SubscriptionService\n/internal/subscriptions", {
    x: xs[2], y: 3.30, w: colW, h: 0.85,
    fontSize: 9, color: C.white, fontFace: FONT_BODY,
    align: "center", valign: "middle",
  });

  // Col 4 — Application Symfony (boîte haute alignée sur les services)
  card(s, xs[3], 2.10, colW, 2.10, "1A1A1A");
  s.addText("Symfony 6.4 / PHP 8.2\n\nControllers\nMessenger\nSecurity", {
    x: xs[3], y: 2.10, w: colW, h: 2.10,
    fontSize: 9, color: C.white, fontFace: FONT_BODY,
    align: "center", valign: "middle",
  });

  // Col 5 — Infrastructure (3 boîtes empilées)
  [
    ["PostgreSQL · Doctrine",   2.10, "1A2E1A"],
    ["RabbitMQ · AMQP/sync://", 3.10, "2E2A1A"],
    ["Monolog · Logs JSON",     4.10, "1A1A2E"],
  ].forEach(([text, y, color]) => {
    card(s, xs[4], y, lastW, 0.75, color);
    s.addText(text, {
      x: xs[4], y, w: lastW, h: 0.75,
      fontSize: 9, color: C.grey, fontFace: FONT_BODY,
      align: "center", valign: "middle",
    });
  });

  // Flèches horizontales entre colonnes
  const arrowY = 3.05;
  [0, 1, 2, 3].forEach(i => {
    s.addText("→", {
      x: xs[i] + widths[i] + 0.01, y: arrowY - 0.18, w: gapW - 0.02, h: 0.36,
      fontSize: 14, bold: true, color: C.accent, fontFace: FONT_BODY,
      align: "center", valign: "middle",
    });
  });
  s.addNotes(`L'architecture repose sur le pattern BFF — Backend For Frontend. Je vais vous expliquer chaque couche de gauche à droite.

ENTRÉE :
- CLIENT (Navigateur) : le client n'a qu'un seul point d'entrée — il ne connaît pas la structure interne.
- Keycloak : gestionnaire d'identité OAuth2/OIDC — tous les accès protégés passent par lui. L'application Symfony ne gère jamais directement les mots de passe.

GATEWAY / BFF : le cerveau de l'architecture. La requête GET /api/profile/{id} interroge UserService et SubscriptionService, consolide les réponses et sert une réponse unifiée. Le cache filesystem de 60 secondes évite les appels répétés. Si un service est KO, il répond 206 Partial Content.

SERVICES : services internes exposés sur /internal/* — non accessibles depuis l'extérieur, uniquement appelés par le BFF.

APPLICATION : Symfony 6.4 avec Controllers pour les routes, Messenger pour les messages asynchrones, Security pour le contrôle d'accès.

INFRASTRUCTURE :
- PostgreSQL via Doctrine ORM pour la persistance des données
- RabbitMQ pour les messages AMQP en production (sync:// en dev)
- Monolog pour les logs JSON structurés et indexables`);
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
  s.addNotes(`Chaque technologie clé a été expérimentée dans un bac à sable isolé avant toute intégration. L'objectif : valider les choix techniques et détecter les problèmes tôt, pas en production.

BFF ApiAggregator ✅ Validé : la logique d'agrégation multi-services avec cache filesystem fonctionne. Le comportement dégradé est maîtrisé — retour 206 si un service est KO.

Keycloak OAuth2 ✅ Validé : le SSO fonctionne en local. Le flux Authorization Code avec paramètre state anti-CSRF est opérationnel. Les claims JWT sont correctement vérifiés côté application.

Symfony Messenger ✅ Validé : le point clé ici c'est le transport interchangeable. sync:// en dev, AMQP en prod — zéro modification du code applicatif entre les deux. C'est ce que j'appelle l'infrastructure transparente.

GitHub Actions ✅ Validé : le self-hosted runner sous Windows exécute les 11 jobs. Le déploiement automatique vers staging et production fonctionne à chaque push sur la branche main.

Docker / Apache ⚠️ Problème résolu : c'est la difficulté technique principale rencontrée. mod_php sous Apache ne transmet pas automatiquement les variables d'environnement Docker à PHP. La solution : ajouter une directive SetEnv explicite dans la configuration Apache pour chaque variable nécessaire.`);
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
  s.addNotes(`Ces 4 chiffres constituent la preuve concrète de la qualité de la livraison. Ce ne sont pas des estimations — ils sont mesurés automatiquement dans le pipeline CI/CD.

59 tests PHPUnit : suite complète couvrant toutes les User Stories avec 186 assertions individuelles. Zéro échec. Chaque fonctionnalité est vérifiée automatiquement à chaque build.

78,95% couverture de classes : la couverture de classes est l'indicateur le plus pertinent car elle garantit que chaque composant est exercé par un test. 59,11% de lignes est l'indicateur affiché dans la slide ISO 25010 — les deux sont mesurés.

35/35 checks k6 : les 35 scénarios de charge définis dans le script k6 passent tous avec succès. Le 95e percentile des temps de réponse est inférieur à 200ms et le taux d'erreur est de 0%.

0 CVE Critical : Trivy scanne l'image Docker finale construite par le pipeline et ne remonte aucune vulnérabilité critique. C'est le résultat d'un choix d'image de base maintenue et des scans intégrés dès le build.

La barre verte en bas rappelle que tout ça est produit par le pipeline complet — de l'installation jusqu'au déploiement en production.`);
}

// ─── SLIDE 12b — Disponibilité & Montée en charge ───────────────────────────
{
  const s = slide();
  addRedBar(s);
  addBottomBar(s);
  sectionTitle(s, "MISE EN PRODUCTION — DISPONIBILITÉ");
  mainTitle(s, "Orchestrer la production\npour garantir la disponibilité");

  const items = [
    { title: "Restart automatique",      detail: "--restart=unless-stopped\nRedémarrage auto si crash conteneur",   color: "1A2E1A" },
    { title: "Health check /healthy",    detail: "12 tentatives × 5s dans le pipeline\nVérification DB + endpoint Symfony",  color: "1A1A2E" },
    { title: "Persistance des données",  detail: "Volume Docker lpmde_pg_data\nDonnées conservées entre déploiements",  color: "2E2A1A" },
    { title: "Performance validée k6",   detail: "35/35 checks · p95 < 200ms\n0% d'erreurs sous charge simulée",      color: "1A2E2E" },
  ];

  items.forEach(({ title, detail, color }, i) => {
    const x = 0.3 + (i % 2) * 6.6;
    const y = 3.0 + Math.floor(i / 2) * 2.0;
    card(s, x, y, 6.3, 1.75, color);
    s.addText(title, { x: x + 0.15, y: y + 0.12, w: 6.0, h: 0.55, fontSize: 14, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addText(detail, { x: x + 0.15, y: y + 0.72, w: 6.0, h: 0.9, fontSize: 12, color: C.grey, fontFace: FONT_BODY });
  });

  card(s, 0.3, 6.82, 12.8, 0.35, "1A1A1A");
  s.addText("Roadmap scalabilité : Kubernetes (CKA) → Load Balancer → Multi-instances → SLA 99,9%", {
    x: 0.5, y: 6.84, w: 12.4, h: 0.28, fontSize: 10, color: C.gold, fontFace: FONT_BODY,
  });
  s.addNotes(`La disponibilité en production repose sur 4 mécanismes complémentaires — chacun couvre un scénario de défaillance différent.

🔄 Restart automatique — --restart=unless-stopped : si le conteneur crashe pour n'importe quelle raison (erreur applicative, manque mémoire), Docker le redémarre automatiquement. L'application revient en ligne sans intervention humaine. La seule exception : si on l'arrête volontairement (unless-stopped).

🏥 Health check /healthy : le pipeline effectue 12 tentatives espacées de 5 secondes pour vérifier que le conteneur est bien opérationnel avant de déclarer le déploiement réussi. Le endpoint /healthy vérifie deux choses : la connexion à la base de données ET la disponibilité de l'application Symfony.

🗄️ Persistance des données — volume lpmde_pg_data : les données PostgreSQL sont stockées dans un volume Docker nommé qui survit aux redéploiements. Mettre à jour l'application n'efface pas les données — c'est fondamental en production.

⚡ Performance validée k6 : les tests de charge confirment que l'application tient la charge simulée. 35 checks réussis avec un p95 sous 200ms. C'est une validation quantifiée, pas juste une impression.

Roadmap scalabilité : ces mécanismes garantissent la disponibilité sur un seul serveur. La vraie haute disponibilité horizontale — multi-instances, load balancer, SLA 99,9% — nécessite Kubernetes, qui est dans la roadmap v2.`);
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
  s.addNotes(`Passons maintenant à l'analyse de sécurité. Un bon logiciel, c'est aussi un logiciel sécurisé. Le pipeline vérifie qu'il n'y a pas de CVE dans les dépendances, mais ça ne suffit pas — il faut aussi auditer les choix de conception et de configuration.

Dans cette partie, on va voir 3 choses :
- L'audit OWASP Top 10 de la v1 avec les 7 vulnérabilités identifiées
- Le plan de remédiation concret en 3 sprints pour les traiter progressivement
- Les 3 mesures préventives prévues pour la v2 pour passer d'une posture réactive à proactive`);
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
    { id: "V-02", label: "Connexions PostgreSQL sans SSL/TLS",   crit: "HAUTE",    color: C.orange },
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
  s.addNotes(`J'ai audité la v1 selon le référentiel OWASP Top 10. Résultat : 7 vulnérabilités identifiées, classées par criticité.

V-01 — CRITIQUE : access_control en [] en développement. La configuration Symfony désactive le contrôle d'accès en environnement de dev. C'est tolérable localement, mais dangereux si cet environnement est exposé ou si la config est copiée en production par erreur.

V-02 — HAUTE : connexions PostgreSQL sans SSL/TLS. Les communications entre l'application et la base de données ne sont pas chiffrées. Sur un réseau interne cela peut sembler acceptable, mais c'est une non-conformité aux bonnes pratiques de sécurité.

V-03 — CRITIQUE : APP_SECRET potentiellement exposé. Si le fichier .env est accessible publiquement ou versionné dans git, la clé secrète Symfony est compromise — ce qui permet de forger des tokens et des sessions.

V-04 — HAUTE : absence de rate limiting sur /api/*. Aucune protection contre les attaques par force brute, la surcharge intentionnelle ou l'abus de l'API.

V-05 — MOYENNE : headers CSP et HSTS absents. Sans Content Security Policy ni HTTP Strict Transport Security, le navigateur est plus exposé aux attaques XSS et aux connexions non sécurisées.

V-06 — MOYENNE : logs sans anonymisation RGPD. Les logs Monolog peuvent contenir des adresses IP, emails ou autres données personnelles — non conforme au RGPD.

V-07 — BASSE : image Docker php:8.2-apache volumineuse. Une image large augmente inutilement la surface d'attaque potentielle. Migration vers alpine ou distroless recommandée.`);
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
      actions: "• Activer access_control en prod\n• Secrets via GitHub Secrets / Vault\n• Activer SSL/TLS sur PostgreSQL",
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
  s.addNotes(`Le plan est organisé en 3 sprints progressifs selon la criticité — du plus urgent au préventif.

Sprint 1 — Immédiat (vulnérabilités critiques) :
• Activer access_control en production : supprimer ou conditionner le tableau vide [] dans la configuration Symfony Security. Action technique simple, impact immédiat.
• Secrets via GitHub Secrets / Vault : l'APP_SECRET et tous les credentials ne doivent jamais être en clair dans le fichier .env du dépôt. GitHub Secrets est la solution rapide, Vault est la solution robuste pour la v2.
• Activer SSL/TLS sur PostgreSQL : chiffrer les connexions entre l'application et la base de données pour protéger les données en transit.
Impact attendu : les 2 vulnérabilités critiques sont résolues.

Sprint 2 — 1 mois (vulnérabilités hautes) :
• Rate limiting Symfony : utiliser le composant RateLimiter natif de Symfony sur tous les endpoints /api/* pour bloquer les abus.
• Headers CSP / HSTS : configurer Apache ou Symfony pour ajouter systématiquement les headers de sécurité obligatoires à chaque réponse.
• Anonymisation des logs RGPD : masquer les données personnelles dans Monolog via un processeur dédié.
Impact attendu : les vulnérabilités de niveau HAUTE sont résolues.

Sprint 3 — 3 mois (réduction de surface d'attaque) :
• Image Docker alpine ou distroless : réduire l'image à l'essentiel pour minimiser les CVE potentielles.
• WAF en frontal : pare-feu applicatif pour filtrer les requêtes malveillantes avant qu'elles atteignent l'application.
• Audit RGPD complet : revue exhaustive de tous les traitements de données personnelles.
Impact attendu : la surface d'attaque globale est significativement réduite.`);
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
      color: "2E1A1A",
    },
    {
      num: "02",
      title: "DAST Pipeline",
      desc: "OWASP ZAP intégré au job staging\nTest dynamique automatisé\nRapport SARIF → GitHub Security",
      color: "1A1A2E",
    },
    {
      num: "03",
      title: "SCA — Dépendances",
      desc: "Dependabot activé sur composer.json\nAlertes CVE automatiques\nMise à jour PR automatique",
      color: "1A2E1A",
    },
  ];

  measures.forEach(({ num, title, desc, color }, i) => {
    const x = 0.4 + i * 4.3;
    card(s, x, 3.0, 4.0, 4.1, color);
    s.addText(num, { x: x + 0.2, y: 3.1, w: 1.0, h: 0.8, fontSize: 36, bold: true, color: C.accent2, fontFace: FONT_TITLE });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.3, y: 3.9, w: 3.4, h: 0.05, fill: { color: C.accent } });
    s.addText(title, { x: x + 0.2, y: 4.0, w: 3.6, h: 0.55, fontSize: 14, bold: true, color: C.white, fontFace: FONT_BODY });
    s.addText(desc, { x: x + 0.2, y: 4.6, w: 3.6, h: 2.0, fontSize: 12, color: C.grey, fontFace: FONT_BODY });
  });
  s.addNotes(`Pour la v2, la posture de sécurité devient proactive — on anticipe les risques au lieu de les subir.

01 — Secrets Management avec HashiCorp Vault :
Le problème actuel : les secrets sont dans des variables d'environnement. Vault centralise et chiffre tous les secrets dans un coffre-fort dédié. La rotation automatique des clés garantit qu'un secret potentiellement compromis est invalidé sans intervention humaine. L'audit trail enregistre chaque accès pour une traçabilité complète — utile en cas d'incident.

02 — DAST Pipeline avec OWASP ZAP :
Le SAST déjà en place analyse le code statique — il ne voit pas les vulnérabilités qui n'apparaissent qu'à l'exécution. OWASP ZAP s'intègre dans le job de staging et teste l'application en fonctionnement réel : injections, failles d'authentification, expositions de données. Les résultats au format SARIF sont publiés automatiquement dans GitHub Security pour suivi et traçabilité.

03 — SCA avec Dependabot :
Les dépendances déclarées dans composer.json vieillissent et accumulent des CVE. Dependabot surveille en continu toutes les dépendances et ouvre automatiquement des Pull Requests de mise à jour dès qu'une faille est connue. L'équipe n'a plus à surveiller manuellement les bulletins de sécurité — c'est automatisé.`);
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
      title: "Livré",
      items: ["Pipeline CI/CD 11 jobs", "BFF + Keycloak + Messenger", "Déploiement auto self-hosted", "4 livrables documentaires"],
      color: "1A2E1A",
      titleColor: C.green,
    },
    {
      title: "Mesuré",
      items: ["59 tests · 79% coverage", "k6 p95 < 200ms · 0 erreur", "0 CVE Critical (Trivy)", "SonarCloud actif"],
      color: "1A1A2E",
      titleColor: C.gold,
    },
    {
      title: "Perspective v2",
      items: ["RabbitMQ AMQP en production", "WAF + DAST pipeline", "Kubernetes en production", "Espace communautaire"],
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
  s.addNotes(`Pour conclure, voici le bilan de cette mission en 3 dimensions.

✅ Livré :
- Pipeline CI/CD 11 jobs : automatisation complète du build, test, scan de sécurité et déploiement. Chaque push sur main déclenche l'ensemble de la chaîne.
- BFF + Keycloak + Messenger : les 3 composants techniques structurants sont opérationnels et couverts par des tests.
- Déploiement auto self-hosted : staging et production se déploient automatiquement sans intervention manuelle.
- 4 livrables documentaires : les supports de cette présentation constituent la documentation de la mission.

📊 Mesuré :
- 59 tests avec 79% de couverture : une base de tests solide pour maintenir la qualité dans le temps.
- k6 valide p95 < 200ms avec 0% d'erreur : les performances sont prouvées sous charge, pas juste estimées.
- 0 CVE critique sur l'image de production : sécurité mesurée, pas supposée.
- SonarCloud actif pour la surveillance continue de la maintenabilité.

🚀 Perspectives v2 :
- RabbitMQ AMQP en production : le code est déjà prêt, il reste à activer le transport AMQP en production.
- WAF + DAST pipeline : les mesures préventives détaillées dans la diapositive précédente.
- Kubernetes : orchestration multi-instances pour la vraie scalabilité horizontale et le SLA 99,9%.
- Espace communautaire : la fonctionnalité métier prioritaire identifiée pour enrichir la plateforme en v2.`);
}

// ─── SLIDE 18 — Merci ────────────────────────────────────────────────────────
{
  const s = slide({ bg: C.bg });
  s.addText("Merci", {
    x: 0, y: 1.6, w: "100%", h: 3.0,
    fontSize: 96, bold: true, color: C.white, fontFace: FONT_TITLE, align: "center",
  });
  s.addShape(pptx.ShapeType.rect, { x: 1.5, y: 4.9, w: 10.3, h: 0.07, fill: { color: C.accent } });
  s.addNotes(`Voilà, c'est la fin de cette présentation.

Pour récapituler en une phrase : on est partis d'un SI fragmenté, et on livre une plateforme avec un pipeline de 11 jobs, une architecture BFF sécurisée, 59 tests automatisés et une analyse de sécurité complète avec plan d'action.

Je suis disponible pour toutes vos questions — que ce soit sur les choix techniques, l'organisation du pipeline, la sécurité ou les perspectives v2.

N'hésitez pas à demander une démonstration live — les environnements staging sur le port 8089 et production sur le port 8088 sont actifs sur ma machine en ce moment.`);
}

// ─── Génération ───────────────────────────────────────────────────────────────
const outputPath = "presentation-LPMDE.pptx";
await pptx.writeFile({ fileName: outputPath });
console.log(`✅  Fichier généré : ${outputPath}`);
