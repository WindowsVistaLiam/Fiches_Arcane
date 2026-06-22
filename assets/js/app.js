const characters = window.RP_CHARACTERS || [];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugToTitle(id = "") {
  return id.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function initials(name = "?") {
  return name
    .replace(/[’']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "RP";
}

function portraitMarkup(character, size = "large") {
  const label = escapeHTML(character.name);
  const init = escapeHTML(initials(character.name));
  if (character.portrait) {
    return `<div class="portrait ${size}" aria-label="Portrait de ${label}"><img src="${escapeHTML(character.portrait)}" alt="Portrait de ${label}" onerror="this.closest('.portrait').classList.add('image-missing'); this.remove();" /><span>${init}</span></div>`;
  }
  return `<div class="portrait ${size} image-missing" aria-label="Image à ajouter pour ${label}"><span>${init}</span><small>Image à ajouter</small></div>`;
}

function setCharacterBackdrop(character) {
  const explicitImage = character.backgroundGif || character.backgroundImage || character.background || "";
  const fallbackImages = character.id
    ? [
        `assets/images/characters/${character.id}/background.gif`,
        `assets/images/characters/${character.id}/fond.gif`,
        `assets/images/characters/${character.id}/bg.gif`,
        `assets/images/characters/${character.id}/background.webp`,
        `assets/images/characters/${character.id}/fond.webp`,
        `assets/images/characters/${character.id}/background.jpg`,
        `assets/images/characters/${character.id}/fond.jpg`,
        `assets/images/characters/${character.id}/background.png`,
        `assets/images/characters/${character.id}/fond.png`
      ]
    : [];

  const candidates = [...new Set([explicitImage, ...fallbackImages].filter(Boolean))];
  let backdrop = $("#characterBackdrop");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "characterBackdrop";
    backdrop.className = "character-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.innerHTML = `
      <div class="character-backdrop-layer"></div>
      <img class="character-backdrop-probe" alt="" />
    `;
    document.body.prepend(backdrop);
  }

  const layer = $(".character-backdrop-layer", backdrop);
  const probe = $(".character-backdrop-probe", backdrop);

  if (!candidates.length) {
    document.body.classList.remove("has-character-backdrop");
    backdrop.classList.remove("is-loaded", "is-missing");
    if (layer) layer.style.backgroundImage = "";
    if (probe) probe.removeAttribute("src");
    return;
  }

  const opacity = Number.isFinite(Number(character.backgroundOpacity))
    ? Math.min(Math.max(Number(character.backgroundOpacity), 0.04), 0.42)
    : 0.18;

  backdrop.style.setProperty("--backdrop-opacity", String(opacity));
  backdrop.style.setProperty("--backdrop-position", character.backgroundPosition || "center center");
  backdrop.style.setProperty("--backdrop-size", character.backgroundSize || "cover");

  let attempt = 0;

  function applyCandidate(src) {
    if (!src) return;
    const safeSrc = String(src).replaceAll('"', '%22');
    if (layer) layer.style.backgroundImage = `url("${safeSrc}")`;
    document.body.classList.add("has-character-backdrop");
    backdrop.classList.add("is-loaded");
    backdrop.classList.remove("is-missing");

    if (!probe) return;
    probe.onload = () => {
      document.body.classList.add("has-character-backdrop");
      backdrop.classList.add("is-loaded");
      backdrop.classList.remove("is-missing");
      console.info(`[Archives RP] Image de fond chargée pour ${character.id}: ${src}`);
    };
    probe.onerror = () => {
      console.warn(`[Archives RP] Image de fond introuvable pour ${character.id}: ${src}`);
      attempt += 1;
      if (attempt < candidates.length) {
        applyCandidate(candidates[attempt]);
      } else {
        backdrop.classList.add("is-missing");
        console.warn(`[Archives RP] Aucune image de fond trouvée pour ${character.id}. Chemins testés: ${candidates.join(", ")}`);
      }
    };
    probe.src = src;
  }

  applyCandidate(candidates[attempt]);
}

function characterCard(character) {
  const tags = (character.tags || []).slice(0, 4).map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
  return `<article class="character-card glass-card" style="--accent:${escapeHTML(character.accent)}">
    <a class="card-link" href="fiche.html?id=${encodeURIComponent(character.id)}" aria-label="Ouvrir la fiche de ${escapeHTML(character.name)}"></a>
    <div class="card-top">
      ${portraitMarkup(character, "small")}
      <div>
        <p class="eyebrow">${escapeHTML(character.region)} · ${escapeHTML(character.status || "Actif")}</p>
        <h3>${escapeHTML(character.name)}</h3>
        <p class="subtitle-line">${escapeHTML(character.subtitle || character.role || "Fiche RP")}</p>
      </div>
    </div>
    <p>${escapeHTML(character.tagline || "")}</p>
    <div class="tag-row">${tags}</div>
  </article>`;
}

function renderStats() {
  const node = $("#homeStats");
  if (!node) return;
  const regions = new Set(characters.map(c => c.region).filter(Boolean));
  const factions = new Set(characters.map(c => c.faction).filter(Boolean));
  node.innerHTML = `
    <div><strong>${characters.length}</strong><span>fiches</span></div>
    <div><strong>${regions.size}</strong><span>régions</span></div>
    <div><strong>${factions.size}</strong><span>factions</span></div>
  `;
}

function renderFeatured() {
  const node = $("#featuredCharacters");
  if (!node) return;
  node.innerHTML = characters.map(characterCard).join("");
}

function uniqueValues(key) {
  return [...new Set(characters.map(c => c[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
}

function fillSelect(select, values) {
  if (!select) return;
  select.innerHTML = `<option value="">Toutes</option>` + values.map(value => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("");
}

function renderCatalog() {
  const grid = $("#characterGrid");
  if (!grid) return;
  const searchInput = $("#searchInput");
  const regionFilter = $("#regionFilter");
  const factionFilter = $("#factionFilter");
  const reset = $("#resetFilters");
  const count = $("#resultCount");

  fillSelect(regionFilter, uniqueValues("region"));
  fillSelect(factionFilter, uniqueValues("faction"));

  function apply() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const region = regionFilter?.value || "";
    const faction = factionFilter?.value || "";

    const filtered = characters.filter(character => {
      const haystack = [
        character.name, character.subtitle, character.tagline, character.region,
        character.faction, character.role, character.universe, ...(character.tags || [])
      ].join(" ").toLowerCase();
      return (!query || haystack.includes(query))
        && (!region || character.region === region)
        && (!faction || character.faction === faction);
    });

    grid.innerHTML = filtered.length
      ? filtered.map(characterCard).join("")
      : `<div class="empty-state glass-card"><h2>Aucun personnage trouvé</h2><p>Essaie un autre mot-clé ou réinitialise les filtres.</p></div>`;
    if (count) count.textContent = `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}`;
  }

  [searchInput, regionFilter, factionFilter].forEach(input => input?.addEventListener("input", apply));
  reset?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (regionFilter) regionFilter.value = "";
    if (factionFilter) factionFilter.value = "";
    apply();
  });

  apply();
}

function sectionMarkup(section) {
  if (!section || !section.content || !section.content.length) return "";
  let body = "";
  if (section.type === "paragraphs") {
    body = section.content.map(text => `<p>${escapeHTML(text)}</p>`).join("");
  } else if (section.type === "groups") {
    body = section.content.map(item => `<div class="text-group"><h3>${escapeHTML(item.heading)}</h3><p>${escapeHTML(item.text)}</p></div>`).join("");
  } else if (section.type === "list") {
    body = `<ul class="styled-list">${section.content.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
  }
  return `<section class="lore-section glass-card" id="${escapeHTML(section.title.toLowerCase().replaceAll(' ', '-'))}"><h2>${escapeHTML(section.title)}</h2>${body}</section>`;
}

function renderDetail() {
  const root = $("#characterDetail");
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || characters[0]?.id;
  const character = characters.find(c => c.id === id);

  if (!character) {
    document.title = "Fiche introuvable — Archives RP";
    root.className = "container page-enter";
    root.innerHTML = `<section class="empty-state glass-card"><h1>Fiche introuvable</h1><p>Aucun personnage ne correspond à l’identifiant <strong>${escapeHTML(id || "vide")}</strong>.</p><a class="btn primary" href="personnages.html">Retour au catalogue</a></section>`;
    return;
  }

  document.documentElement.style.setProperty("--character-accent", character.accent || "#d6b45f");
  document.title = `${character.name} — Archives RP`;
  setCharacterBackdrop(character);

  const meta = (character.meta || []).map(item => `<div><span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong></div>`).join("");
  const tags = (character.tags || []).map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
  const sections = (character.sections || []).map(sectionMarkup).join("");
  const nav = (character.sections || []).map(section => `<a href="#${escapeHTML(section.title.toLowerCase().replaceAll(' ', '-'))}">${escapeHTML(section.title)}</a>`).join("");

  root.className = "detail-layout container page-enter";
  root.style.setProperty("--accent", character.accent || "#d6b45f");
  root.innerHTML = `
    <section class="detail-hero glass-card">
      <div class="detail-copy">
        <p class="eyebrow">${escapeHTML(character.universe)} · ${escapeHTML(character.region)}</p>
        <h1>${escapeHTML(character.name)}</h1>
        <p class="subtitle">${escapeHTML(character.subtitle || "Fiche RP")}</p>
        <blockquote>“${escapeHTML(character.quote || "") }” <cite>— ${escapeHTML(character.quoteAuthor || character.name)}</cite></blockquote>
        <p class="lead small">${escapeHTML(character.tagline || "")}</p>
        <div class="tag-row">${tags}</div>
      </div>
      <aside class="identity-card">
        ${portraitMarkup(character, "large")}
        <div class="identity-meta">${meta}</div>
      </aside>
    </section>
    <div class="content-layout">
      <aside class="toc glass-card"><strong>Sections</strong>${nav}</aside>
      <div class="sections-stack">${sections}</div>
    </div>
  `;
}

function setupHeader() {
  const button = $(".menu-btn");
  const nav = $(".nav");
  button?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open");
    button.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  const current = location.pathname.split("/").pop() || "index.html";
  $$(".nav a").forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href === current || (current === "" && href === "index.html")) link.classList.add("active");
    if (current === "fiche.html" && href.startsWith("fiche.html")) link.classList.add("active");
  });
}

function setupCursorAura() {
  const aura = document.createElement("div");
  aura.className = "cursor-aura";
  document.body.appendChild(aura);
  let raf = null;
  window.addEventListener("pointermove", event => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      aura.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    });
  });
}

setupHeader();
setupCursorAura();
renderStats();
renderFeatured();
renderCatalog();
renderDetail();
