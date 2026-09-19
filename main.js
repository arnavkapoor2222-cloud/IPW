/* ============================================================
   India Mint Stamp — site behaviour

   The pages are empty shells. Everything you see is built from
   the JSON files in data/. To change the content, edit those —
   you should rarely need to touch this file.

   NOTE: browsers block reading local files when a page is opened
   by double-clicking it. Always view this site through Live
   Server in VS Code, or a real web host. The pages say so on
   screen if they detect the problem.
   ============================================================ */

(function () {
  "use strict";

  var IMAGE_BASE = "images/";

  /* ---------- Small helpers ---------- */

  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function getJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error(path + " returned " + res.status);
      return res.json();
    });
  }

  function failMessage(err) {
    var local = window.location.protocol === "file:";
    return local
      ? "The data files cannot be read when the page is opened directly. In VS Code, right-click index.html and choose Open with Live Server."
      : "Could not load the data. Check the file name and that the JSON is valid — a missing comma is the usual cause. (" + err.message + ")";
  }

  /* ---------- Footer year ---------- */
  var yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = $("navToggle");
  var nav = $("siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ============================================================
     HOME PAGE — build the catalogue grid from data/sections.json
     Entry counts are read from each section file, so they are
     always right without you maintaining a number by hand.
     ============================================================ */

  var catGrid = $("catGrid");

  if (catGrid) {
    var catStatus = $("catStatus");

    getJSON("data/sections.json")
      .then(function (data) {
        var sections = data.sections || [];
        if (catStatus) catStatus.hidden = true;

        sections.forEach(function (section) {
          var li = el("li", "cat-card");
          var a = el("a");
          a.href = "section.html?s=" + encodeURIComponent(section.slug);

          var count = el("span", "cat-count", "—");
          a.appendChild(count);
          a.appendChild(el("h3", null, section.title));
          a.appendChild(el("p", null, section.blurb || ""));
          li.appendChild(a);
          catGrid.appendChild(li);

          // Fill the count once that section's file loads.
          getJSON("data/" + section.slug + ".json")
            .then(function (sec) {
              var n = (sec.entries || []).length;
              count.textContent = n === 0 ? "Empty for now" : n + (n === 1 ? " entry" : " entries");
            })
            .catch(function () { count.textContent = "Not set up yet"; });
        });
      })
      .catch(function (err) {
        if (catStatus) {
          catStatus.textContent = failMessage(err);
          catStatus.classList.add("is-error");
        }
      });
  }

  /* ============================================================
     SECTION PAGE — build entries from data/<slug>.json
     ============================================================ */

  var grid = $("itemGrid");

  if (grid && $("sectionTitle")) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("s") || "ppc";     // default section if none given
    var statusEl = $("status");
    var entries = [];
    var activeRegion = "all";
    var gallery = [];                         // images of the entry being viewed
    var galleryIndex = 0;

    getJSON("data/" + slug + ".json")
      .then(function (data) {
        entries = data.entries || [];

        document.title = data.title + " — India Mint Stamp";
        $("sectionTitle").textContent = data.title;
        $("crumbTitle").textContent = data.title;
        $("sectionIntro").textContent = data.intro || "";

        if (statusEl) statusEl.hidden = true;

        if (entries.length === 0) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = "Nothing recorded in this section yet. Add entries to data/" + slug + ".json.";
          }
          return;
        }

        buildFilters();
        renderEntries();
        applyFilters();
        $("controls").hidden = false;
      })
      .catch(function (err) {
        if (statusEl) {
          statusEl.textContent = failMessage(err);
          statusEl.classList.add("is-error");
        }
        $("sectionTitle").textContent = "Section not found";
      });

    /* ---- Filter buttons, derived from the regions actually used ---- */
    function buildFilters() {
      var box = $("filters");
      var regions = [];

      entries.forEach(function (e) {
        if (e.region && regions.indexOf(e.region) === -1) regions.push(e.region);
      });

      if (regions.length < 2) return;   // one region only: no point showing filters

      var all = el("button", "chip is-active", "All");
      all.dataset.filter = "all";
      box.appendChild(all);

      regions.sort().forEach(function (region) {
        var chip = el("button", "chip", region.charAt(0).toUpperCase() + region.slice(1));
        chip.dataset.filter = region;
        box.appendChild(chip);
      });

      box.addEventListener("click", function (event) {
        var chip = event.target.closest(".chip");
        if (!chip) return;
        Array.prototype.forEach.call(box.children, function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        activeRegion = chip.dataset.filter;
        applyFilters();
      });
    }

    /* ---- Build one <li> per entry ---- */
    function renderEntries() {
      entries.forEach(function (entry, index) {
        var li = el("li", "item");
        li.dataset.region = entry.region || "";
        li.dataset.index = index;

        /* Thumbnail: first image if there is one, otherwise a blank stamp. */
        var images = entry.images || [];
        var thumb;

        if (images.length) {
          thumb = el("button", "thumb");
          thumb.type = "button";
          var img = document.createElement("img");
          img.src = IMAGE_BASE + images[0].file;
          img.alt = entry.title;
          img.loading = "lazy";            // images load as they scroll into view
          img.decoding = "async";
          thumb.appendChild(img);

          if (images.length > 1) {
            thumb.appendChild(el("span", "thumb-count", "+" + (images.length - 1)));
          }
          thumb.addEventListener("click", function () { openLightbox(index, 0); });
        } else {
          thumb = el("div", "stamp stamp-item");
          var face = el("div", "stamp-face stamp-face-plain");
          face.appendChild(el("span", "stamp-empty", "no image"));
          thumb.appendChild(face);
        }

        li.appendChild(thumb);

        /* Text side */
        var body = el("div", "item-body");
        body.appendChild(el("h2", null, entry.title));

        var specs = entry.specs || {};
        if (Object.keys(specs).length) {
          var dl = el("dl", "specs");
          Object.keys(specs).forEach(function (label) {
            var row = el("div");
            row.appendChild(el("dt", null, label));
            row.appendChild(el("dd", null, specs[label]));
            dl.appendChild(row);
          });
          body.appendChild(dl);
        }

        if (entry.note) body.appendChild(el("p", "item-note", entry.note));
        if (entry.credit) body.appendChild(el("p", "item-credit", "Contributed by " + entry.credit));

        li.appendChild(body);
        grid.appendChild(li);

        // Cache searchable text once.
        li.dataset.haystack = li.textContent.toLowerCase().replace(/\s+/g, " ");
      });
    }

    /* ---- Search and region filtering ---- */
    var search = $("search");
    if (search) search.addEventListener("input", applyFilters);

    function applyFilters() {
      var term = search ? search.value.trim().toLowerCase() : "";
      var items = grid.querySelectorAll(".item");
      var shown = 0;

      Array.prototype.forEach.call(items, function (item) {
        var okRegion = activeRegion === "all" || item.dataset.region === activeRegion;
        var okTerm = term === "" || item.dataset.haystack.indexOf(term) !== -1;
        var visible = okRegion && okTerm;
        item.hidden = !visible;
        if (visible) shown++;
      });

      var count = $("resultCount");
      if (count) {
        count.textContent = shown === items.length
          ? shown + " entries"
          : shown + " of " + items.length + " entries";
      }
      $("emptyState").hidden = shown !== 0;
    }

    /* ---- Lightbox ---- */
    var lightbox = $("lightbox");
    var lbImage = $("lbImage");
    var lbCaption = $("lbCaption");
    var lastFocused = null;

    function openLightbox(entryIndex, imageIndex) {
      gallery = entries[entryIndex].images || [];
      if (!gallery.length) return;
      galleryIndex = imageIndex;
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      showImage();
      $("lbClose").focus();
    }

    function showImage() {
      var image = gallery[galleryIndex];
      lbImage.src = IMAGE_BASE + image.file;
      lbImage.alt = image.caption || "";
      lbCaption.textContent = gallery.length > 1
        ? (image.caption || "") + "  (" + (galleryIndex + 1) + " of " + gallery.length + ")"
        : (image.caption || "");

      var many = gallery.length > 1;
      $("lbPrev").hidden = !many;
      $("lbNext").hidden = !many;
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    function step(delta) {
      galleryIndex = (galleryIndex + delta + gallery.length) % gallery.length;
      showImage();
    }

    $("lbClose").addEventListener("click", closeLightbox);
    $("lbPrev").addEventListener("click", function () { step(-1); });
    $("lbNext").addEventListener("click", function () { step(1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */

  var form = $("contactForm");

  if (form) {
    var hint = $("formHint");
    var INBOX = "indiamintstamp@gmail.com";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var topic = form.topic.value;
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        if (hint) {
          hint.textContent = "Add your name, email and a message, then try again.";
          hint.classList.add("is-error");
        }
        return;
      }

      if (hint) {
        hint.textContent = "Opening your mail app. Attach any scans there.";
        hint.classList.remove("is-error");
      }

      window.location.href =
        "mailto:" + INBOX +
        "?subject=" + encodeURIComponent(topic) +
        "&body=" + encodeURIComponent(message + "\n\n—\n" + name + "\n" + email);
    });
  }
})();
