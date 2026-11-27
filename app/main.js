import { BOARD, DEALS, SIGNAL_ORDER, discountPct, savings } from "./data.js";

const app = document.getElementById("app");
const heroStats = document.getElementById("hero-stats");
const heroChecked = document.getElementById("hero-checked");

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmtMoney(value) {
  return money.format(value);
}

function fmtChecked(iso) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return day + ", " + time + " UTC";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const TILE = {
  "Audio": ["tile-audio", "♪"],
  "TVs & Streaming": ["tile-tv", "▣"],
  "Laptops": ["tile-laptop", "▭"],
  "Gaming": ["tile-gaming", "✚"],
  "Tablets & Reading": ["tile-tablet", "▤"],
  "Phones": ["tile-phone", "▯"],
  "Wearables": ["tile-wearable", "◷"],
  "Kitchen": ["tile-kitchen", "♨"],
  "Home": ["tile-home", "⌂"],
  "Smart Home": ["tile-smart", "◎"],
  "Toys": ["tile-toy", "★"],
  "Fashion": ["tile-fashion", "◆"],
};

const SIGNAL_CLASS = {
  "Record-low claim": "signal-record",
  "Strong cut": "signal-strong",
  "Solid cut": "signal-solid",
  "Routine cut": "signal-routine",
};

const state = {
  query: "",
  category: "all",
  store: "all",
  discount: "0",
  sort: "discount",
};

function uniqueValues(key) {
  return [...new Set(DEALS.map((deal) => deal[key]))].sort((a, b) => a.localeCompare(b));
}

function renderStats() {
  const stores = uniqueValues("store").length;
  const avg = Math.round(DEALS.reduce((sum, deal) => sum + discountPct(deal), 0) / DEALS.length);
  const biggest = Math.max(...DEALS.map((deal) => savings(deal)));
  const strong = DEALS.filter((deal) => SIGNAL_ORDER[deal.signal] <= 1).length;
  heroChecked.textContent = BOARD.checkedLabel;
  heroStats.innerHTML = [
    ["Checked deals", DEALS.length + " <small>on the board</small>"],
    ["Stores covered", stores + " <small>retailers</small>"],
    ["Average discount", avg + "% <small>off usual price</small>"],
    ["Biggest saving", fmtMoney(biggest) + " <small>on one deal</small>"],
    ["Strong or record-low", strong + " <small>deals</small>"],
    ["Categories", uniqueValues("category").length + " <small>aisles</small>"],
  ]
    .map(([label, value]) => '<div class="stat"><dt>' + label + "</dt><dd>" + value + "</dd></div>")
    .join("");
}

function signalBadge(deal) {
  const cls = SIGNAL_CLASS[deal.signal] || "signal-solid";
  return '<span class="signal ' + cls + '">' + escapeHtml(deal.signal) + " · " + discountPct(deal) + "% off</span>";
}

function dealCard(deal) {
  const [tileClass, glyph] = TILE[deal.category] || ["tile-smart", "◎"];
  return (
    '<article class="card">' +
    '<div class="tile ' + tileClass + '">' +
    '<span class="glyph" aria-hidden="true">' + glyph + "</span>" +
    '<span class="tile-cat">' + escapeHtml(deal.category) + "</span>" +
    '<span class="tile-off">-' + discountPct(deal) + "%</span>" +
    "</div>" +
    '<div class="card-body">' +
    '<div class="card-store"><span class="store-name">' + escapeHtml(deal.store) + '</span><span class="card-cat">' + escapeHtml(deal.category) + "</span></div>" +
    '<h3><a href="#/deal/' + deal.id + '">' + escapeHtml(deal.title) + "</a></h3>" +
    '<div class="price-row"><span class="price-now">' + fmtMoney(deal.price) + '</span><span class="price-was">' + fmtMoney(deal.was) + '</span><span class="price-save">Save ' + fmtMoney(savings(deal)) + "</span></div>" +
    signalBadge(deal) +
    '<p class="evidence">' + escapeHtml(deal.evidence) + "</p>" +
    '<div class="meta"><div>Checked <strong>' + fmtChecked(deal.checked) + "</strong></div><div>Read at <strong>" + escapeHtml(deal.source) + "</strong></div></div>" +
    '<div class="card-actions"><a class="btn btn-store" href="' + deal.url + '" target="_blank" rel="noopener noreferrer">View at ' + escapeHtml(deal.store) + '</a><a class="btn btn-detail" href="#/deal/' + deal.id + '">Why this signal</a></div>' +
    "</div></article>"
  );
}

function filteredDeals() {
  const q = state.query.trim().toLowerCase();
  const minOff = Number(state.discount);
  const rows = DEALS.filter((deal) => {
    if (state.category !== "all" && deal.category !== state.category) return false;
    if (state.store !== "all" && deal.store !== state.store) return false;
    if (discountPct(deal) < minOff) return false;
    if (!q) return true;
    const hay = (deal.title + " " + deal.store + " " + deal.category + " " + deal.signal).toLowerCase();
    return hay.includes(q);
  });
  const bySignal = (a, b) =>
    SIGNAL_ORDER[a.signal] - SIGNAL_ORDER[b.signal] || discountPct(b) - discountPct(a) || savings(b) - savings(a);
  if (state.sort === "discount") rows.sort((a, b) => discountPct(b) - discountPct(a) || savings(b) - savings(a));
  else if (state.sort === "savings") rows.sort((a, b) => savings(b) - savings(a));
  else if (state.sort === "price-low") rows.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-high") rows.sort((a, b) => b.price - a.price);
  else rows.sort(bySignal);
  return rows;
}

function optionsHtml(values, selected, allLabel) {
  const head = '<option value="all"' + (selected === "all" ? " selected" : "") + ">" + allLabel + "</option>";
  return head + values.map((v) => '<option value="' + escapeHtml(v) + '"' + (selected === v ? " selected" : "") + ">" + escapeHtml(v) + "</option>").join("");
}

function controlsHtml() {
  return (
    '<section class="controls" aria-label="Search and filters">' +
    '<div class="field"><label for="q">Search deals</label><input id="q" type="search" placeholder="Try Sony, TV, Walmart…" value="' + escapeHtml(state.query) + '"></div>' +
    '<div class="field"><label for="cat">Category</label><select id="cat">' + optionsHtml(uniqueValues("category"), state.category, "All categories") + "</select></div>" +
    '<div class="field"><label for="store">Store</label><select id="store">' + optionsHtml(uniqueValues("store"), state.store, "All stores") + "</select></div>" +
    '<div class="field"><label for="off">Minimum discount</label><select id="off">' +
    [["0", "Any discount"], ["25", "25% or more"], ["40", "40% or more"], ["55", "55% or more"]]
      .map(([v, label]) => '<option value="' + v + '"' + (state.discount === v ? " selected" : "") + ">" + label + "</option>")
      .join("") +
    "</select></div>" +
    '<div class="field"><label for="sort">Sort by</label><select id="sort">' +
    [["signal", "Best signal first"], ["discount", "Discount %"], ["savings", "Dollars saved"], ["price-low", "Price: low to high"], ["price-high", "Price: high to low"]]
      .map(([v, label]) => '<option value="' + v + '"' + (state.sort === v ? " selected" : "") + ">" + label + "</option>")
      .join("") +
    "</select></div>" +
    '<button class="clear-btn" id="clear" type="button">Clear filters</button>' +
    "</section>"
  );
}

function bindControls() {
  const q = document.getElementById("q");
  const cat = document.getElementById("cat");
  const store = document.getElementById("store");
  const off = document.getElementById("off");
  const sort = document.getElementById("sort");
  const clear = document.getElementById("clear");
  if (!q) return;
  q.addEventListener("input", () => { state.query = q.value; renderBoard(false); });
  cat.addEventListener("change", () => { state.category = cat.value; renderBoard(false); });
  store.addEventListener("change", () => { state.store = store.value; renderBoard(false); });
  off.addEventListener("change", () => { state.discount = off.value; renderBoard(false); });
  sort.addEventListener("change", () => { state.sort = sort.value; renderBoard(false); });
  clear.addEventListener("click", () => {
    state.query = ""; state.category = "all"; state.store = "all"; state.discount = "0"; state.sort = "discount";
    renderBoard(true);
  });
}

function renderBoard(rebuildControls) {
  const rows = filteredDeals();
  const grid = rows.length
    ? rows.map(dealCard).join("")
    : '<div class="empty"><h3>No deals match those filters</h3><p>Try a wider discount band or clear the search. Every deal on the board was checked on 27 Nov 2026, so an empty result here means the filters are too narrow, not that the board is empty.</p><button class="clear-btn" id="clear-empty" type="button">Clear filters</button></div>';
  const summary = rows.length + " of " + DEALS.length + " checked deals" +
    (state.category !== "all" ? " in " + state.category : "") +
    (state.store !== "all" ? " at " + state.store : "") +
    (state.query ? ' matching "' + state.query + '"' : "");
  const body =
    '<div class="result-line"><h2>Deal board</h2><p>' + escapeHtml(summary) + " · " + escapeHtml(BOARD.checkedLabel) + "</p></div>" +
    '<section class="grid" aria-live="polite">' + grid + "</section>";
  if (rebuildControls || !document.querySelector(".controls")) {
    app.innerHTML = controlsHtml() + body;
    bindControls();
  } else {
    const oldGrid = document.querySelector(".result-line");
    const wrap = document.createElement("div");
    wrap.innerHTML = body;
    oldGrid.replaceWith(wrap.firstElementChild);
    document.querySelector(".grid").replaceWith(wrap.lastElementChild);
    const q = document.getElementById("q");
    if (document.activeElement !== q) q.value = state.query;
  }
  const emptyBtn = document.getElementById("clear-empty");
  if (emptyBtn) emptyBtn.addEventListener("click", () => {
    state.query = ""; state.category = "all"; state.store = "all"; state.discount = "0"; state.sort = "discount";
    renderBoard(true);
  });
}

function renderPicks() {
  const picks = [...DEALS]
    .sort((a, b) => discountPct(b) - discountPct(a) || savings(b) - savings(a))
    .slice(0, 9);
  const recordLows = DEALS.filter((deal) => deal.signal === "Record-low claim");
  app.innerHTML =
    '<div class="picks-head"><h2>Top picks: steepest verified cuts</h2><p>Ranked by discount against the usual price each source listed, then dollars saved. Every card still carries its signal and evidence, and the board also holds ' +
    recordLows.length + ' source-labelled record lows (' + recordLows.map((d) => escapeHtml(d.title)).join(", ") + '), which rank by their percentage here rather than by the claim alone.</p></div>' +
    '<div class="result-line"><h2>Nine to open first</h2><p>Checked 27 Nov 2026 · confirm at checkout</p></div>' +
    '<section class="grid">' + picks.map(dealCard).join("") + "</section>" +
    '<p style="margin-top:16px"><a class="back-link" href="#/">← Back to the full board</a></p>';
}

function renderHow() {
  app.innerHTML =
    '<div class="picks-head"><h2>How the signal works</h2><p>The signal answers one question: is this really a deal? It is built only from evidence on the card — the usual price the source listed, the discount against it, and any all-time-low claim the source itself made.</p></div>' +
    '<section class="how-grid">' +
    '<div class="how-card"><h3>Record-low claim</h3><p>Used only where the deals source itself said “all-time low”. The percentage can be modest; the claim rests on that source’s price tracking, and the card says so.</p></div>' +
    '<div class="how-card"><h3>Strong cut</h3><p>40% or more below the usual price the source listed. These are the cuts worth opening first, especially when the dollar saving is also large.</p></div>' +
    '<div class="how-card"><h3>Solid cut</h3><p>25–39% below the usual price. A real saving, but worth comparing the same model at a second store before buying.</p></div>' +
    '<div class="how-card"><h3>Routine cut</h3><p>Under 25% below the usual price. Listed for completeness and honest comparison — seasonal sets and running shoes often live here.</p></div>' +
    '<div class="how-card"><h3>Where prices were read</h3><p>Each deal names its source and check time. Sources used on 27 Nov 2026: 9to5Toys, Hunt4Freebies live list, TradingView News roundup, and TechResearchOnline (citing Tom’s Guide and Gizmodo prices).</p></div>' +
    '<div class="how-card"><h3>Known caveats, stated</h3><p>One source cautioned that Amazon raised some Echo, Fire TV and Kindle list prices this year. Cards for those deals repeat the caution and tell you to judge the shelf price, not the headline saving.</p></div>' +
    "</section>" +
    '<p style="margin-top:16px"><a class="back-link" href="#/">← Back to the deal board</a></p>';
}

function renderDetail(id) {
  const deal = DEALS.find((row) => row.id === id);
  if (!deal) {
    app.innerHTML = '<div class="empty"><h3>That deal is not on the board</h3><p>The link may be old. Head back to the board to see every checked deal.</p><a class="btn btn-detail" href="#/">Back to the board</a></div>';
    return;
  }
  const [tileClass, glyph] = TILE[deal.category] || ["tile-smart", "◎"];
  const related = DEALS.filter((row) => row.category === deal.category && row.id !== deal.id).slice(0, 3);
  app.innerHTML =
    '<a class="back-link" href="#/">← Back to the deal board</a>' +
    '<section class="detail">' +
    '<div class="detail-main"><div class="tile ' + tileClass + '"><span class="glyph" aria-hidden="true">' + glyph + '</span><span class="tile-cat">' + escapeHtml(deal.category) + '</span><span class="tile-off">-' + discountPct(deal) + "%</span></div>" +
    '<div class="detail-body"><div class="card-store"><span class="store-name">' + escapeHtml(deal.store) + '</span><span class="card-cat">' + escapeHtml(deal.category) + "</span></div>" +
    "<h2>" + escapeHtml(deal.title) + "</h2>" + signalBadge(deal) +
    '<table class="math-table"><tbody>' +
    "<tr><th>Sale price</th><td>" + fmtMoney(deal.price) + "</td></tr>" +
    "<tr><th>Usual price listed by source</th><td>" + fmtMoney(deal.was) + "</td></tr>" +
    "<tr><th>You save</th><td>" + fmtMoney(savings(deal)) + " (" + discountPct(deal) + "% off)</td></tr>" +
    "<tr><th>Price checked</th><td>" + fmtChecked(deal.checked) + "</td></tr>" +
    "<tr><th>Read at</th><td>" + escapeHtml(deal.source) + "</td></tr>" +
    "</tbody></table>" +
    '<p class="evidence">' + escapeHtml(deal.evidence) + "</p>" +
    "</div></div>" +
    '<aside class="detail-side"><h3>Is it really a deal?</h3><p><strong>' + escapeHtml(deal.signal) + ".</strong> " + escapeHtml(deal.evidence) + "</p>" +
    "<p>Prices move during Black Friday weekend and stock can vanish. Open the store link and confirm the price at checkout; if the store now shows a different price, trust the store.</p>" +
    '<a class="btn btn-store" href="' + deal.url + '" target="_blank" rel="noopener noreferrer">View at ' + escapeHtml(deal.store) + "</a>" +
    (related.length ? "<h3 style='margin-top:22px'>More in " + escapeHtml(deal.category) + "</h3>" + related.map((row) => '<p><a href="#/deal/' + row.id + '">' + escapeHtml(row.title) + "</a> — " + fmtMoney(row.price) + " at " + escapeHtml(row.store) + " (-" + discountPct(row) + "%)</p>").join("") : "") +
    "</aside></section>";
}

function route() {
  const hash = location.hash || "#/";
  const hero = document.querySelector(".hero");
  const onBoard = !(hash.startsWith("#/deal/") || hash === "#/picks" || hash === "#/how");
  if (hero) hero.style.display = onBoard ? "" : "none";
  if (hash.startsWith("#/deal/")) renderDetail(hash.slice("#/deal/".length));
  else if (hash === "#/picks") renderPicks();
  else if (hash === "#/how") renderHow();
  else renderBoard(true);
  window.scrollTo({ top: 0 });
}

renderStats();
window.addEventListener("hashchange", route);
route();
