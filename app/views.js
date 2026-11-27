// HTML for each page, built from the deal data. Every value is escaped before it goes into the page.
import { percentOff, categoriesOf, storesOf, statsOf } from "./filters.js";
import { has as isPicked, count as pickedCount, MAX_COMPARE } from "./compare.js";

const escape = (s) => String(s).replace(/[&<>\"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const day = (iso) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) + " UTC";

const SIGNAL_LABEL = { "new-low": "NEW LOW", strong: "STRONG PRICE", routine: "ROUTINE SALE", unknown: "CHECKED" };
const badge = (signal) => `<span class="badge ${escape(signal)}">${SIGNAL_LABEL[signal] || "CHECKED"}</span>`;

export function filterBar(deals, state) {
  const cats = categoriesOf(deals);
  const stores = storesOf(deals);
  const chips = ["All", ...cats]
    .map(
      (c) =>
        `<button type="button" class="chip" data-cat="${escape(c)}" aria-pressed="${state.category === c}">${escape(c)}</button>`,
    )
    .join("");
  const storeOpts = ["All", ...stores]
    .map((s) => `<option value="${escape(s)}"${state.store === s ? " selected" : ""}>${escape(s)}</option>`)
    .join("");
  const offOpts = [0, 30, 40, 50]
    .map((n) => `<option value="${n}"${state.minOff === n ? " selected" : ""}>${n === 0 ? "Any discount" : n + "%+ off"}</option>`)
    .join("");
  const sortOpts = [
    ["verdict", "Best verdict first"],
    ["discount", "Biggest discount"],
    ["price-asc", "Lowest price"],
    ["price-desc", "Highest price"],
    ["az", "Name A–Z"],
  ]
    .map(([v, l]) => `<option value="${v}"${state.sort === v ? " selected" : ""}>${l}</option>`)
    .join("");
  return `<div class="filters">
    <div class="row">
      <input type="search" id="q" placeholder="Search deals, stores, categories…" value="${escape(state.q)}" aria-label="Search deals">
      <label>Store <select id="store">${storeOpts}</select></label>
      <label>Discount <select id="minoff">${offOpts}</select></label>
      <label>Sort <select id="sort">${sortOpts}</select></label>
    </div>
    <div class="chips" role="group" aria-label="Category">${chips}</div>
  </div>`;
}

export function rows(shown) {
  if (shown.length === 0) return `<li class="empty">No deal matches. Try a different search or filter.</li>`;
  return shown
    .map(
      (d) => `<li>
  <div>
    <div class="deal-title"><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></div>
    <div class="deal-meta">${escape(d.store)} &middot; ${escape(d.category)} &middot; <span class="checked">checked ${day(d.checked)}</span></div>
  </div>
  <div>${badge(d.signal)}</div>
  <div class="price"><span class="sale">${usd(d.price)}</span><br><span class="was"><s>${usd(d.was)}</s> <span class="off">${percentOff(d)}% off</span></span></div>
  <div class="deal-links"><a href="#/deal/${encodeURIComponent(d.id)}">Details &rarr;</a><a href="${escape(d.url)}" rel="noopener">At ${escape(d.store)} &nearr;</a><button type="button" class="cmp-btn" data-id="${escape(d.id)}" aria-pressed="${isPicked(d.id)}"${!isPicked(d.id) && pickedCount() >= MAX_COMPARE ? " disabled" : ""}>${isPicked(d.id) ? "✓ Compared" : "+ Compare"}</button></div>
</li>`,
    )
    .join("");
}

export function list(deals, shown, state) {
  const s = statsOf(deals);
  return `<h1>Black Friday deals, checked today</h1>
<p class="lede"><strong>${s.total} deals</strong> found and price-checked on Nov 27, 2026 &mdash; every one with its store, sale price, usual price and check time. The signal on each deal says honestly whether it is really a deal.</p>
<div class="stats">
  <div class="stat"><b>${s.total}</b><span>deals checked</span></div>
  <div class="stat"><b>${s.newLows}</b><span>new lows</span></div>
  <div class="stat"><b>${s.avgOff}%</b><span>average discount</span></div>
  <div class="stat"><b>${s.bestOff}%</b><span>biggest cut</span></div>
</div>
${filterBar(deals, state)}
<p class="count">Showing <b>${shown.length}</b> of ${deals.length} deals</p>
<div id="compare-bar"></div>
<ul class="deals">${rows(shown)}</ul>`;
}

export function deal(d, related) {
  const rel =
    related.length === 0
      ? ""
      : `<div class="related"><h2>More ${escape(d.category)} deals</h2><ul>${related
          .map(
            (r) =>
              `<li><a href="#/deal/${encodeURIComponent(r.id)}">${escape(r.title)}</a> &mdash; ${usd(r.price)} <s>${usd(r.was)}</s> (${percentOff(r)}% off) at ${escape(r.store)}</li>`,
          )
          .join("")}</ul></div>`;
  return `<p><a class="back" href="#/">&larr; All deals</a></p>
<div class="detail">
  <h1>${escape(d.title)}</h1>
  <p>${escape(d.store)} &middot; ${escape(d.category)}</p>
  <p class="price-line"><span class="sale">${usd(d.price)}</span> <s>${usd(d.was)}</s> &mdash; <span class="off">${percentOff(d)}% off</span></p>
  <div class="verdict ${escape(d.signal)}">${badge(d.signal)}<p>${escape(d.signalNote)}</p></div>
  <dl class="facts">
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)} (${percentOff(d)}% off)</dd>
    <dt>Checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd><a href="${escape(d.sourceUrl)}" rel="noopener">${escape(d.source)}</a></dd>
  </dl>
  <p><a class="store-btn" href="${escape(d.url)}" rel="noopener">Find it at ${escape(d.store)} &nearr;</a></p>
  <p><button type="button" class="cmp-btn" data-id="${escape(d.id)}" aria-pressed="${isPicked(d.id)}">${isPicked(d.id) ? "✓ Compared" : "+ Compare"}</button> <span class="cmp-hint">Add it to a side-by-side comparison with up to two other deals.</span></p>
  <p style="color:#5d6470;font-size:14px">Price read ${day(d.checked)}. Prices change fast on Black Friday &mdash; the store page is the final word.</p>
</div>
${rel}`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
