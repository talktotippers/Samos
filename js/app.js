(() => {
  const DATA = window.SAMOS_DATA;
  const STORE_KEY = "samosTripV14";
  const state = {
    view: "today",
    filter: "top",
    foodFilter: "all",
    guideQuery: "",
    location: null,
    familyMode: JSON.parse(localStorage.getItem(STORE_KEY) || "{}").familyMode || false,
    store: JSON.parse(localStorage.getItem(STORE_KEY) || "{}")
  };

  const $ = selector => document.querySelector(selector);
  const app = () => $("#app");

  function save() {
    state.store.familyMode = state.familyMode;
    localStorage.setItem(STORE_KEY, JSON.stringify(state.store));
  }

  function bucket(name) {
    state.store[name] = state.store[name] || {};
    return state.store[name];
  }

  function isOn(group, id) {
    return !!bucket(group)[id];
  }

  function toggle(group, id) {
    const b = bucket(group);
    b[id] = !b[id];
    save();
    toast(b[id] ? "Saved" : "Removed");
    render();
  }

  function toast(message) {
    const old = $(".toast");
    if (old) old.remove();
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  function stars(n) {
    return `<span class="stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
  }

  function maps(url, label = "Open Maps") {
    return `<a class="map" href="${url}" target="_blank" rel="noopener">${label}</a>`;
  }

  function img(item) {
    const safe = (item.name || item.label || "Samos").replace(/"/g, "");
    return `<div class="photo"><img src="${item.image}" alt="${safe}" loading="lazy" onerror="this.parentNode.innerHTML='<div style=&quot;width:100%;height:100%;display:grid;place-items:center;font-size:58px;background:#e7f2ef&quot;>${item.fallback || "🌊"}</div>'"><span class="badge">${item.type || item.area || "Samos"}</span></div>`;
  }

  function distanceMiles(a, b) {
    if (!a || !b.lat || !b.lng) return null;
    const R = 3958.8;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function distanceLabel(place) {
    const miles = distanceMiles(state.location, place);
    if (!miles) return place.hotel;
    return `${miles.toFixed(miles < 10 ? 1 : 0)} miles away`;
  }

  function card(place, compact = false) {
    const fav = isOn("favourites", place.id);
    const visited = isOn("visited", place.id);
    return `
      <article class="card place-card">
        <div class="photo">
          <img src="${place.image}" alt="${place.name}" loading="lazy" onerror="this.parentNode.innerHTML='<div style=&quot;width:100%;height:100%;display:grid;place-items:center;font-size:58px;background:#e7f2ef&quot;>${place.fallback || "🌊"}</div>'">
          <span class="badge">${place.area}</span>
          <button class="fav" onclick="SamosApp.toggle('favourites','${place.id}')">${fav ? "★" : "☆"}</button>
        </div>
        <div class="place-body">
          <p class="eyebrow">${place.type}</p>
          <h3>${place.name}</h3>
          <p>${place.short}</p>
          <div class="meta">
            <span>${distanceLabel(place)}</span>
            ${place.tags.slice(0, compact ? 2 : 4).map(t => `<span>${t}</span>`).join("")}
          </div>
          ${compact ? "" : `<div class="scoreline"><div class="scorebox"><b>${place.worth}/5</b>Worth it</div><div class="scorebox"><b>${place.family}/5</b>Family</div><div class="scorebox"><b>${place.romance}/5</b>Romance</div></div>`}
          ${compact ? "" : `<p class="muted"><strong>Pair with:</strong> ${place.pair.join(", ")}</p><p><strong>My note:</strong> ${place.note}</p>`}
          <div class="actions">
            ${maps(place.maps)}
            <button class="ghost" onclick="SamosApp.toggle('visited','${place.id}')">${visited ? "Done ✓" : "Tick off"}</button>
          </div>
        </div>
      </article>`;
  }

  function eatCard(e) {
    const done = isOn("eaten", e.id);
    return `<article class="card place-card">${img(e)}<div class="place-body"><p class="eyebrow">${e.type} · ${e.area}</p><h3>${e.name}</h3><p>${e.short}</p><div class="meta">${e.bestFor.map(x => `<span>${x}</span>`).join("")}</div><p><strong>Order:</strong> ${e.order.join(", ")}</p><div class="scoreline"><div class="scorebox"><b>${e.family}/5</b>Family</div><div class="scorebox"><b>${e.romance}/5</b>Romance</div><div class="scorebox"><b>${e.beer}/5</b>Beer</div></div><div class="actions">${maps(e.maps)}<button class="ghost" onclick="SamosApp.toggle('eaten','${e.id}')">${done ? "Done ✓" : "Ate here"}</button></div></div></article>`;
  }

  function dishCard(d) {
    const tried = isOn("tried", d.id);
    return `<article class="card card-pad dish-card"><div class="photo"><img src="${d.image}" alt="${d.name}" loading="lazy" onerror="this.parentNode.innerHTML='<div style=&quot;width:100%;height:100%;display:grid;place-items:center;font-size:42px;background:#e7f2ef&quot;>🍽️</div>'"></div><div><p class="eyebrow">${d.name}</p><div class="greek">${d.greek}</div><p><strong>${d.pronounce}</strong></p><p>${d.short}</p><p class="muted">${d.look}</p><p>Worth ordering ${stars(d.worth)}</p><button class="ghost" onclick="SamosApp.toggle('tried','${d.id}')">${tried ? "Tried ✓" : "Tick off"}</button></div></article>`;
  }

  function setView(view) {
    state.view = view;
    render();
    window.scrollTo(0, 0);
  }

  function pageShell(title, intro, body) {
    return `<section class="section"><div class="section-head"><div><p class="eyebrow">Our Samos Trip</p><h1>${title}</h1><p class="muted">${intro}</p></div></div>${body}</section>`;
  }

  function today() {
    const recs = smartRecs();
    return `
      <section class="hero">
        <p class="eyebrow">Not a travel guide. Our trip companion.</p>
        <h1>What shall we do today?</h1>
        <p>Pick a mood, find food, see what is nearby, tick off the good stuff and build the story as you go.</p>
        <div class="hero-actions"><button class="primary" onclick="SamosApp.planDay('easy')">Easy day</button><button class="primary" onclick="SamosApp.planDay('food')">Food day</button><button class="primary" onclick="SamosApp.planDay('family')">Family day</button><button class="map" onclick="SamosApp.setView('nearby')">Near me</button></div>
      </section>
      <section class="section">
        <div class="section-head"><div><p class="eyebrow">Today ideas</p><h2>Good choices now</h2></div><button class="ghost" onclick="SamosApp.planDay('surprise')">Surprise me</button></div>
        <div class="place-grid">${recs.map(p => card(p, true)).join("")}</div>
      </section>
      <section class="section grid">
        <button class="card tile" onclick="SamosApp.setView('food')"><span class="emoji">🍽️</span><strong>Eat and Drink</strong><span>Breakfast, lunch, dinner, cafés, beer, wine and what to order.</span></button>
        <button class="card tile" onclick="SamosApp.setView('explore')"><span class="emoji">🗺️</span><strong>Explore</strong><span>Top 15 and the full island list.</span></button>
        <button class="card tile" onclick="SamosApp.setView('guide')"><span class="emoji">🇬🇷</span><strong>Greek Guide</strong><span>Food words, menu decoder and phrasebook.</span></button>
      </section>
      <section id="dayResult" class="section"></section>`;
  }

  function smartRecs() {
    let list = DATA.places.filter(p => p.top && !isOn("visited", p.id));
    if (state.familyMode) list = list.filter(p => p.rocco || p.family >= 4);
    return list.sort((a, b) => (b.worth + b.family + b.food) - (a.worth + a.family + a.food)).slice(0, 3);
  }

  function planDay(mode) {
    let pool = DATA.places.filter(p => !isOn("visited", p.id));
    if (mode === "easy") pool = pool.filter(p => p.tags.includes("near hotel") || p.hotel.includes("10"));
    if (mode === "food") pool = pool.filter(p => p.food >= 4);
    if (mode === "family") pool = pool.filter(p => p.rocco || p.family >= 4);
    if (!pool.length) pool = DATA.places;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const main = pick(pool);
    const pairNames = main.pair || [];
    const pair = DATA.places.find(p => pairNames.includes(p.name)) || pick(DATA.places.filter(p => p.id !== main.id));
    const lunch = DATA.eateries.find(e => e.area === main.area || e.short.toLowerCase().includes(main.area.toLowerCase())) || pick(DATA.eateries);
    const html = `<div class="planner-box"><p class="eyebrow">Generated idea</p><h2>${main.name} day</h2><div class="timeline"><div><strong>Morning</strong><br>${main.name}<br>${maps(main.maps)}</div><div><strong>Lunch</strong><br>${lunch.name}<br>${maps(lunch.maps)}</div><div><strong>Afternoon</strong><br>${pair.name}<br>${maps(pair.maps)}</div><div><strong>Why this works</strong><br>${main.note}</div></div></div>`;
    const target = $("#dayResult");
    if (target) target.innerHTML = html;
    else app().innerHTML = pageShell("Today plan", "A generated day idea.", html);
  }

  function food() {
    const meal = state.foodFilter;
    const eateries = meal === "all" ? DATA.eateries : DATA.eateries.filter(e => e.meal.includes(meal));
    const filters = ["all", "breakfast", "lunch", "dinner", "drinks"];
    return pageShell("Eat and Drink", "The most important bit. Breakfast, lunch, dinner, cafés, tavernas, beer, wine and what to order.", `
      <div class="filters">${filters.map(f => `<button class="${meal === f ? "active" : ""}" onclick="SamosApp.foodFilter('${f}')">${f}</button>`).join("")}</div>
      <div class="section"><h2>Best for ${meal === "all" ? "everything" : meal}</h2><div class="place-grid">${eateries.map(eatCard).join("")}</div></div>
      <div class="section"><h2>What to eat and drink</h2><div class="place-grid">${DATA.dishes.map(dishCard).join("")}</div></div>`);
  }

  function nearby() {
    const sorted = [...DATA.places].sort((a, b) => (distanceMiles(state.location, a) || 999) - (distanceMiles(state.location, b) || 999));
    const cats = [
      ["Closest beach", "🏖️", p => p.type === "Beach"],
      ["Closest food", "🍽️", p => p.food >= 4],
      ["Closest beer", "🍺", p => p.beer],
      ["Closest wine", "🍷", p => p.wine],
      ["Closest family activity", "👨‍👩‍👦", p => p.rocco],
      ["Closest viewpoint", "🌅", p => p.type === "View" || p.tags.includes("views")]
    ];
    return pageShell("Near Me", "Use your location to sort the island around where you are. Plus quick family essentials for a nearly four year old.", `
      <div class="row"><button class="primary" onclick="SamosApp.useLocation()">Use my location</button><span class="muted">${state.location ? "Location active" : "Location not active yet"}</span></div>
      <section class="section"><h2>Closest useful things</h2><div class="done-grid">${cats.map(c => {
        const p = sorted.find(c[2]);
        return p ? `<article class="card card-pad near-card"><div class="near-icon">${c[1]}</div><div><p class="eyebrow">${c[0]}</p><h3>${p.name}</h3><p class="muted">${distanceLabel(p)}</p>${maps(p.maps)}</div></article>` : "";
      }).join("")}</div></section>
      <section class="section"><h2>Family essentials</h2><div class="done-grid">${DATA.emergency.map(e => `<article class="card card-pad emergency"><p class="eyebrow">Family essentials</p><h3>${e.label}</h3><p>${e.detail}</p><div class="actions">${e.phone ? `<a class="primary" href="tel:${e.phone}">Call</a>` : ""}${maps(e.maps, "Find on Maps")}</div></article>`).join("")}</div></section>
      <section class="section"><h2>Quick searches near you</h2><div class="done-grid">${DATA.quickSearches.map(q => `<a class="card card-pad near-card" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q.query}"><div class="near-icon">${q.icon}</div><div><h3>${q.label}</h3><p class="muted">Open Google Maps near your current location</p></div></a>`).join("")}</div></section>
    `);
  }

  function explore() {
    const filters = ["top", "all", "Beach", "Beer", "Wine", "food", "family", "rainy", "History"];
    let list = DATA.places;
    if (state.filter === "top") list = list.filter(p => p.top);
    else if (state.filter === "Beer") list = list.filter(p => p.beer || p.type === "Beer");
    else if (state.filter === "Wine") list = list.filter(p => p.wine || p.type === "Wine");
    else if (state.filter === "food") list = list.filter(p => p.food >= 4);
    else if (state.filter === "family") list = list.filter(p => p.rocco || p.family >= 4);
    else if (state.filter === "rainy") list = list.filter(p => p.rainy);
    else if (state.filter !== "all") list = list.filter(p => p.type === state.filter);
    if (state.familyMode) list = list.filter(p => p.rocco || p.family >= 4 || state.filter !== "family");
    return pageShell("Explore", "Top 15 first, but the big list is still there so you can find something wherever you are.", `
      <div class="filters">${filters.map(f => `<button class="${state.filter === f ? "active" : ""}" onclick="SamosApp.filter('${f}')">${f}</button>`).join("")}</div>
      <div class="section place-grid">${list.map(p => card(p)).join("")}</div>`);
  }

  function guide() {
    const q = state.guideQuery.toLowerCase();
    const phrases = DATA.phrases.filter(p => !q || `${p.cat} ${p.en} ${p.el} ${p.say}`.toLowerCase().includes(q));
    const dishes = DATA.dishes.filter(d => !q || `${d.name} ${d.greek} ${d.short} ${d.look}`.toLowerCase().includes(q));
    return pageShell("Greek Guide", "Search food, menu words and phrases. Each phrase can open in Google Translate.", `
      <input class="search" placeholder="Search octopus, bill, petrol, child, beer..." value="${state.guideQuery}" oninput="SamosApp.guideSearch(this.value)">
      <section class="section"><h2>Menu decoder</h2><div class="place-grid">${dishes.map(dishCard).join("") || `<div class="empty">No dishes found.</div>`}</div></section>
      <section class="section"><h2>Phrasebook</h2><div class="place-grid">${phrases.map(p => {
        const translate = `https://translate.google.com/?sl=en&tl=el&text=${encodeURIComponent(p.en)}&op=translate`;
        return `<article class="card card-pad phrase"><p class="eyebrow">${p.cat}</p><h3>${p.en}</h3><div class="greek">${p.el}</div><p><strong>${p.say}</strong></p><div class="copyline"><button class="ghost" onclick="SamosApp.copy('${p.el.replace(/'/g, "\\'")}')">Copy Greek</button><a class="map" target="_blank" rel="noopener" href="${translate}">Google Translate</a></div></article>`;
      }).join("") || `<div class="empty">No phrases found.</div>`}</div></section>`);
  }

  function done() {
    const visited = DATA.places.filter(p => isOn("visited", p.id));
    const eaten = DATA.eateries.filter(e => isOn("eaten", e.id));
    const tried = DATA.dishes.filter(d => isOn("tried", d.id));
    const checklist = DATA.tryList;
    return pageShell("Done", "Everything you have ticked off, tried, eaten and saved. This feeds the trip story.", `
      <section class="section"><h2>Try before you leave</h2><div class="list">${checklist.map(x => `<div class="list-item"><span><strong>${x.label}</strong><br><small>${x.type}</small></span><button class="ghost" onclick="SamosApp.toggle('passport','${x.id}')">${isOn("passport", x.id) ? "Done ✓" : "Tick"}</button></div>`).join("")}</div></section>
      <section class="section"><h2>Visited places</h2><div class="place-grid">${visited.map(p => card(p, true)).join("") || `<div class="empty">No places ticked off yet.</div>`}</div></section>
      <section class="section"><h2>Food and drink done</h2><div class="done-grid">${[...eaten.map(e => `<div class="card card-pad"><h3>${e.name}</h3><p>${e.area}</p></div>`), ...tried.map(d => `<div class="card card-pad"><h3>${d.name}</h3><p>${d.greek}</p></div>`)].join("") || `<div class="empty">Nothing tried yet.</div>`}</div></section>
      <section class="section"><h2>Favourites</h2><div class="place-grid">${DATA.places.filter(p => isOn("favourites", p.id)).map(p => card(p, true)).join("") || `<div class="empty">No favourites yet.</div>`}</div></section>`);
  }

  function memory() {
    const entries = state.store.memories || [];
    return pageShell("Memory Book", "Capture the bits you will actually care about later. Best meal, best drink, best Rocco moment and the story of the day.", `
      <div class="card card-pad"><div class="memory-form">
        <input id="memDate" type="date">
        <input id="memPlace" placeholder="Where did we go?">
        <input id="memMeal" placeholder="Best meal">
        <input id="memDrink" placeholder="Best drink">
        <input id="memRocco" placeholder="Best Rocco moment">
        <textarea id="memNotes" placeholder="Notes from today"></textarea>
        <button class="primary" onclick="SamosApp.saveMemory()">Save memory</button>
      </div></div>
      <section class="section"><h2>Trip story so far</h2><div class="card card-pad"><p>You have visited <strong>${Object.values(bucket("visited")).filter(Boolean).length}</strong> places, tried <strong>${Object.values(bucket("tried")).filter(Boolean).length}</strong> dishes or drinks, and saved <strong>${entries.length}</strong> memories.</p><button class="ghost" onclick="SamosApp.generateStory()">Generate story text</button><div id="storyBox"></div></div></section>
      <section class="section"><h2>Saved memories</h2><div class="place-grid">${entries.map((m, i) => `<article class="card card-pad"><p class="eyebrow">${m.date || "Samos memory"}</p><h3>${m.place || "A day in Samos"}</h3><p><strong>Meal:</strong> ${m.meal || ""}</p><p><strong>Drink:</strong> ${m.drink || ""}</p><p><strong>Rocco:</strong> ${m.rocco || ""}</p><p>${m.notes || ""}</p><button class="ghost" onclick="SamosApp.deleteMemory(${i})">Delete</button></article>`).join("") || `<div class="empty">No memories yet.</div>`}</div></section>`);
  }

  function render() {
    document.querySelectorAll("[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === state.view));
    const family = $("#familyToggle");
    if (family) family.classList.toggle("on", state.familyMode);
    const views = { today, food, nearby, explore, guide, done, memory };
    app().innerHTML = views[state.view]();
  }

  function useLocation() {
    if (!navigator.geolocation) return toast("Location is not available on this device");
    navigator.geolocation.getCurrentPosition(pos => {
      state.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      toast("Location active");
      render();
    }, () => toast("Location permission was not allowed"), { enableHighAccuracy: true, timeout: 10000 });
  }

  function saveMemory() {
    const m = {
      date: $("#memDate").value,
      place: $("#memPlace").value,
      meal: $("#memMeal").value,
      drink: $("#memDrink").value,
      rocco: $("#memRocco").value,
      notes: $("#memNotes").value
    };
    state.store.memories = state.store.memories || [];
    state.store.memories.unshift(m);
    save();
    toast("Memory saved");
    render();
  }

  function deleteMemory(i) {
    state.store.memories.splice(i, 1);
    save();
    render();
  }

  function generateStory() {
    const visited = DATA.places.filter(p => isOn("visited", p.id)).map(p => p.name);
    const tried = DATA.dishes.filter(d => isOn("tried", d.id)).map(d => d.name);
    const memories = state.store.memories || [];
    const text = `Our Samos Trip\n\nPlaces visited: ${visited.join(", ") || "not yet"}\n\nFood and drink tried: ${tried.join(", ") || "not yet"}\n\nFavourite memories:\n${memories.map(m => `• ${m.date || "A day"}: ${m.place || "Samos"}. Best meal: ${m.meal || ""}. Best drink: ${m.drink || ""}. Rocco moment: ${m.rocco || ""}. ${m.notes || ""}`).join("\n")}`;
    $("#storyBox").innerHTML = `<pre style="white-space:pre-wrap;background:#fff8ec;border:1px solid var(--line);border-radius:18px;padding:14px">${text}</pre>`;
  }

  function copy(text) {
    navigator.clipboard?.writeText(text).then(() => toast("Copied"), () => toast("Could not copy"));
  }

  function init() {
    document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));
    $("#familyToggle").addEventListener("click", () => { state.familyMode = !state.familyMode; save(); toast(state.familyMode ? "Family Mode on" : "Family Mode off"); render(); });
    render();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  window.SamosApp = {
    setView,
    toggle,
    filter: f => { state.filter = f; render(); },
    foodFilter: f => { state.foodFilter = f; render(); },
    guideSearch: q => { state.guideQuery = q; render(); const input = document.querySelector(".search"); if (input) { input.focus(); input.setSelectionRange(q.length, q.length); } },
    useLocation,
    planDay,
    saveMemory,
    deleteMemory,
    generateStory,
    copy
  };

  document.addEventListener("DOMContentLoaded", init);
})();
