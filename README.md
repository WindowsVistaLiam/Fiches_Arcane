# Archives RP

Site statique HTML / CSS / JavaScript pour centraliser des fiches RP.

## Contenu actuel

- Ron Ironheart
- Lady Leona Ryse
- Sasha El’yâh / Sasha Arcane
- Shin Wanheda

Sasha Solsa n’est pas intégrée comme fiche : elle a seulement servi de référence visuelle/template.

## Ouvrir le site

Ouvre `index.html` dans un navigateur.

## Structure

```txt
rp-archive-site/
├─ index.html
├─ personnages.html
├─ fiche.html
├─ assets/
│  ├─ css/style.css
│  ├─ js/data.js
│  ├─ js/app.js
│  └─ images/characters/
```

## Ajouter une nouvelle fiche

1. Ouvre `assets/js/data.js`.
2. Copie un bloc personnage existant.
3. Donne un `id` unique, par exemple `nouveau-personnage`.
4. Remplis les champs `name`, `subtitle`, `meta`, `tags` et `sections`.
5. Ajoute les images dans `assets/images/characters/nouveau-personnage/`.
6. Si tu ajoutes un portrait, remplis le champ :

```js
portrait: "assets/images/characters/nouveau-personnage/portrait.png"
```

7. Si tu veux une image animée discrète en arrière-plan de la fiche, ajoute un GIF dans le dossier du personnage puis remplis :

```js
backgroundGif: "assets/images/characters/nouveau-personnage/background.gif",
backgroundOpacity: 0.14,
backgroundPosition: "center center"
```

`backgroundOpacity` accepte une valeur entre `0.04` et `0.28`. La valeur conseillée est entre `0.10` et `0.16` pour que l’image reste présente sans gêner la lecture.

Les pages `index.html`, `personnages.html` et `fiche.html?id=...` se mettent à jour automatiquement depuis `data.js`.

## Hébergement

Le site est compatible avec GitHub Pages, Railway, Netlify, Vercel ou n’importe quel hébergement de fichiers statiques.

## Images animées de fond

Sur chaque fiche, tu peux renseigner :

```js
"backgroundGif": "assets/images/characters/sasha-arcane/background.gif",
"backgroundOpacity": 0.18,
"backgroundPosition": "center center",
"backgroundSize": "cover"
```

Important : le nom du fichier est sensible à la casse sur GitHub / Railway.
`background.gif`, `Background.gif` et `background.GIF` sont trois noms différents.

Si une image ne s'affiche pas, ouvre la console du navigateur : le site affiche maintenant un avertissement du type `Image de fond introuvable` avec le chemin testé.

## Image/GIF de fond dans une fiche

Chaque fiche peut afficher un fond animé discret. Dans `assets/js/data.js`, ajoute ou modifie ces champs dans le personnage :

```js
"backgroundGif": "assets/images/characters/sasha-arcane/background.gif",
"backgroundOpacity": 0.18,
"backgroundPosition": "center center"
```

Le script teste aussi automatiquement ces noms dans le dossier du personnage : `background.gif`, `fond.gif`, `bg.gif`, `background.webp`, `fond.webp`, `background.jpg`, `fond.jpg`, `background.png`, `fond.png`.

Pour Sasha, les chemins valides par défaut sont donc par exemple :

```txt
assets/images/characters/sasha-arcane/background.gif
assets/images/characters/sasha-arcane/fond.gif
```

Sur GitHub/Railway, les majuscules comptent : `fond.gif` et `Fond.gif` sont différents.
