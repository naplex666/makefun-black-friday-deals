// Filtering and sorting for the deal list. Pure functions, no DOM here.
// state: { q, category, store, minOff, signal, sort }

export const SIGNAL_RANK = { "new-low": 0, strong: 1, unknown: 2, routine: 3 };

export function percentOff(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function categoriesOf(deals) {
  return [...new Set(deals.map((d) => d.category))].sort();
}

export function storesOf(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}

export function statsOf(deals) {
  const total = deals.length;
  const newLows = deals.filter((d) => d.signal === "new-low").length;
  const avgOff = total === 0 ? 0 : Math.round(deals.reduce((s, d) => s + percentOff(d), 0) / total);
  const bestOff = total === 0 ? 0 : Math.max(...deals.map(percentOff));
  return { total, newLows, avgOff, bestOff, stores: storesOf(deals).length };
}

export function applyFilters(deals, state) {
  const q = state.q.trim().toLowerCase();
  let out = deals.filter((d) => {
    if (q !== "" && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (percentOff(d) < state.minOff) return false;
    if (state.signal !== "all" && d.signal !== state.signal) return false;
    return true;
  });
  const by = {
    verdict: (a, b) => SIGNAL_RANK[a.signal] - SIGNAL_RANK[b.signal] || percentOff(b) - percentOff(a),
    discount: (a, b) => percentOff(b) - percentOff(a) || a.price - b.price,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    az: (a, b) => a.title.localeCompare(b.title),
  }[state.sort] || ((a, b) => 0);
  return [...out].sort(by);
}
