// TrueDeal: a deal finder that runs from static files, no network. Routes on the hash:
//   #/            the list, with search and filters
//   #/new-lows    the list, new lows only
//   #/big         the list, 50%+ off only
//   #/deal/<id>   one deal
//
// window.__shotReady is false while a page renders and true once it is on screen, so a screenshot script knows
// when to capture.

import { deals } from "./data.js";
import { applyFilters, percentOff, SIGNAL_RANK } from "./filters.js";
import { deal, list, missing } from "./views.js";
import { toggle, clear, has, pickedDeals, barHtml, tableHtml, count, MAX_COMPARE } from "./compare.js";

const app = document.getElementById("app");

const state = { q: "", category: "All", store: "All", minOff: 0, signal: "all", sort: "verdict" };

function render() {
  window.__shotReady = false;
  const hash = location.hash || "#/";
  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  if (hash === "#/compare") {
    const picked = pickedDeals(deals);
    document.title = "Compare deals | TrueDeal";
    app.innerHTML = tableHtml(picked);
    document.querySelectorAll(".site-header nav a").forEach((a) => a.classList.remove("active"));
  } else if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = `${found ? found.title : "Not found"} | TrueDeal`;
    if (!found) {
      app.innerHTML = missing();
    } else {
      const related = deals
        .filter((d) => d.category === found.category && d.id !== found.id)
        .sort((a, b) => SIGNAL_RANK[a.signal] - SIGNAL_RANK[b.signal] || percentOff(b) - percentOff(a))
        .slice(0, 3);
      app.innerHTML = deal(found, related);
    }
    document.querySelectorAll(".site-header nav a").forEach((a) => a.classList.remove("active"));
  } else {
    if (hash === "#/new-lows") {
      state.signal = "new-low";
      state.minOff = 0;
    } else if (hash === "#/big") {
      state.signal = "all";
      state.minOff = 50;
    } else {
      state.signal = "all";
      state.minOff = 0;
    }
    document.title = "TrueDeal — Black Friday Deal Finder";
    const shown = applyFilters(deals, state);
    app.innerHTML = list(deals, shown, state);
    document.querySelectorAll(".site-header nav a").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === hash || (hash === "#/" && a.getAttribute("href") === "#/"));
    });
    wireList();
  }
  syncCompare();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function rerenderRows() {
  const shown = applyFilters(deals, state);
  const ul = app.querySelector(".deals");
  const count = app.querySelector(".count");
  if (!ul || !count) return;
  // Re-render only the rows and the count; the filter controls keep their state.
  import("./views.js").then((v) => {
    ul.outerHTML = `<ul class="deals">${v.rows(shown)}</ul>`;
    count.innerHTML = `Showing <b>${shown.length}</b> of ${deals.length} deals`;
  });
}

function wireList() {
  const search = app.querySelector("#q");
  if (search) {
    search.addEventListener("input", () => {
      state.q = search.value;
      rerenderRows();
    });
  }
  const store = app.querySelector("#store");
  if (store) store.addEventListener("change", () => {
    state.store = store.value;
    rerenderRows();
  });
  const minoff = app.querySelector("#minoff");
  if (minoff) minoff.addEventListener("change", () => {
    state.minOff = Number(minoff.value);
    rerenderRows();
  });
  const sort = app.querySelector("#sort");
  if (sort) sort.addEventListener("change", () => {
    state.sort = sort.value;
    rerenderRows();
  });
  app.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.cat;
      app.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      rerenderRows();
    });
  });
}

// The compare bar lives on the list page and the compare buttons live on every row and detail page.
// One delegated listener on #app survives re-renders, so the buttons keep working after a search or
// filter change; syncCompare fills the bar and keeps every button's label and state honest.
function syncCompare() {
  const bar = app.querySelector("#compare-bar");
  if (bar) bar.innerHTML = barHtml(pickedDeals(deals));
  // The bar is sticky at the top of the list, and the list gets bottom padding
  // as tall as the bar while it is open, so no deal row ever sits under it.
  document.body.classList.toggle("compare-open", count() > 0);
  app.querySelectorAll(".cmp-btn").forEach((b) => {
    if (!b.dataset.id) return;
    const on = has(b.dataset.id);
    b.setAttribute("aria-pressed", String(on));
    b.textContent = on ? "✓ Compared" : "+ Compare";
    b.disabled = !on && count() >= MAX_COMPARE;
  });
}

app.addEventListener("click", (event) => {
  const btn = event.target.closest(".cmp-btn");
  if (btn && btn.dataset.id) {
    toggle(btn.dataset.id);
    syncCompare();
    return;
  }
  const remove = event.target.closest(".cmp-remove");
  if (remove) {
    toggle(remove.dataset.remove);
    syncCompare();
    return;
  }
  if (event.target.closest("#compare-go")) {
    location.hash = "#/compare";
    return;
  }
  if (event.target.closest("#compare-clear") || event.target.closest("#compare-clear-table")) {
    clear();
    if ((location.hash || "") === "#/compare") render();
    else syncCompare();
  }
});

window.addEventListener("hashchange", render);
render();
