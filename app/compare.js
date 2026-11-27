// Compare deals side by side. This module owns the picked set (at most three deals), the maths
// (what each deal saves, which one saves the most) and the HTML for the compare bar and the compare
// table. views.js and main.js call into it; it never touches the page itself, so the logic stays
// testable in plain Node. The picked set lives in this module, so it survives the list re-rendering
// after a search or a filter change.

import { percentOff } from "./filters.js";

export const MAX_COMPARE = 3;

const picked = new Set();

export function toggle(id) {
  if (picked.has(id)) {
    picked.delete(id);
    return false;
  }
  if (picked.size >= MAX_COMPARE) return null; // full: the buttons go disabled instead
  picked.add(id);
  return true;
}

export function clear() {
  picked.clear();
}

export function has(id) {
  return picked.has(id);
}

export function count() {
  return picked.size;
}

export function pickedIds() {
  return [...picked];
}

export function pickedDeals(deals) {
  return pickedIds()
    .map((id) => deals.find((d) => d.id === id))
    .filter(Boolean);
}

export function savings(d) {
  return Math.round((d.was - d.price) * 100) / 100;
}

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const escape = (s) => String(s).replace(/[&<>\"']/g, (c) => `&#${c.charCodeAt(0)};`);
const SIGNAL_LABEL = { "new-low": "NEW LOW", strong: "STRONG PRICE", routine: "ROUTINE SALE", unknown: "CHECKED" };
const day = (iso) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) +
  " UTC";

function bestOf(list, key) {
  if (list.length === 0) return null;
  return list.reduce((best, d) => (key(d) > key(best) ? d : best), list[0]).id;
}

// The bar pinned to the bottom of the list page: what is picked, a button to the table, a clear button.
export function barHtml(list) {
  if (list.length === 0) return "";
  const items = list
    .map(
      (d) =>
        `<span class="cmp-pick">${escape(d.title)} <b>${money(d.price)}</b><button type="button" class="cmp-remove" data-remove="${escape(d.id)}" aria-label="Remove ${escape(d.title)} from compare">&times;</button></span>`,
    )
    .join("");
  return `<div class="compare-bar-inner">
    <span class="cmp-label">Compare (${list.length}/${MAX_COMPARE})</span>
    ${items}
    <button type="button" id="compare-go" ${list.length < 2 ? "disabled" : ""}>Compare side by side &rarr;</button>
    <button type="button" id="compare-clear">Clear</button>
  </div>`;
}

// The table: one column per deal, one row per fact, with the best saver and the biggest cut marked.
export function tableHtml(list) {
  if (list.length < 2) {
    return `<h1>Compare deals</h1><p>Pick at least two deals to compare them side by side. Go back to <a href="#/">all deals</a> and press <b>+ Compare</b> on the ones you want.</p>`;
  }
  const bestSave = bestOf(list, savings);
  const bestPct = bestOf(list, percentOff);
  const row = (label, cell) => `<tr><th scope="row">${label}</th>${list.map((d) => `<td>${cell(d)}</td>`).join("")}</tr>`;
  const star = (d, id) => (d.id === id ? ` <span class="best">&#9733; best</span>` : "");
  return `<p><a class="back" href="#/">&larr; All deals</a></p>
<h1>Compare ${list.length} deals</h1>
<p class="lede">The same facts the list shows — sale price, usual price, discount and check time — next to each other, so the better deal is the one you can see.</p>
<div class="compare-wrap"><table class="compare-table">
  <thead><tr><th scope="col"></th>${list.map((d) => `<th scope="col"><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></th>`).join("")}</tr></thead>
  <tbody>
    ${row("Store", (d) => escape(d.store))}
    ${row("Sale price", (d) => `<b>${money(d.price)}</b>`)}
    ${row("Usual price", (d) => `<s>${money(d.was)}</s>`)}
    ${row("Discount", (d) => `<span class="off">${percentOff(d)}% off</span>${star(d, bestPct)}`)}
    ${row("You save", (d) => `<b>${money(savings(d))}</b>${star(d, bestSave)}`)}
    ${row("Signal", (d) => `<span class="badge ${escape(d.signal)}">${SIGNAL_LABEL[d.signal] || "CHECKED"}</span>`)}
    ${row("Checked", (d) => day(d.checked))}
    ${row("At the store", (d) => `<a href="${escape(d.url)}" rel="noopener">At ${escape(d.store)} &nearr;</a>`)}
  </tbody>
</table></div>
<p><button type="button" id="compare-clear-table" class="cmp-btn">Clear comparison</button></p>`;
}
