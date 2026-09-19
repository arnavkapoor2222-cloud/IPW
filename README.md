# India Mint Stamp

A reference catalogue of Indian philately. Plain HTML, CSS and JavaScript — no build
step, no framework, no dependencies. Content lives in JSON files under `data/`, so
adding an entry means editing data, never markup.

---

## Two rules that will save you an hour each

**1. View the site through Live Server, never by double-clicking a file.**
Browsers block a page opened from `file://` from reading local data files, so the
catalogue comes up empty. In VS Code: right-click `index.html` → *Open with Live
Server*. The pages say so on screen if you get it wrong.

**2. Never commit original scans.** `.gitignore` already excludes an `originals/`
folder and TIFF files. GitHub rejects files over 100 MB and slows badly with large
binaries. Only web-sized JPEGs belong in `images/`.

---

## Getting it onto GitHub

The gentlest route is **GitHub Desktop** (desktop.github.com) — no terminal needed.

1. Install it, sign in.
2. *File → Add local repository* → pick this folder → it offers to create a
   repository, accept.
3. Name it `india-mint-stamp`. Leave it **Public** if you want free GitHub Pages
   hosting.
4. Type a summary like "Initial site" and press **Commit to main**.
5. Press **Publish repository**.

If you prefer the command line, in VS Code's terminal (`Ctrl+\``):

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/india-mint-stamp.git
git push -u origin main
```

### Turning on GitHub Pages

In the repository on github.com: **Settings → Pages → Source: Deploy from a branch →
Branch: `main`, folder: `/ (root)` → Save.**

A minute later the site is live at
`https://YOUR-USERNAME.github.io/india-mint-stamp/`. Every push updates it. A custom
domain can be pointed at it later from the same settings page.

`.nojekyll` is included so GitHub serves the files as-is rather than running Jekyll
over them.

### The daily loop from then on

Edit in VS Code → save → check in Live Server → in GitHub Desktop, write a one-line
summary → **Commit** → **Push origin**. Live in about a minute.

Commit often. Each commit is a restore point, which matters once you have hundreds of
entries.

---

## Files

```
india-mint-stamp/
├── index.html        Home. Catalogue grid builds itself from data/sections.json
├── section.html      One page that renders ANY section, chosen by the URL
├── about.html
├── contact.html
├── 404.html          Shown by GitHub Pages for bad links
├── favicon.svg       The little stamp in the browser tab
├── css/style.css     All styling, in 12 numbered sections
├── js/main.js        Data loading, rendering, search, filters, lightbox
├── data/
│   ├── sections.json The sections shown on the home page
│   ├── ppc.json      One file per section, holding its entries
│   └── …             fdc, flight, msfdc, gandhi150, autographed, gitag, meghdoot, fpo
├── images/
│   ├── ppc/          One folder per section
│   └── fdc/
├── .gitignore
├── .nojekyll
└── robots.txt
```

There is only **one** section page. `section.html?s=ppc` loads `data/ppc.json`;
`section.html?s=fdc` loads `data/fdc.json`. You never create another HTML file — you
create a JSON file and list it in `sections.json`.

---

## Adding an entry

Open the section's file in `data/`, copy an existing entry block, paste it after the
last one, and **mind the comma between blocks**. That comma is the commonest mistake;
VS Code underlines it in red when it's wrong.

```json
{
  "id": "ppc-thanjavur-1997",
  "title": "Brihadeeswarar Temple",
  "region": "south",
  "specs": {
    "Office": "Thanjavur HO",
    "In use from": "14 Apr 1997",
    "Depicts": "Vimana of the Chola temple"
  },
  "note": "Struck in black; a violet strike is recorded from 2003.",
  "credit": "",
  "images": [
    { "file": "ppc/thanjavur-1997-cover.jpg", "caption": "Full cover, black strike" },
    { "file": "ppc/thanjavur-1997-strike.jpg", "caption": "Detail of the cancellation" }
  ]
}
```

| Field | Effect |
|---|---|
| `id` | Your reference. Use it as the image filename too. |
| `title` | Heading on the entry. |
| `region` | Drives the filter buttons — they build themselves from the values you use, so a new region appears on its own. Omit it to skip filtering. |
| `specs` | Any labels on the left, values on the right. Not a fixed set. |
| `note` | Free text under the specs. |
| `credit` | Shows "Contributed by …". Leave empty for your own material. |
| `images` | As many as you like. First is the thumbnail, the rest open in the lightbox. An empty list `[]` shows a blank stamp, so entries work before you have photographed them. |

**Adding a section:** create `data/yourslug.json` (copy the shape of an empty one),
then add a block for it in `data/sections.json`. It appears on the home page with its
entry count filled in automatically.

---

## Preparing images

### Capture
A **flatbed scanner at 300 dpi** beats a phone for covers every time — no shadow, no
distortion, consistent colour. Scan to TIFF or top-quality JPEG and keep those
originals outside the repo.

Phone as fallback: daylight near a window, no flash, phone held parallel to the cover,
cropped tight afterwards.

### Resize before anything goes in `images/`
An untouched scan is 5–20 MB. Shrink to **1600 px on the long edge, JPEG at 80%** —
most covers land at 200–400 KB with no visible loss on screen.

**IrfanView** (free, Windows) does a whole folder at once:
`File → Batch Conversion`, output JPEG, `Advanced → Resize → Long side 1600`, run.
**XnConvert** works the same way.

The site loads images lazily as you scroll, so long sections stay fast.

### Naming
Lowercase, hyphens, no spaces, no `&` or brackets:

```
ppc/thanjavur-1997-cover.jpg
```

Windows tolerates spaces; web servers turn them into `%20` and it becomes a mess.
Match the filename to the entry's `id` and you'll never lose track of which scan
belongs where.

---

## Changing the look

Every colour is a variable at the top of `css/style.css` under `:root`. Change
`--carmine` and the accent updates across all pages. Typefaces are set in the same
block and loaded by the `<link>` in each page's `<head>`.

---

## Before going live

Replace the placeholder copy, the email address in `contact.html` and `js/main.js`,
and the footer copyright. The example entries in `data/ppc.json` are invented —
delete them once your own are in.
