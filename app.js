const DATA = window.SAMOS_DATA;
const STORAGE_KEY = "samosPlannerV11";
let state = loadState();
let currentView = "home";
let currentGuide = "food";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { favourites: {}, visited: {}, journal: [], notes: {} };
  } catch {
    return { favourites: {}, visited: {}, journal: [], notes: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector, root = document) { return root.querySelector(selector); }
function $all(selector, root = document) { return [...root.querySelectorAll(selector)]; }
function byId(id) { return DATA.places.find(place => place.id === id); }
function safe(text = "") { return String(text).replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char])); }

function toast(message) {
  const old = $(".toast");
  if (old) old.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function mapLink(url, label = "Google Maps") {
  return `<a class="map-link" href="${url}" target="_blank" rel="noopener">${label}</a>`;
}

function placeCard(place) {
  const fav = !!state.favourites[place.id];
  const visited = !!state.visited[place.id];
  return `
    <article class="card ${fav ? "featured" : ""}">
      <div class="card-top">
        <div>
          <p class="eyebrow">${safe(place.type)} · ${safe(place.area)} · ${safe(place.drive)}</p>
          <h3>${safe(place.name)}</h3>
        </div>
        <button class="icon-btn" data-toggle-fav="${place.id}" aria-label="Toggle favourite">${fav ? "★" : "☆"}</button>
      </div>
      <p>${safe(place.blurb)}</p>
      <p><strong>Tip:</strong> ${safe(place.tip)}</p>
      <div class="chips">${place.tags.map(tag => `<span>${safe(tag)}</span>`).join("")}</div>
      <div class="score-row">
        <div class="score-box"><span>Rocco rating</span>${place.kid}/10</div>
        <div class="score-box"><span>Honeymoon rating</span>${place.romance}/10</div>
      </div>
      <div class="actions">
        ${mapLink(place.maps, "Navigate")}
        <button class="small-btn ${visited ? "visited" : ""}" data-toggle-visited="${place.id}">${visited ? "Visited ✓" : "Mark visited"}</button>
      </div>
    </article>`;
}

function homeView() {
  const favCount = Object.values(state.favourites).filter(Boolean).length;
  const visitedCount = Object.values(state.visited).filter(Boolean).length;
  const near = DATA.places.filter(place => place.tags.includes("nearby")).slice(0, 5);
  return `
    <section>
      <div class="hero-stats">
        <span class="pill">${DATA.places.length} researched places</span>
        <span class="pill sand">${favCount} favourites</span>
        <span class="pill olive">${visitedCount} visited</span>
      </div>
    </section>
    <section class="grid">
      <button class="tile" data-view-link="places"><strong>Explore places</strong><span>Beaches, towns, wine, beer and views</span></button>
      <button class="tile" data-view-link="days"><strong>Complete days</strong><span>Ready made plans from your hotel</span></button>
      <button class="tile" data-random-day><strong>Surprise me</strong><span>A realistic generated day out</span></button>
      <button class="tile" data-view-link="guide"><strong>Food and phrases</strong><span>Menu decoder and useful Greek</span></button>
      <button class="tile" data-view-link="saved"><strong>Saved and journal</strong><span>Favourites, visited places and memories</span></button>
      <button class="tile" data-view-link="practical"><strong>Useful stuff</strong><span>Petrol, pharmacy, supermarket and ATM</span></button>
    </section>
    <section>
      <h2>Best quick wins near Karlovasi</h2>
      <p>Low drive options for arrival day, tired days or when the full island mission feels like too much.</p>
      <div class="cards">${near.map(placeCard).join("")}</div>
    </section>
    <section>
      <h2>Trip notes</h2>
      <div class="cards">${DATA.tips.map(tip => `<article class="card"><p>${safe(tip)}</p></article>`).join("")}</div>
    </section>`;
}

function placesView() {
  const types = ["All", ...new Set(DATA.places.map(place => place.type))];
  return `
    <section>
      <h2>Places</h2>
      <p>Filter by mood, search quickly, then tap Navigate to open Google Maps.</p>
      <div class="search-panel">
        <input id="searchInput" type="search" placeholder="Search beach, wine, Kokkari, family, sunset...">
        <div class="row">
          <select id="typeFilter">${types.map(type => `<option value="${type}">${type}</option>`).join("")}</select>
          <select id="tagFilter">
            <option value="All">All moods</option>
            ${[...new Set(DATA.places.flatMap(place => place.tags))].sort().map(tag => `<option value="${tag}">${tag}</option>`).join("")}
          </select>
        </div>
      </div>
      <div id="placesResults" class="cards"></div>
    </section>`;
}

function renderPlacesResults() {
  const q = $("#searchInput")?.value.toLowerCase() || "";
  const type = $("#typeFilter")?.value || "All";
  const tag = $("#tagFilter")?.value || "All";
  let places = DATA.places.filter(place => {
    const haystack = [place.name, place.type, place.area, place.blurb, place.tip, ...place.tags].join(" ").toLowerCase();
    return (!q || haystack.includes(q)) && (type === "All" || place.type === type) && (tag === "All" || place.tags.includes(tag));
  });
  places.sort((a, b) => (b.kid + b.romance) - (a.kid + a.romance));
  $("#placesResults").innerHTML = places.length ? places.map(placeCard).join("") : `<div class="empty">No matches. Try clearing the filters.</div>`;
}

function daysView() {
  return `
    <section>
      <h2>Complete days out</h2>
      <p>These are not rigid itineraries. They are morning friendly templates for when nobody wants to decide from scratch.</p>
      <div class="cards">
        ${DATA.days.map(day => `
          <article class="card">
            <p class="eyebrow">${safe(day.bestFor)}</p>
            <h3>${safe(day.title)}</h3>
            <p>${safe(day.mood)}</p>
            <ol class="day-plan">${day.plan.map(step => `<li>${safe(step)}</li>`).join("")}</ol>
            <h4>Stops</h4>
            <div class="stop-list">
              ${day.stops.map(id => {
                const place = byId(id);
                return place ? `<a href="${place.maps}" target="_blank" rel="noopener">${safe(place.name)} · ${safe(place.drive)}</a>` : "";
              }).join("")}
            </div>
          </article>`).join("")}
      </div>
    </section>`;
}

function guideView() {
  return `
    <section>
      <h2>Food, drink and Greek</h2>
      <div class="guide-layout">
        <div class="guide-tabs">
          <button data-guide="food">Food decoder</button>
          <button data-guide="drinks">Beer and wine</button>
          <button data-guide="phrases">Greek phrases</button>
          <button data-guide="practical">Practical searches</button>
        </div>
        <div id="guideContent"></div>
      </div>
    </section>`;
}

function renderGuide() {
  $all("[data-guide]").forEach(btn => btn.classList.toggle("active", btn.dataset.guide === currentGuide));
  const box = $("#guideContent");
  if (!box) return;
  if (currentGuide === "food") {
    box.innerHTML = `<div class="cards">${DATA.food.map(item => `
      <article class="card phrase-card">
        <p class="eyebrow">${safe(item.latin)} · ${safe(item.meaning)}</p>
        <h3>${safe(item.greek)}</h3>
        <p>${safe(item.note)}</p>
      </article>`).join("")}</div>`;
  }
  if (currentGuide === "drinks") {
    box.innerHTML = `<div class="cards">${DATA.drinks.map(item => `
      <article class="card">
        <p class="eyebrow">${safe(item.type)}</p>
        <h3>${safe(item.name)}</h3>
        <p><strong>Look for:</strong> ${safe(item.lookFor)}</p>
        <p>${safe(item.note)}</p>
      </article>`).join("")}</div>`;
  }
  if (currentGuide === "phrases") {
    box.innerHTML = `<div class="cards">${DATA.phrases.map(item => `
      <article class="card phrase-card">
        <p class="eyebrow">${safe(item.en)}</p>
        <div class="big-greek">${safe(item.greek)}</div>
        <p class="pronounce">${safe(item.say)}</p>
      </article>`).join("")}</div>`;
  }
  if (currentGuide === "practical") {
    box.innerHTML = `<div class="cards">${DATA.practical.map(item => `
      <article class="card">
        <h3>${safe(item.title)}</h3>
        <p>${safe(item.note)}</p>
        ${mapLink(item.maps, "Open search")}
      </article>`).join("")}</div>`;
  }
}

function savedView() {
  const favs = DATA.places.filter(place => state.favourites[place.id]);
  const visited = DATA.places.filter(place => state.visited[place.id]);
  return `
    <section>
      <h2>Saved, visited and journal</h2>
      <div class="two-col">
        <div>
          <h3>Favourites</h3>
          <div class="cards">${favs.length ? favs.map(placeCard).join("") : `<div class="empty">No favourites yet.</div>`}</div>
        </div>
        <div>
          <h3>Visited</h3>
          <div class="cards">${visited.length ? visited.map(placeCard).join("") : `<div class="empty">No visited places yet.</div>`}</div>
        </div>
      </div>
    </section>
    <section>
      <h2>Holiday journal</h2>
      <div class="card journal-form">
        <input id="journalDate" type="date">
        <input id="journalWhere" placeholder="Where did you go?">
        <input id="journalFood" placeholder="Best food, wine or beer">
        <input id="journalRocco" placeholder="Best Rocco moment">
        <textarea id="journalNotes" placeholder="Other memories"></textarea>
        <button class="primary" data-save-journal>Save memory</button>
      </div>
      <div class="cards" id="journalEntries">${journalCards()}</div>
    </section>`;
}

function journalCards() {
  return state.journal.length ? state.journal.map((entry, index) => `
    <article class="card">
      <p class="eyebrow">${safe(entry.date || "Holiday memory")}</p>
      <h3>${safe(entry.where || "Samos")}</h3>
      <p><strong>Food or drink:</strong> ${safe(entry.food)}</p>
      <p><strong>Rocco:</strong> ${safe(entry.rocco)}</p>
      <p>${safe(entry.notes)}</p>
      <button class="small-btn danger" data-delete-journal="${index}">Delete</button>
    </article>`).join("") : `<div class="empty">No memories saved yet.</div>`;
}

function practicalView() {
  return `
    <section>
      <h2>Useful stuff</h2>
      <p>These are live Google Maps searches because opening hours and nearest options can change.</p>
      <div class="cards">${DATA.practical.map(item => `
        <article class="card">
          <h3>${safe(item.title)}</h3>
          <p>${safe(item.note)}</p>
          ${mapLink(item.maps, "Open in Google Maps")}
        </article>`).join("")}</div>
    </section>`;
}

function randomDay() {
  const family = DATA.places.filter(p => p.kid >= 7);
  const food = DATA.places.filter(p => p.tags.includes("dinner") || p.tags.includes("lunch") || p.type === "Village" || p.type === "Town");
  const beaches = DATA.places.filter(p => p.type === "Beach");
  const culture = DATA.places.filter(p => ["Nature", "History", "Viewpoint", "Wine", "Village"].includes(p.type));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const morning = pick(culture);
  const lunch = pick(food);
  const afternoon = pick(beaches);
  const evening = pick(food.filter(p => p.id !== lunch.id));
  $("#app").innerHTML = `
    <section>
      <h2>Surprise day</h2>
      <p>A realistic generated plan. Regenerate until it fits the mood.</p>
      <div class="card featured">
        <div class="timeline">
          ${[
            ["Morning", morning], ["Lunch", lunch], ["Afternoon", afternoon], ["Evening", evening]
          ].map(([label, place]) => `
            <div class="timeline-item">
              <p class="eyebrow">${label}</p>
              <h3>${safe(place.name)}</h3>
              <p>${safe(place.blurb)}</p>
              ${mapLink(place.maps, "Navigate")}
            </div>`).join("")}
        </div>
        <div class="actions" style="margin-top:1rem"><button class="primary" data-random-day>Generate another</button><button class="ghost" data-view-link="days">See complete days</button></div>
      </div>
    </section>`;
  setActiveNav("");
  window.scrollTo(0, 0);
}

function setActiveNav(view) {
  $all("[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
}

function render(view = currentView) {
  currentView = view;
  const views = { home: homeView, places: placesView, days: daysView, guide: guideView, saved: savedView, practical: practicalView };
  $("#app").innerHTML = views[view] ? views[view]() : homeView();
  setActiveNav(view);
  if (view === "places") {
    renderPlacesResults();
    ["searchInput", "typeFilter", "tagFilter"].forEach(id => $("#" + id).addEventListener("input", renderPlacesResults));
  }
  if (view === "guide") renderGuide();
  window.scrollTo(0, 0);
}

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view], [data-view-link]");
  if (viewButton) render(viewButton.dataset.view || viewButton.dataset.viewLink);

  const fav = event.target.closest("[data-toggle-fav]");
  if (fav) {
    const id = fav.dataset.toggleFav;
    state.favourites[id] = !state.favourites[id];
    saveState();
    toast(state.favourites[id] ? "Added to favourites" : "Removed from favourites");
    render(currentView);
  }

  const visited = event.target.closest("[data-toggle-visited]");
  if (visited) {
    const id = visited.dataset.toggleVisited;
    state.visited[id] = !state.visited[id];
    saveState();
    toast(state.visited[id] ? "Marked visited" : "Marked unvisited");
    render(currentView);
  }

  const guide = event.target.closest("[data-guide]");
  if (guide) {
    currentGuide = guide.dataset.guide;
    renderGuide();
  }

  if (event.target.closest("[data-random-day]")) randomDay();

  if (event.target.closest("[data-save-journal]")) {
    state.journal.unshift({
      date: $("#journalDate").value,
      where: $("#journalWhere").value,
      food: $("#journalFood").value,
      rocco: $("#journalRocco").value,
      notes: $("#journalNotes").value
    });
    saveState();
    toast("Memory saved");
    render("saved");
  }

  const del = event.target.closest("[data-delete-journal]");
  if (del) {
    state.journal.splice(Number(del.dataset.deleteJournal), 1);
    saveState();
    render("saved");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (!$("#app")) return;
  render("home");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
});
