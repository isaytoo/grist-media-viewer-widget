# 🎬 Grist Media Viewer Widget

> **FR** | [EN](#-grist-media-viewer-widget-1)

---

## 🇫🇷 Grist Media Viewer Widget

Un widget Grist puissant pour visualiser des fichiers multimédias directement dans vos documents : images, PDF, vidéos, fichiers audio et texte.

### ✨ Fonctionnalités

- **🖼️ Images** — Zoom à la molette, déplacement par glisser, rotation gauche/droite, ajustement automatique, mode plein écran
- **📄 PDF** — Affichage intégré via le lecteur natif du navigateur
- **🎬 Vidéo** — Lecteur HTML5 natif (MP4, WebM, OGG, MOV…)
- **🎵 Audio** — Lecteur HTML5 natif (MP3, WAV, AAC, FLAC…)
- **📝 Texte / Code** — Affichage monospace coloré (TXT, JSON, CSV, Markdown…)
- **🗂️ Galerie** — Barre latérale de miniatures si plusieurs URLs sont présentes dans le champ
- **⌨️ Raccourcis clavier** — `←` / `→` navigation, `+` / `-` zoom, `F` plein écran, `Échap` fermer
- **📱 Swipe mobile** — Glisser gauche/droite pour naviguer sur écran tactile
- **⬇️ Téléchargement** — Bouton pour télécharger le fichier affiché
- **🔍 Détection automatique** — Identifie le type de fichier depuis l'extension ou le nom de l'URL

### 📋 Formats supportés

| Type | Extensions |
|------|-----------|
| Image | jpg, jpeg, png, gif, webp, bmp, svg, ico, tiff, avif |
| PDF | pdf |
| Vidéo | mp4, webm, ogg, mov, avi, mkv |
| Audio | mp3, wav, flac, aac, m4a, opus |
| Texte | txt, md, csv, json, xml, yaml, log, js, py, html, css |

### 🚀 Installation

1. Dans votre document Grist, ajoutez une vue **Widget personnalisé**
2. Entrez l'URL du widget : `https://grist-media-viewer.vercel.app`
3. Dans le **Panneau Créateur**, mappez la colonne :
   - **URL du fichier** *(obligatoire)* — colonne contenant l'URL ou les URLs des fichiers
   - **Nom du fichier** *(optionnel)* — colonne contenant le nom d'affichage
4. Sélectionnez une ligne → le fichier s'affiche automatiquement

### 💡 Conseils

- Une cellule peut contenir **plusieurs URLs** séparées par des espaces ou des virgules → la galerie s'active automatiquement
- Les PDFs distants doivent autoriser l'affichage en iframe (`X-Frame-Options`)
- Pour les images privées, l'URL doit être accessible publiquement

### 🛠️ Développement local

```bash
git clone https://github.com/isaytoo/grist-media-viewer-widget.git
cd grist-media-viewer-widget
# Servir avec n'importe quel serveur statique, ex :
npx serve .
```

### 📄 Licence

Apache License 2.0 — © 2026 Said Hamadou (isaytoo)

---

## 🇬🇧 Grist Media Viewer Widget

A powerful Grist widget to display multimedia files directly inside your documents: images, PDFs, videos, audio files, and text.

### ✨ Features

- **🖼️ Images** — Mouse-wheel zoom, drag to pan, left/right rotation, auto-fit, fullscreen mode
- **📄 PDF** — Embedded display via the browser's native PDF reader
- **🎬 Video** — Native HTML5 player (MP4, WebM, OGG, MOV…)
- **🎵 Audio** — Native HTML5 player (MP3, WAV, AAC, FLAC…)
- **📝 Text / Code** — Monospace colored display (TXT, JSON, CSV, Markdown…)
- **🗂️ Gallery** — Thumbnail sidebar when multiple URLs are found in the field
- **⌨️ Keyboard shortcuts** — `←` / `→` navigate, `+` / `-` zoom, `F` fullscreen, `Esc` close
- **📱 Mobile swipe** — Swipe left/right to navigate on touch screens
- **⬇️ Download** — Button to download the currently displayed file
- **🔍 Auto-detection** — Identifies the file type from the URL extension or name

### 📋 Supported Formats

| Type | Extensions |
|------|-----------|
| Image | jpg, jpeg, png, gif, webp, bmp, svg, ico, tiff, avif |
| PDF | pdf |
| Video | mp4, webm, ogg, mov, avi, mkv |
| Audio | mp3, wav, flac, aac, m4a, opus |
| Text | txt, md, csv, json, xml, yaml, log, js, py, html, css |

### 🚀 Installation

1. In your Grist document, add a **Custom Widget** view
2. Enter the widget URL: `https://grist-media-viewer.vercel.app`
3. In the **Creator Panel**, map the columns:
   - **File URL** *(required)* — column containing the file URL(s)
   - **File Name** *(optional)* — column containing the display name
4. Select a row → the file displays automatically

### 💡 Tips

- A single cell can contain **multiple URLs** separated by spaces or commas → the gallery activates automatically
- Remote PDFs must allow iframe embedding (`X-Frame-Options`)
- For private images, the URL must be publicly accessible

### 🛠️ Local Development

```bash
git clone https://github.com/isaytoo/grist-media-viewer-widget.git
cd grist-media-viewer-widget
# Serve with any static server, e.g.:
npx serve .
```

### 📄 License

Apache License 2.0 — © 2026 Said Hamadou (isaytoo)
