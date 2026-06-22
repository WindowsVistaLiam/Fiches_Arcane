// TEMPLATE À COPIER DANS window.RP_CHARACTERS DANS assets/js/data.js
{
  id: "nouveau-personnage",
  name: "Nom du personnage",
  shortName: "Prénom",
  subtitle: "Surnom / titre",
  quote: "Citation du personnage.",
  quoteAuthor: "Nom du personnage",
  tagline: "Résumé court affiché sur les cartes.",
  universe: "Arcane / Runeterra",
  region: "Région",
  faction: "Faction / Clan",
  role: "Rôle / Métier",
  status: "Actif",
  accent: "#d6b45f",
  theme: "custom",
  portrait: "assets/images/characters/nouveau-personnage/portrait.png",
  backgroundGif: "assets/images/characters/nouveau-personnage/background.gif",
  backgroundOpacity: 0.14,
  backgroundPosition: "center center",
  tags: ["Tag 1", "Tag 2"],
  meta: [
    { label: "Âge", value: "--" },
    { label: "Origine", value: "--" },
    { label: "Allégeance", value: "--" }
  ],
  sections: [
    { title: "Apparence", type: "paragraphs", content: ["Texte..."] },
    { title: "Caractère", type: "groups", content: [
      { heading: "Sous-partie", text: "Texte..." }
    ]},
    { title: "Compétences", type: "list", content: ["Compétence 1", "Compétence 2"] }
  ]
}
