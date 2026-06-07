(() => {
  const DATA = window.SAMOS_DATA;
  const STORE_KEY = "samosV13State";
  const state = loadState();
  let currentView = "today";
  let userLocation = null;

  function loadState(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState(); }
    catch { return defaultState(); }
  }
  function defaultState(){
    return { favourites:{}, visited:{}, tried:{}, highlights:{}, notes:{}, memories:[], roccoMode:false, completedDays:{} };
  }
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }
  function esc(str=""){ return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
  function slug(str){ return String(str).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
  function googleTranslate(text){ return `https://translate.google.com/?sl=en&tl=el&text=${encodeURIComponent(text)}&op=translate`; }
  function mapsDirections(item){ return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.name + " Samos")}`; }
  function stars(n){ return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n); }

  function haversine(lat1,lng1,lat2,lng2){
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLng = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  function distFromHotel(item){ return haversine(DATA.trip.hotelLat, DATA.trip.hotelLng, item.lat, item.lng); }
  function distFromUser(item){ if(!userLocation) return null; return haversine(userLocation.lat, userLocation.lng, item.lat, item.lng); }
  function distLabel(km){ if(km === null || Number.isNaN(km)) return ""; const miles = km * 0.621371; return `${miles.toFixed(miles < 10 ? 1 : 0)} miles`; }

  function setView(view){
    currentView = view;
    $all("[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    const app = $("#app");
    app.innerHTML = views[view] ? views[view]() : views.today();
    bindViewEvents();
    app.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:"smooth"});
  }

  const views = {
    today: renderToday,
    eat: renderEatDrink,
    near: renderNearMe,
    explore: renderExplore,
    done: renderDone,
    memory: renderMemory
  };

  function renderToday(){
    const top = DATA.places.filter(p => p.top15).slice(0,3);
    return `
      <section class="hero">
        <p class="eyebrow">${esc(DATA.trip.dates)} · ${esc(DATA.trip.hotel)}</p>
        <h1>What should we do today?</h1>
        <p>Choose the mood, keep Rocco in mind, then get a realistic Samos day with maps, food ideas and sensible pairings.</p>
        <div class="hero-actions">
          <button class="primary" data-action="generate-day">Plan my day</button>
          <button class="secondary" data-view="eat">Find food</button>
          <button class="secondary" data-view="near">What is near me?</button>
        </div>
      </section>

      <section class="section card pad">
        <div class="section-head">
          <div>
            <p class="eyebrow">Mood builder</p>
            <h2>Pick today’s vibe</h2>
          </div>
        </div>
        <div class="grid">
          ${moodButton("knackered","😴 Easy","Low effort")}
          ${moodButton("normal","🙂 Balanced","A proper day")}
          ${moodButton("adventure","🚗 Explore","Worth a drive")}
          ${moodButton("beach","🏖 Beach","Sea first")}
          ${moodButton("food","🍽 Food","Eat well")}
          ${moodButton("wine","🍷 Wine","Muscat mode")}
          ${moodButton("beer","🍺 Beer","Find local beer")}
          ${moodButton("family","👨‍👩‍👦 Family","Rocco friendly")}
          ${moodButton("romantic","❤️ Romantic","Honeymoon evening")}
        </div>
        <div id="dayResult" class="section"></div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><p class="eyebrow">Shortlist</p><h2>Top picks</h2></div>
          <button class="ghost" data-view="explore">See all</button>
        </div>
        <div class="grid">${top.map(p => imagePlaceCard(p, "span-4")).join("")}</div>
      </section>

      <section class="section grid">
        ${homeTile("🍽","Eat & Drink","Breakfast, lunch, dinner, beer, wine and must order dishes","eat")}
        ${homeTile("📍","Near Me","Closest beach, taverna, beer spot and viewpoint","near")}
        ${homeTile("✅","Done","Everything you have ticked off so far","done")}
      </section>
    `;
  }
  function moodButton(id,title,sub){ return `<button class="tile span-4 mood" data-mood="${id}"><span>${title.split(" ")[0]}</span><b>${title.substring(2)}</b><small>${sub}</small></button>`; }
  function homeTile(icon,title,copy,view){ return `<button class="tile span-4" data-view="${view}"><span>${icon}</span><b>${title}</b><small>${copy}</small></button>`; }

  function generateDay(){
    const chosen = $all(".mood.active").map(b => b.dataset.mood);
    if(state.roccoMode && !chosen.includes("family")) chosen.push("family","rocco");
    if(!chosen.length) chosen.push("normal");
    const scored = DATA.dayPlans.map(plan => {
      const score = plan.mood.reduce((sum,m) => sum + (chosen.includes(m) ? 3 : 0),0) + Math.random();
      return {plan, score};
    }).sort((a,b) => b.score - a.score);
    const plan = scored[0].plan;
    const stops = plan.stops.map(id => DATA.places.find(p => p.id === id)).filter(Boolean);
    const html = `
      <div class="day-result">
        <p class="eyebrow">Today’s recommendation</p>
        <h2>${esc(plan.title)}</h2>
        <p class="lead">${esc(plan.summary)}</p>
        <div class="timeline">
          ${stops.map((p,i) => `
            <div class="timeline-step">
              <div class="time-pill">${["AM","Lunch","PM","Evening"][i] || "Stop"}</div>
              <div class="box">
                <h3>${esc(p.name)}</h3>
                <p>${esc(p.description)}</p>
                <div class="meta"><span class="light-tag">${esc(p.driveHotel)} from hotel</span><span class="light-tag">Worth ${stars(p.worth)}</span></div>
                <div class="actions">${mapButton(p)}<button class="secondary" data-toggle="visited" data-id="${p.id}">${state.visited[p.id] ? "Visited ✓" : "Mark visited"}</button></div>
              </div>
            </div>`).join("")}
        </div>
        <div class="actions"><button class="primary" data-complete-day="${plan.id}">Mark day completed</button><button class="secondary" data-action="generate-day">Try another</button></div>
      </div>`;
    $("#dayResult").innerHTML = html;
  }

  function renderEatDrink(){
    const spots = DATA.foodSpots;
    return `
      <section class="hero" style="background-image:linear-gradient(135deg,rgba(23,107,115,.88),rgba(14,75,82,.88)),url('https://source.unsplash.com/1400x900/?greek,food,taverna')">
        <p class="eyebrow">Food is the priority</p>
        <h1>Eat & Drink</h1>
        <p>Breakfast, lunch, dinner, tavernas, cafés, beer, wine, local dishes and what to order when you get there.</p>
      </section>

      <section class="section">
        <div class="filters" id="foodFilters">
          ${["all","breakfast","lunch","dinner","coffee","beer","wine","family","romantic","near hotel"].map(f => `<button class="filter-btn ${f==='all'?'active':''}" data-food-filter="${f}">${label(f)}</button>`).join("")}
        </div>
        <div class="searchbar"><input id="foodSearch" placeholder="Search restaurants, areas, breakfast, octopus, beer..." /></div>
        <div id="foodResults" class="grid">${spots.map(foodSpotCard).join("")}</div>
      </section>

      <section class="section grid">
        <div class="card pad span-6">
          <p class="eyebrow">Best by meal</p><h2>Quick shortlists</h2>
          ${shortList("Breakfast", spots.filter(s => s.best.includes("breakfast")).slice(0,4))}
          ${shortList("Lunch", spots.filter(s => s.best.includes("lunch")).slice(0,4))}
          ${shortList("Dinner", spots.filter(s => s.best.includes("dinner")).slice(0,5))}
        </div>
        <div class="card pad span-6">
          <p class="eyebrow">Try before you leave</p><h2>Food passport</h2>
          ${DATA.tryList.map(checkItem).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><div><p class="eyebrow">Menu help</p><h2>Local dishes and menu pictures</h2></div></div>
        <div class="searchbar"><input id="dishSearch" placeholder="Search octopus, beer, Muscat, cheese, Greek words..." /></div>
        <div id="dishResults" class="grid">${DATA.dishes.map(dishCard).join("")}</div>
      </section>

      <section class="section">
        <div class="section-head"><div><p class="eyebrow">Phrasebook</p><h2>Searchable Greek helper</h2><p class="lead">Each phrase has copy and a Google Translate link.</p></div></div>
        <div class="searchbar"><input id="phraseSearch" placeholder="Search bill, beer, petrol, child, pharmacy..." /></div>
        <div id="phraseResults" class="grid">${DATA.phrases.map(phraseCard).join("")}</div>
      </section>
    `;
  }

  function shortList(title, items){
    return `<h3>${esc(title)}</h3><div class="mini-list">${items.length ? items.map(s => `<a href="${s.maps}" target="_blank" rel="noopener">${esc(s.name)} <small>· ${esc(s.area)}</small></a>`).join("") : `<p class="lead">No shortlist yet.</p>`}</div>`;
  }

  function renderNearMe(){
    const hasLocation = !!userLocation;
    const placeList = sortedByDistance(DATA.places);
    const foodList = sortedByDistance(DATA.foodSpots);
    const nearestBy = (items, test) => items.filter(test).slice(0,3);
    return `
      <section class="hero" style="background-image:linear-gradient(135deg,rgba(23,107,115,.9),rgba(14,75,82,.88)),url('https://source.unsplash.com/1400x900/?samos,map')">
        <p class="eyebrow">Use your live location</p>
        <h1>What is near me?</h1>
        <p>Find the nearest beach, taverna, beer spot, wine stop, viewpoint and family option wherever you are on the island.</p>
        <div class="hero-actions"><button class="primary" data-action="locate">Use my location</button></div>
      </section>
      <section class="section ${hasLocation ? "notice" : "notice warning"}">${hasLocation ? `Location active. Distances are sorted from where you are now.` : `Tap Use my location to sort by your current position. Until then, distances are from your hotel.`}</section>
      <section class="section grid">
        ${nearBlock("Closest beach", nearestBy(placeList, p => p.tags.includes("beach")))}
        ${nearBlock("Closest food", nearestBy(foodList, s => true), true)}
        ${nearBlock("Closest beer", nearestBy([...placeList,...foodList], p => (p.tags||[]).includes("beer") || p.type === "Beer"), true)}
        ${nearBlock("Closest wine", nearestBy(placeList, p => p.tags.includes("wine") || p.type === "Wine"))}
        ${nearBlock("Closest viewpoint", nearestBy(placeList, p => p.tags.includes("views") || p.type === "View"))}
        ${nearBlock("Closest Rocco friendly", nearestBy(placeList, p => p.rocco || p.tags.includes("family")))}
      </section>
    `;
  }
  function nearBlock(title, items){ return `<div class="card pad span-6"><p class="eyebrow">${esc(title)}</p><div class="mini-list">${items.map(i => `<a href="${i.maps}" target="_blank" rel="noopener"><b>${esc(i.name)}</b><br><span class="distance">${distLabel(userLocation ? distFromUser(i) : distFromHotel(i))}</span> · ${esc(i.area || "Samos")}</a>`).join("")}</div></div>`; }
  function sortedByDistance(items){ return [...items].sort((a,b) => (userLocation ? distFromUser(a)-distFromUser(b) : distFromHotel(a)-distFromHotel(b))); }

  function renderExplore(){
    const filters = ["all","top15","beach","food","beer","wine","views","history","family","rainy","near hotel"];
    return `
      <section class="hero" style="background-image:linear-gradient(135deg,rgba(23,107,115,.86),rgba(14,75,82,.9)),url('https://source.unsplash.com/1400x900/?samos,greece,island')">
        <p class="eyebrow">Top 15 plus full island list</p>
        <h1>Explore Samos</h1>
        <p>Use the Top 15 for the must dos, or the full list when you want to know what is near your current part of the island.</p>
      </section>
      <section class="section">
        <div class="filters">${filters.map(f => `<button class="filter-btn ${f==='top15'?'active':''}" data-place-filter="${f}">${label(f)}</button>`).join("")}</div>
        <div class="searchbar"><input id="placeSearch" placeholder="Search beaches, beer, Kokkari, Rocco, rainy day..." /><button class="secondary" data-action="locate">Sort near me</button></div>
        <div id="placeResults" class="grid">${filterPlaces("top15", "").map(p => placeCard(p)).join("")}</div>
      </section>
    `;
  }

  function renderDone(){
    const visited = DATA.places.filter(p => state.visited[p.id]);
    const tried = DATA.tryList.filter(i => state.tried[i.id]);
    const highlights = [...DATA.places, ...DATA.foodSpots].filter(i => state.highlights[i.id]);
    const completed = DATA.dayPlans.filter(d => state.completedDays[d.id]);
    return `
      <section class="hero" style="background-image:linear-gradient(135deg,rgba(23,107,115,.88),rgba(14,75,82,.9)),url('https://source.unsplash.com/1400x900/?travel,journal,greece')">
        <p class="eyebrow">Everything ticked off</p>
        <h1>Done</h1>
        <p>Your visited places, tried dishes, drinks, completed days and highlights all collect here.</p>
      </section>
      <section class="section grid">
        <div class="card pad span-6"><p class="eyebrow">Visited places</p><h2>${visited.length} places</h2>${visited.length ? visited.map(doneRow).join("") : `<div class="empty">No places marked visited yet.</div>`}</div>
        <div class="card pad span-6"><p class="eyebrow">Try before you leave</p><h2>${tried.length} ticked</h2>${DATA.tryList.map(checkItem).join("")}</div>
        <div class="card pad span-6"><p class="eyebrow">Completed days</p><h2>${completed.length} plans</h2>${completed.length ? completed.map(d => `<div class="check-row done"><span>${esc(d.title)}</span><button class="tiny-btn" data-complete-day="${d.id}">✓</button></div>`).join("") : `<div class="empty">No day plans completed yet.</div>`}</div>
        <div class="card pad span-6"><p class="eyebrow">Highlights</p><h2>${highlights.length} best bits</h2>${highlights.length ? highlights.map(h => `<div class="check-row done"><span>${esc(h.name)}</span><button class="tiny-btn" data-toggle="highlight" data-id="${h.id}">★</button></div>`).join("") : `<div class="empty">Star a place or food spot to add highlights.</div>`}</div>
      </section>
    `;
  }
  function doneRow(p){ return `<div class="check-row done"><span><b>${esc(p.name)}</b><br><small>${esc(p.area)}</small></span><button class="tiny-btn" data-toggle="visited" data-id="${p.id}">✓</button></div>`; }

  function renderMemory(){
    return `
      <section class="hero" style="background-image:linear-gradient(135deg,rgba(23,107,115,.88),rgba(14,75,82,.9)),url('https://source.unsplash.com/1400x900/?holiday,photo,album')">
        <p class="eyebrow">For later</p>
        <h1>Memory Book</h1>
        <p>Save the meals, drinks, places and Rocco moments you will actually want to remember.</p>
      </section>
      <section class="section grid">
        <form id="memoryForm" class="card pad span-6">
          <p class="eyebrow">Add memory</p><h2>Today’s best bit</h2>
          <div class="field"><label>Date</label><input name="date" type="date"></div>
          <div class="field"><label>Where did you go?</label><input name="where" placeholder="Kokkari, Potami, Manolates..."></div>
          <div class="field"><label>Best meal</label><input name="meal" placeholder="Octopus, giouvetsi, beach lunch..."></div>
          <div class="field"><label>Best drink</label><input name="drink" placeholder="Samos Beer, Muscat, cocktail..."></div>
          <div class="field"><label>Best Rocco moment</label><input name="rocco" placeholder="Something funny or lovely"></div>
          <div class="field"><label>Notes</label><textarea name="notes" placeholder="Anything else worth remembering"></textarea></div>
          <button class="primary" type="submit">Save memory</button>
        </form>
        <div class="span-6">
          <div class="card pad">
            <p class="eyebrow">End of trip</p><h2>Generate story</h2><p class="lead">Creates a printable story from Done and Memory Book.</p>
            <div class="actions"><button class="primary" data-action="story">Generate Our Samos Story</button><button class="secondary" onclick="window.print()">Print or save PDF</button></div>
          </div>
          <div id="storyBox" class="section"></div>
        </div>
      </section>
      <section class="section"><div class="section-head"><div><p class="eyebrow">Saved memories</p><h2>${state.memories.length} entries</h2></div></div><div class="grid">${state.memories.map(memoryCard).join("") || `<div class="empty span-12">No memories yet.</div>`}</div></section>
    `;
  }

  function memoryCard(m, index){ return `<article class="card pad span-4"><p class="eyebrow">${esc(m.date || "Samos memory")}</p><h3>${esc(m.where || "Somewhere in Samos")}</h3><p><b>Meal:</b> ${esc(m.meal || "")}</p><p><b>Drink:</b> ${esc(m.drink || "")}</p><p><b>Rocco:</b> ${esc(m.rocco || "")}</p><p>${esc(m.notes || "")}</p><button class="secondary" data-delete-memory="${index}">Delete</button></article>`; }

  function imagePlaceCard(p, span="span-4"){
    return `<article class="image-card card ${span}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"><div class="content"><p class="eyebrow">${esc(p.area)}</p><h3>${esc(p.name)}</h3><p>${esc(p.bestFor.slice(0,2).join(" · "))}</p><div class="meta"><span class="tag">${esc(p.driveHotel)}</span><span class="tag">Worth ${stars(p.worth)}</span></div><div class="actions">${mapButton(p)}<button data-toggle="visited" data-id="${p.id}">${state.visited[p.id] ? "Visited ✓" : "Done"}</button></div></div></article>`;
  }
  function placeCard(p){
    const d = userLocation ? distLabel(distFromUser(p)) : distLabel(distFromHotel(p));
    return `<article class="card place-card span-4"><div class="place-img-wrap"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"></div><div class="place-body"><p class="eyebrow">${esc(p.type)} · ${esc(p.area)}</p><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="meta"><span class="light-tag">${esc(p.driveHotel)}</span><span class="light-tag distance">${d}</span>${p.rocco?`<span class="light-tag">Rocco friendly</span>`:""}</div><div class="scores"><div class="score"><b>${stars(p.worth)}</b><small>Worth</small></div><div class="score"><b>${stars(p.family)}</b><small>Family</small></div><div class="score"><b>${stars(p.romance)}</b><small>Honeymoon</small></div></div><p><b>Tim note:</b> ${esc(p.timNote)}</p><p><b>Pair with:</b> ${p.pairWith.map(id => esc(nameFor(id))).join(", ")}</p><div class="actions">${mapButton(p)}<button class="secondary" data-toggle="favourite" data-id="${p.id}">${state.favourites[p.id]?"Favourite ★":"Favourite"}</button><button class="secondary" data-toggle="visited" data-id="${p.id}">${state.visited[p.id]?"Visited ✓":"Mark visited"}</button><button class="secondary" data-toggle="highlight" data-id="${p.id}">${state.highlights[p.id]?"Highlight ★":"Highlight"}</button></div></div></article>`;
  }
  function foodSpotCard(s){
    return `<article class="card place-card span-4"><div class="place-img-wrap"><img src="${s.image}" alt="${esc(s.name)}" loading="lazy"></div><div class="place-body"><p class="eyebrow">${esc(s.type)} · ${esc(s.area)}</p><h3>${esc(s.name)}</h3><p>${esc(s.summary)}</p><div class="meta">${s.best.map(b => `<span class="light-tag">${label(b)}</span>`).join("")}<span class="light-tag">${s.price}</span></div><p><b>Must order:</b> ${s.mustOrder.map(esc).join(", ")}</p><div class="actions">${mapButton(s)}<button class="secondary" data-toggle="highlight" data-id="${s.id}">${state.highlights[s.id]?"Highlight ★":"Highlight"}</button></div></div></article>`;
  }
  function dishCard(d){
    return `<article class="card food-card span-4"><div class="dish-image"><img src="${d.image}" alt="${esc(d.name)}" loading="lazy"></div><div class="pad"><p class="eyebrow">${esc(d.category)} · Worth ${stars(d.worth)}</p><h3>${esc(d.name)}</h3><p><b>${esc(d.greek)}</b><br><small>${esc(d.pronounce)}</small></p><p>${esc(d.description)}</p><p><b>Look for:</b> ${d.lookFor.map(esc).join(", ")}</p><div class="actions"><button class="secondary" data-try-dish="${d.id}">${state.tried[`dish-${d.id}`]?"Tried ✓":"Mark tried"}</button><a class="secondary" target="_blank" rel="noopener" href="${googleTranslate(d.name)}">Translate</a></div></div></article>`;
  }
  function phraseCard(p){ return `<article class="card pad span-4"><p class="eyebrow">${esc(p.cat)}</p><h3>${esc(p.en)}</h3><p><b>${esc(p.el)}</b><br><small>${esc(p.pr)}</small></p><div class="actions"><button class="secondary" data-copy="${esc(p.el)}">Copy Greek</button><a class="secondary" target="_blank" rel="noopener" href="${googleTranslate(p.en)}">Google Translate</a></div></article>`; }
  function checkItem(item){ const done = state.tried[item.id]; return `<div class="check-row ${done?"done":""}"><span><b>${esc(item.text)}</b><br><small>${esc(item.type)}</small></span><button class="tiny-btn" data-try="${item.id}">${done?"✓":"○"}</button></div>`; }
  function mapButton(item){ return `<a class="primary" href="${item.maps || mapsDirections(item)}" target="_blank" rel="noopener">Maps</a>`; }
  function label(str){ return String(str).replace(/top15/g,"Top 15").replace(/\b\w/g, c => c.toUpperCase()); }
  function nameFor(id){ return (DATA.places.find(p => p.id === id) || DATA.foodSpots.find(p => p.id === id) || {name:id}).name; }

  function filterPlaces(filter, query){
    let list = [...DATA.places];
    if(filter === "top15") list = list.filter(p => p.top15);
    else if(filter !== "all") list = list.filter(p => p.type.toLowerCase() === filter || p.tags.includes(filter) || (filter === "family" && p.rocco));
    if(state.roccoMode) list = list.sort((a,b) => Number(b.rocco) - Number(a.rocco));
    if(query) list = list.filter(p => haystack(p).includes(query.toLowerCase()));
    return sortedByDistance(list);
  }
  function haystack(obj){ return Object.values(obj).flat().join(" ").toLowerCase(); }

  function bindViewEvents(){
    $all("[data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));
    $all(".mood").forEach(btn => btn.addEventListener("click", () => btn.classList.toggle("active")));
    $all("[data-action='generate-day']").forEach(btn => btn.addEventListener("click", generateDay));
    $all("[data-action='locate']").forEach(btn => btn.addEventListener("click", locateUser));
    $all("[data-toggle]").forEach(btn => btn.addEventListener("click", () => toggle(btn.dataset.toggle, btn.dataset.id)));
    $all("[data-try]").forEach(btn => btn.addEventListener("click", () => { state.tried[btn.dataset.try] = !state.tried[btn.dataset.try]; save(); setView(currentView); }));
    $all("[data-try-dish]").forEach(btn => btn.addEventListener("click", () => { const key = `dish-${btn.dataset.tryDish}`; state.tried[key] = !state.tried[key]; save(); setView(currentView); }));
    $all("[data-complete-day]").forEach(btn => btn.addEventListener("click", () => { state.completedDays[btn.dataset.completeDay] = !state.completedDays[btn.dataset.completeDay]; save(); setView("done"); }));
    $all("[data-copy]").forEach(btn => btn.addEventListener("click", async () => { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = "Copied"; btn.classList.add("copy-ok"); }));
    $all("[data-delete-memory]").forEach(btn => btn.addEventListener("click", () => { state.memories.splice(Number(btn.dataset.deleteMemory),1); save(); setView("memory"); }));
    const placeSearch = $("#placeSearch"); if(placeSearch) placeSearch.addEventListener("input", updatePlaceResults);
    $all("[data-place-filter]").forEach(btn => btn.addEventListener("click", () => { $all("[data-place-filter]").forEach(b => b.classList.remove("active")); btn.classList.add("active"); updatePlaceResults(); }));
    const foodSearch = $("#foodSearch"); if(foodSearch) foodSearch.addEventListener("input", updateFoodResults);
    $all("[data-food-filter]").forEach(btn => btn.addEventListener("click", () => { $all("[data-food-filter]").forEach(b => b.classList.remove("active")); btn.classList.add("active"); updateFoodResults(); }));
    const dishSearch = $("#dishSearch"); if(dishSearch) dishSearch.addEventListener("input", updateDishResults);
    const phraseSearch = $("#phraseSearch"); if(phraseSearch) phraseSearch.addEventListener("input", updatePhraseResults);
    const form = $("#memoryForm"); if(form) form.addEventListener("submit", saveMemory);
    const storyBtn = $("[data-action='story']"); if(storyBtn) storyBtn.addEventListener("click", buildStory);
  }

  function toggle(kind, id){ state[kind + "s"] ? state[kind + "s"][id] = !state[kind + "s"][id] : state[kind][id] = !state[kind][id]; if(kind === "favourite") state.favourites[id] = !state.favourites[id]; if(kind === "visited") state.visited[id] = !state.visited[id]; if(kind === "highlight") state.highlights[id] = !state.highlights[id]; save(); setView(currentView); }

  function updatePlaceResults(){ const filter = $("[data-place-filter].active")?.dataset.placeFilter || "top15"; const q = $("#placeSearch")?.value || ""; $("#placeResults").innerHTML = filterPlaces(filter,q).map(placeCard).join("") || `<div class="empty span-12">No places found.</div>`; bindViewEvents(); }
  function updateFoodResults(){ const filter = $("[data-food-filter].active")?.dataset.foodFilter || "all"; const q = ($("#foodSearch")?.value || "").toLowerCase(); let list = DATA.foodSpots; if(filter !== "all") list = list.filter(s => s.best.includes(filter) || s.tags.includes(filter) || s.type.toLowerCase().includes(filter)); if(q) list = list.filter(s => haystack(s).includes(q)); $("#foodResults").innerHTML = sortedByDistance(list).map(foodSpotCard).join("") || `<div class="empty span-12">No food spots found.</div>`; bindViewEvents(); }
  function updateDishResults(){ const q = ($("#dishSearch")?.value || "").toLowerCase(); const list = DATA.dishes.filter(d => haystack(d).includes(q)); $("#dishResults").innerHTML = list.map(dishCard).join("") || `<div class="empty span-12">No dish found.</div>`; bindViewEvents(); }
  function updatePhraseResults(){ const q = ($("#phraseSearch")?.value || "").toLowerCase(); const list = DATA.phrases.filter(p => haystack(p).includes(q)); $("#phraseResults").innerHTML = list.map(phraseCard).join("") || `<div class="empty span-12">No phrase found.</div>`; bindViewEvents(); }

  function locateUser(){
    if(!navigator.geolocation){ alert("Location is not available in this browser."); return; }
    navigator.geolocation.getCurrentPosition(pos => { userLocation = {lat:pos.coords.latitude, lng:pos.coords.longitude}; setView(currentView); }, () => alert("Location permission was not granted."), {enableHighAccuracy:true, timeout:10000});
  }
  function saveMemory(e){
    e.preventDefault();
    const fd = new FormData(e.target);
    state.memories.unshift(Object.fromEntries(fd.entries()));
    save(); setView("memory");
  }
  function buildStory(){
    const visited = DATA.places.filter(p => state.visited[p.id]).map(p => p.name);
    const tried = DATA.tryList.filter(i => state.tried[i.id]).map(i => i.text);
    const highlights = [...DATA.places,...DATA.foodSpots].filter(i => state.highlights[i.id]).map(i => i.name);
    const memoryLines = state.memories.map(m => `${m.date || "A day"}: ${m.where || "Samos"}. Meal: ${m.meal || ""}. Drink: ${m.drink || ""}. Rocco: ${m.rocco || ""}. ${m.notes || ""}`);
    const story = `Our Samos Trip\n${DATA.trip.dates}\n\nPlaces visited:\n${visited.length ? visited.map(x => "• " + x).join("\n") : "No places marked yet."}\n\nThings tried:\n${tried.length ? tried.map(x => "• " + x).join("\n") : "Nothing ticked yet."}\n\nHighlights:\n${highlights.length ? highlights.map(x => "★ " + x).join("\n") : "No highlights starred yet."}\n\nMemory Book:\n${memoryLines.length ? memoryLines.join("\n\n") : "No memories saved yet."}`;
    $("#storyBox").innerHTML = `<div class="story">${esc(story)}</div>`;
  }

  function init(){
    $("#roccoToggle").classList.toggle("active", state.roccoMode);
    $("#roccoToggle").addEventListener("click", () => { state.roccoMode = !state.roccoMode; save(); $("#roccoToggle").classList.toggle("active", state.roccoMode); setView(currentView); });
    $all(".bottom-nav [data-view], .brand[data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));
    setView("today");
    if("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
  document.addEventListener("DOMContentLoaded", init);
})();
