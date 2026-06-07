const D = window.SAMOS_DATA;
const state = {
  view: "home",
  placeFilter: "top",
  guideTab: "dishes",
  phraseCat: "all",
  query: "",
  userLocation: JSON.parse(localStorage.getItem("samosUserLocation") || "null"),
  saved: JSON.parse(localStorage.getItem("samosV12Saved") || "{}")
};

const $ = sel => document.querySelector(sel);
const app = () => $("#app");
const save = () => localStorage.setItem("samosV12Saved", JSON.stringify(state.saved));
const saveLocation = () => localStorage.setItem("samosUserLocation", JSON.stringify(state.userLocation));
const escapeHtml = str => String(str || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const slugText = str => String(str || "").toLowerCase();

function stored(group, key) {
  return Boolean(state.saved[group] && state.saved[group][key]);
}

function toggle(group, key) {
  state.saved[group] = state.saved[group] || {};
  state.saved[group][key] = !state.saved[group][key];
  save();
  render();
}

function kmBetween(a, b) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function miles(km) { return km * 0.621371; }
function distanceLabel(place) {
  if (!state.userLocation) return null;
  const km = kmBetween(state.userLocation, place);
  return `${miles(km).toFixed(km < 16 ? 1 : 0)} miles away`;
}
function hotelDistance(place) {
  const km = kmBetween(D.hotel, place);
  return `${miles(km).toFixed(km < 16 ? 1 : 0)} miles from hotel`;
}

function mapsLink(place) {
  return place.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " Samos")}`;
}

function translateLink(phrase) {
  return `https://translate.google.com/?sl=en&tl=el&text=${encodeURIComponent(phrase.en)}&op=translate`;
}

function bg(url) {
  return `style="background-image: linear-gradient(135deg, rgba(8,78,86,.15), rgba(199,104,66,.12)), url('${url}')"`;
}

function placeById(id) { return D.places.find(p => p.id === id); }

function placeCard(place, compact = false) {
  const fav = stored("favourites", place.id);
  const visited = stored("visited", place.id);
  const near = distanceLabel(place);
  return `
    <article class="card place-card">
      <div class="card-image" ${bg(place.image)}>
        <div class="badge-row">
          ${place.top ? `<span class="badge">Top 15</span>` : ""}
          <span class="badge">${escapeHtml(place.category)}</span>
          ${near ? `<span class="badge">${near}</span>` : `<span class="badge">${hotelDistance(place)}</span>`}
        </div>
      </div>
      <div class="card-body">
        <div class="card-topline">
          <div>
            <p class="eyebrow">${escapeHtml(place.area)}</p>
            <h3>${escapeHtml(place.name)}</h3>
          </div>
          <button class="icon-btn" onclick="toggle('favourites','${place.id}')" aria-label="Favourite">${fav ? "★" : "☆"}</button>
        </div>
        <p>${escapeHtml(place.summary)}</p>
        ${compact ? "" : `
          <div class="meta-row">
            <span class="meta">Kid ${place.kid}/10</span>
            <span class="meta">Honeymoon ${place.romance}/10</span>
            <span class="meta">${escapeHtml(place.driveFromHotel)}</span>
          </div>
          <div class="tag-row">${place.bestFor.slice(0, 4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        `}
        <div class="card-actions">
          <button class="primary-btn" onclick="openPlace('${place.id}')">Details</button>
          <a class="map-btn" href="${mapsLink(place)}" target="_blank" rel="noopener">Maps</a>
          <button class="secondary-btn" onclick="toggle('visited','${place.id}')">${visited ? "Visited ✓" : "Visited"}</button>
        </div>
      </div>
    </article>
  `;
}

function drawerShell() {
  if (!$("#drawerBackdrop")) {
    document.body.insertAdjacentHTML("beforeend", `<div id="drawerBackdrop" class="drawer-backdrop" onclick="closePlace()"></div><aside id="drawer" class="drawer"></aside>`);
  }
}

function openPlace(id) {
  drawerShell();
  const p = placeById(id);
  if (!p) return;
  const near = distanceLabel(p);
  $("#drawer").innerHTML = `
    <div class="close-row"><button class="ghost-btn" onclick="closePlace()">Close</button></div>
    <div class="drawer-image" ${bg(p.image)}></div>
    <p class="eyebrow">${escapeHtml(p.area)} · ${escapeHtml(p.category)}</p>
    <h2>${escapeHtml(p.name)}</h2>
    <p>${escapeHtml(p.summary)}</p>
    <div class="detail-grid">
      <div class="detail-box"><small>From you</small><strong>${near || "Tap Use my location"}</strong></div>
      <div class="detail-box"><small>From hotel</small><strong>${escapeHtml(p.driveFromHotel)}</strong></div>
      <div class="detail-box"><small>Kid score</small><strong>${p.kid}/10</strong></div>
      <div class="detail-box"><small>Honeymoon score</small><strong>${p.romance}/10</strong></div>
    </div>
    <h3>Best for</h3>
    <div class="tag-row">${p.bestFor.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
    <h3 style="margin-top:18px">Facilities and notes</h3>
    <ul>${p.facilities.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    <h3>Avoid if</h3>
    <p>${escapeHtml(p.avoidIf)}</p>
    <h3>Pair this with</h3>
    <div class="tag-row">${p.pairWith.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
    <div class="card-actions" style="margin-top:18px">
      <a class="map-btn" href="${mapsLink(p)}" target="_blank" rel="noopener">Open in Google Maps</a>
      <button class="secondary-btn" onclick="toggle('favourites','${p.id}')">${stored("favourites", p.id) ? "Favourite ★" : "Add favourite"}</button>
      <button class="secondary-btn" onclick="toggle('visited','${p.id}')">${stored("visited", p.id) ? "Visited ✓" : "Mark visited"}</button>
    </div>
  `;
  $("#drawer").classList.add("open");
  $("#drawerBackdrop").classList.add("open");
}
function closePlace() {
  $("#drawer")?.classList.remove("open");
  $("#drawerBackdrop")?.classList.remove("open");
}

function getPlaces() {
  let places = [...D.places];
  if (state.placeFilter === "top") places = places.filter(p => p.top);
  else if (state.placeFilter === "near") {
    if (state.userLocation) places.sort((a,b) => kmBetween(state.userLocation, a) - kmBetween(state.userLocation, b));
  } else if (state.placeFilter !== "all") places = places.filter(p => p.category === state.placeFilter || p.tags.includes(state.placeFilter));

  if (state.query.trim()) {
    const q = slugText(state.query);
    places = places.filter(p => slugText([p.name, p.area, p.category, p.summary, p.tags.join(" "), p.bestFor.join(" ")].join(" ")).includes(q));
  }
  if (state.placeFilter === "near" && !state.userLocation) places = places.slice(0, 0);
  return places;
}

function renderHome() {
  const hero = D.heroImages[Math.floor(new Date().getDate() % D.heroImages.length)];
  const top = D.places.filter(p => p.top).slice(0, 6);
  const favCount = Object.values(state.saved.favourites || {}).filter(Boolean).length;
  const visitedCount = Object.values(state.saved.visited || {}).filter(Boolean).length;
  return `
    <section class="hero" style="--hero-image: linear-gradient(135deg, rgba(8,78,86,.35), rgba(199,104,66,.22)), url('${hero}')">
      <div class="hero-content">
        <p class="eyebrow">Honeymoon mode · Family friendly · Car hire ready</p>
        <h1>What should we do today?</h1>
        <p>Choose a mood, find what is nearby, open directions, save favourites and keep a tiny holiday journal.</p>
        <div class="hero-actions">
          <button class="primary-btn" onclick="randomPlan()">Surprise me</button>
          <button class="secondary-btn" onclick="setView('places','near')">Near me now</button>
          <a class="ghost-btn" href="${D.hotel.maps}" target="_blank" rel="noopener">Hotel map</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="mood-grid">
        ${moodButton("😴", "Easy day", "Low driving, no pressure", "easy")}
        ${moodButton("🏖️", "Beach day", "Sea, swim, simple food", "beach")}
        ${moodButton("👨‍👩‍👦", "Rocco friendly", "Shallow, easy, flexible", "family")}
        ${moodButton("❤️", "Honeymoon mood", "Views, dinner, wine", "romantic")}
        ${moodButton("🍺", "Beer mission", "Find local beer", "beer")}
        ${moodButton("🍷", "Wine day", "Muscat, villages, views", "wine")}
      </div>
    </section>

    <section class="section">
      <div class="stats-grid">
        <div class="stat-card"><strong>${D.places.length}</strong><small>Island places</small></div>
        <div class="stat-card"><strong>${favCount}</strong><small>Favourites</small></div>
        <div class="stat-card"><strong>${visitedCount}</strong><small>Visited</small></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>Top 15 shortlist</h2><p>The places most likely to earn a slot in a one week trip.</p></div><button class="ghost-btn" onclick="setView('places','top')">View all</button></div>
      <div class="cards">${top.map(p => placeCard(p, true)).join("")}</div>
    </section>
  `;
}

function moodButton(emoji, title, small, mood) {
  return `<button class="mood-card" onclick="planForMood('${mood}')"><span class="emoji">${emoji}</span><strong>${title}</strong><small>${small}</small></button>`;
}

function planForMood(mood) {
  const plan = D.dayPlans.find(p => p.mood === mood) || D.dayPlans[0];
  renderPlan(plan);
}
function randomPlan() {
  renderPlan(D.dayPlans[Math.floor(Math.random() * D.dayPlans.length)]);
}
function renderPlan(plan) {
  state.view = "plan";
  setActiveNav("home");
  const stops = plan.placeIds.map(placeById).filter(Boolean);
  app().innerHTML = `
    <section class="section" style="margin-top:0">
      <button class="ghost-btn" onclick="setView('home')">Back</button>
      <div class="hero" style="margin-top:14px; min-height:320px; ${stops[0] ? `--hero-image: linear-gradient(135deg, rgba(8,78,86,.45), rgba(199,104,66,.2)), url('${stops[0].image}')` : ""}">
        <div class="hero-content"><p class="eyebrow">Suggested day</p><h1>${escapeHtml(plan.title)}</h1><p>${escapeHtml(plan.subtitle)}</p></div>
      </div>
      <div class="timeline">
        ${plan.steps.map(s => `<div class="timeline-step"><div class="timeline-time">${s[0]}</div><div class="timeline-content">${escapeHtml(s[1])}</div></div>`).join("")}
      </div>
      <div class="section-head" style="margin-top:26px"><div><h2>Stops</h2><p>Open directions as you go.</p></div><button class="primary-btn" onclick="randomPlan()">Another idea</button></div>
      <div class="cards">${stops.map(p => placeCard(p, true)).join("")}</div>
    </section>
  `;
  window.scrollTo(0,0);
}

function renderPlaces() {
  const categories = [
    ["top", "Top 15"], ["near", "Near me"], ["all", "All"], ["beach", "Beaches"], ["beer", "Beer"], ["wine", "Wine"], ["food", "Food"], ["village", "Villages"], ["history", "History"], ["viewpoint", "Views"], ["practical", "Useful"]
  ];
  const places = getPlaces();
  return `
    <section class="section" style="margin-top:0">
      <div class="section-head"><div><h2>Places</h2><p>Top 15 for decision making, big list for finding what is near.</p></div></div>
      <div class="toolbar">
        <input class="search" placeholder="Search beaches, beer, Muscat, Rocco, villages..." value="${escapeHtml(state.query)}" oninput="state.query=this.value; render()">
        <select onchange="state.placeFilter=this.value; render()">${categories.map(c => `<option value="${c[0]}" ${state.placeFilter === c[0] ? "selected" : ""}>${c[1]}</option>`).join("")}</select>
        <button class="secondary-btn" onclick="useMyLocation()">Use my location</button>
      </div>
      <div class="filter-scroll">${categories.map(c => `<button class="chip-btn ${state.placeFilter === c[0] ? "active" : ""}" onclick="state.placeFilter='${c[0]}'; render()">${c[1]}</button>`).join("")}</div>
      ${state.placeFilter === "near" && !state.userLocation ? `<div class="empty">Tap Use my location to sort by what is nearest right now.</div>` : ""}
      <div class="cards">${places.map(p => placeCard(p)).join("")}</div>
      ${places.length === 0 && !(state.placeFilter === "near" && !state.userLocation) ? `<div class="empty">No matches. Try a broader search.</div>` : ""}
    </section>
  `;
}

function renderGuide() {
  const tabs = [["dishes", "Samos dishes"], ["common", "Menu words"], ["wine", "Wine"], ["beer", "Beer"]];
  const items = D.guide[state.guideTab] || [];
  return `
    <section class="section" style="margin-top:0">
      <div class="section-head"><div><h2>Local guide</h2><p>Dishes, menu names, beer and wine words to recognise.</p></div></div>
      <div class="filter-scroll">${tabs.map(t => `<button class="chip-btn ${state.guideTab === t[0] ? "active" : ""}" onclick="state.guideTab='${t[0]}'; render()">${t[1]}</button>`).join("")}</div>
      <div class="guide-grid">
        ${items.map(item => `
          <article class="card guide-card">
            <p class="eyebrow">${escapeHtml(item.name || item.say || "Menu word")}</p>
            <h3>${escapeHtml(item.greek || item.term)}</h3>
            <p><strong>${escapeHtml(item.meaning)}</strong></p>
            ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPhrases() {
  const cats = ["all", ...new Set(D.phrases.map(p => p.cat))];
  let phrases = D.phrases;
  if (state.phraseCat !== "all") phrases = phrases.filter(p => p.cat === state.phraseCat);
  if (state.query.trim()) {
    const q = slugText(state.query);
    phrases = phrases.filter(p => slugText(`${p.cat} ${p.en} ${p.greek} ${p.say}`).includes(q));
  }
  return `
    <section class="section" style="margin-top:0">
      <div class="section-head"><div><h2>Greek phrasebook</h2><p>Search by English, Greek, topic or pronunciation. Each phrase opens in Google Translate.</p></div></div>
      <div class="toolbar">
        <input class="search" placeholder="Search bill, petrol, pharmacy, toilet, wine..." value="${escapeHtml(state.query)}" oninput="state.query=this.value; render()">
        <select onchange="state.phraseCat=this.value; render()">${cats.map(c => `<option value="${c}" ${state.phraseCat === c ? "selected" : ""}>${c === "all" ? "All categories" : c}</option>`).join("")}</select>
        <button class="secondary-btn" onclick="state.query=''; state.phraseCat='all'; render()">Reset</button>
      </div>
      <div class="cards">
        ${phrases.map(p => `
          <article class="card card-body phrase-card">
            <p class="eyebrow">${escapeHtml(p.cat)}</p>
            <h3>${escapeHtml(p.en)}</h3>
            <div class="greek">${escapeHtml(p.greek)}</div>
            <div class="phonetic">${escapeHtml(p.say)}</div>
            <div class="card-actions">
              <button class="secondary-btn" onclick="copyText('${escapeHtml(p.greek).replace(/'/g,"\\'")}')">Copy Greek</button>
              <a class="map-btn" href="${translateLink(p)}" target="_blank" rel="noopener">Google Translate</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSaved() {
  const favourites = D.places.filter(p => stored("favourites", p.id));
  const visited = D.places.filter(p => stored("visited", p.id));
  const journal = state.saved.journal || [];
  return `
    <section class="section" style="margin-top:0">
      <div class="section-head"><div><h2>Saved and journal</h2><p>Stored only in this browser on this device.</p></div></div>
      <div class="feature-grid">
        <button class="feature-card" onclick="state.savedTab='fav'; renderSavedTab('fav')"><span class="emoji">★</span><strong>Favourites</strong><small>${favourites.length} saved</small></button>
        <button class="feature-card" onclick="state.savedTab='visited'; renderSavedTab('visited')"><span class="emoji">✓</span><strong>Visited</strong><small>${visited.length} places</small></button>
        <button class="feature-card" onclick="renderJournalForm()"><span class="emoji">📓</span><strong>Journal</strong><small>${journal.length} memories</small></button>
        <button class="feature-card" onclick="exportJournal()"><span class="emoji">⬇</span><strong>Export</strong><small>Copy memories</small></button>
      </div>
      <div id="savedPanel" class="section">${savedPanelMarkup(favourites, visited, journal)}</div>
    </section>
  `;
}
function savedPanelMarkup(favourites, visited, journal) {
  if (favourites.length) return `<h2>Favourites</h2><div class="cards">${favourites.map(p => placeCard(p, true)).join("")}</div>`;
  if (visited.length) return `<h2>Visited</h2><div class="cards">${visited.map(p => placeCard(p, true)).join("")}</div>`;
  return `<div class="empty">No favourites yet. Start with the Top 15 shortlist.</div>`;
}
function renderSavedTab(tab) {
  const favourites = D.places.filter(p => stored("favourites", p.id));
  const visited = D.places.filter(p => stored("visited", p.id));
  $("#savedPanel").innerHTML = tab === "fav"
    ? `<h2>Favourites</h2>${favourites.length ? `<div class="cards">${favourites.map(p => placeCard(p, true)).join("")}</div>` : `<div class="empty">No favourites yet.</div>`}`
    : `<h2>Visited</h2>${visited.length ? `<div class="cards">${visited.map(p => placeCard(p, true)).join("")}</div>` : `<div class="empty">No visited places yet.</div>`}`;
}
function renderJournalForm() {
  const journal = state.saved.journal || [];
  $("#savedPanel").innerHTML = `
    <h2>Holiday journal</h2>
    <div class="card card-body">
      <input id="jDate" type="date">
      <input id="jWhere" placeholder="Where did you go?">
      <input id="jFood" placeholder="Best food, beer or wine">
      <input id="jRocco" placeholder="Best Rocco moment">
      <textarea id="jNotes" placeholder="Anything worth remembering"></textarea>
      <button class="primary-btn" onclick="saveJournal()">Save memory</button>
    </div>
    <div class="journal-list">${journal.map((j, i) => journalCard(j, i)).join("") || `<div class="empty">No memories saved yet.</div>`}</div>
  `;
}
function journalCard(j, i) {
  return `<article class="card card-body"><p class="eyebrow">${escapeHtml(j.date || "Holiday memory")}</p><h3>${escapeHtml(j.where || "Samos")}</h3><p><strong>Food or drink:</strong> ${escapeHtml(j.food)}</p><p><strong>Rocco:</strong> ${escapeHtml(j.rocco)}</p><p>${escapeHtml(j.notes)}</p><button class="secondary-btn" onclick="deleteJournal(${i})">Delete</button></article>`;
}
function saveJournal() {
  const entry = { date: $("#jDate").value, where: $("#jWhere").value, food: $("#jFood").value, rocco: $("#jRocco").value, notes: $("#jNotes").value };
  state.saved.journal = state.saved.journal || [];
  state.saved.journal.unshift(entry);
  save();
  renderJournalForm();
}
function deleteJournal(i) {
  state.saved.journal.splice(i, 1);
  save();
  renderJournalForm();
}
function exportJournal() {
  const text = (state.saved.journal || []).map(j => `${j.date || "Date"}\n${j.where || "Samos"}\nFood or drink: ${j.food || ""}\nRocco: ${j.rocco || ""}\n${j.notes || ""}`).join("\n\n---\n\n");
  navigator.clipboard?.writeText(text || "No journal entries yet.");
  alert("Journal copied to clipboard.");
}

function useMyLocation() {
  if (!navigator.geolocation) return alert("Location is not available in this browser.");
  $("#locationButton").textContent = "Finding...";
  navigator.geolocation.getCurrentPosition(pos => {
    state.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    saveLocation();
    $("#locationButton").textContent = "Location on";
    state.placeFilter = state.view === "places" ? "near" : state.placeFilter;
    render();
  }, () => {
    $("#locationButton").textContent = "Use my location";
    alert("Location permission was not granted.");
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

function setView(view, filter) {
  state.view = view;
  state.query = view === "phrases" || view === "places" ? state.query : "";
  if (filter) state.placeFilter = filter;
  setActiveNav(view === "plan" ? "home" : view);
  render();
  window.scrollTo(0, 0);
}
function setActiveNav(view) {
  document.querySelectorAll("[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
}
function render() {
  closePlace();
  if (state.view === "home") app().innerHTML = renderHome();
  if (state.view === "places") app().innerHTML = renderPlaces();
  if (state.view === "guide") app().innerHTML = renderGuide();
  if (state.view === "phrases") app().innerHTML = renderPhrases();
  if (state.view === "saved") app().innerHTML = renderSaved();
  setActiveNav(state.view);
}

window.toggle = toggle;
window.openPlace = openPlace;
window.closePlace = closePlace;
window.setView = setView;
window.randomPlan = randomPlan;
window.planForMood = planForMood;
window.useMyLocation = useMyLocation;
window.copyText = copyText;
window.render = render;
window.renderSavedTab = renderSavedTab;
window.renderJournalForm = renderJournalForm;
window.saveJournal = saveJournal;
window.deleteJournal = deleteJournal;
window.exportJournal = exportJournal;
window.state = state;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));
  $("#locationButton").addEventListener("click", useMyLocation);
  if (state.userLocation) $("#locationButton").textContent = "Location on";
  render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(() => {});
});
