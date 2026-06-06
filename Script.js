const APP = {
  saved: JSON.parse(localStorage.getItem("samosPlanner") || "{}"),

  locations: [
    {
      name: "Potami Beach",
      type: "Beach",
      area: "Karlovasi",
      tags: ["family", "nearby", "views", "swim"],
      description: "Big scenic pebble beach close to Karlovasi. Great first day beach, especially because it is close to your hotel.",
      kidScore: 8,
      romanceScore: 7,
      drive: "About 10 mins from Erato by Samian Mare",
      maps: "https://www.google.com/maps/search/?api=1&query=Potami+Beach+Samos"
    },
    {
      name: "Potami Waterfalls",
      type: "Experience",
      area: "Karlovasi",
      tags: ["family", "adventure", "nearby", "nature"],
      description: "Forest walk, river gorge and waterfalls. The early part is family friendly. The final waterfall section is more adventurous.",
      kidScore: 7,
      romanceScore: 8,
      drive: "About 10 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Potami+Waterfalls+Samos"
    },
    {
      name: "Kokkari",
      type: "Village",
      area: "North coast",
      tags: ["food", "views", "romantic", "evening"],
      description: "Probably the postcard village of Samos. Harbour, tavernas, little streets and an easy evening wander.",
      kidScore: 8,
      romanceScore: 10,
      drive: "About 35 to 45 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Kokkari+Samos"
    },
    {
      name: "Pythagoreio",
      type: "Town",
      area: "South coast",
      tags: ["history", "food", "harbour", "evening"],
      description: "Pretty harbour town named after Pythagoras. Good for dinner, wandering and pairing with ancient sites.",
      kidScore: 8,
      romanceScore: 9,
      drive: "About 50 to 60 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Pythagoreio+Samos"
    },
    {
      name: "Heraion of Samos",
      type: "History",
      area: "South coast",
      tags: ["history", "unesco", "culture"],
      description: "Major ancient sanctuary and one of the key historical places on the island.",
      kidScore: 5,
      romanceScore: 7,
      drive: "About 55 to 65 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Heraion+of+Samos"
    },
    {
      name: "Tunnel of Eupalinos",
      type: "History",
      area: "Pythagoreio",
      tags: ["history", "rainy", "culture"],
      description: "Ancient engineering marvel near Pythagoreio. Better for adults than tiny children, but very memorable.",
      kidScore: 4,
      romanceScore: 6,
      drive: "About 55 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Tunnel+of+Eupalinos+Samos"
    },
    {
      name: "Panagia Spiliani Monastery",
      type: "Viewpoint",
      area: "Pythagoreio",
      tags: ["views", "culture", "romantic"],
      description: "Cave monastery above Pythagoreio with excellent views. A brilliant add on to a south coast day.",
      kidScore: 6,
      romanceScore: 9,
      drive: "About 55 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Panagia+Spiliani+Samos"
    },
    {
      name: "Manolates",
      type: "Village",
      area: "Mountains",
      tags: ["food", "views", "romantic", "village"],
      description: "Beautiful mountain village with narrow lanes, local tavernas and a slower pace.",
      kidScore: 6,
      romanceScore: 9,
      drive: "About 30 to 40 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Manolates+Samos"
    },
    {
      name: "Vourliotes",
      type: "Village",
      area: "Mountains",
      tags: ["quiet", "food", "views", "village"],
      description: "Quieter mountain village option. Great for lunch and a wander away from the busier spots.",
      kidScore: 6,
      romanceScore: 8,
      drive: "About 35 to 45 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Vourliotes+Samos"
    },
    {
      name: "Lemonakia Beach",
      type: "Beach",
      area: "Near Kokkari",
      tags: ["beach", "family", "views", "swim"],
      description: "Small, pretty beach near Kokkari. Good with a Kokkari day.",
      kidScore: 7,
      romanceScore: 8,
      drive: "About 40 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Lemonakia+Beach+Samos"
    },
    {
      name: "Tsamadou Beach",
      type: "Beach",
      area: "Near Kokkari",
      tags: ["beach", "views", "swim"],
      description: "One of the most beautiful beaches on the island, with pine covered slopes above the water.",
      kidScore: 6,
      romanceScore: 9,
      drive: "About 40 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Tsamadou+Beach+Samos"
    },
    {
      name: "Livadaki Beach",
      type: "Beach",
      area: "North east",
      tags: ["beach", "family", "shallow", "swim"],
      description: "Small, shallow, turquoise beach. Great for children if conditions are calm. Arrive early.",
      kidScore: 9,
      romanceScore: 7,
      drive: "About 60 to 70 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Livadaki+Beach+Samos"
    },
    {
      name: "Psili Ammos Beach",
      type: "Beach",
      area: "South east",
      tags: ["beach", "family", "sand", "swim"],
      description: "Sandy, shallow beach. One of the better options for a small child.",
      kidScore: 9,
      romanceScore: 6,
      drive: "About 70 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Psili+Ammos+Beach+Samos"
    },
    {
      name: "Samos Beer",
      type: "Beer",
      area: "Pythagoreio",
      tags: ["beer", "local", "grownup"],
      description: "Local Samos brewery. Look out for island brewed beers on menus and in shops.",
      kidScore: 3,
      romanceScore: 7,
      drive: "About 55 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Samos+Beer+Pythagoreio"
    },
    {
      name: "Samos Wine Museum",
      type: "Wine",
      area: "Vathy",
      tags: ["wine", "rainy", "local", "grownup"],
      description: "Useful stop for understanding Samos Muscat and the island's wine history.",
      kidScore: 4,
      romanceScore: 8,
      drive: "About 45 to 55 mins",
      maps: "https://www.google.com/maps/search/?api=1&query=Samos+Wine+Museum"
    }
  ],

  days: [
    {
      title: "Easy First Day Near Karlovasi",
      mood: "Low effort, high reward",
      route: ["Potami Beach", "Potami Waterfalls"],
      plan: [
        "Morning coffee and slow start",
        "Potami Beach for swimming and exploring",
        "Lunch near the beach",
        "Potami Waterfalls walk if everyone has energy",
        "Back to hotel before dinner"
      ]
    },
    {
      title: "Postcard Samos",
      mood: "Views, beaches and harbour dinner",
      route: ["Lemonakia Beach", "Tsamadou Beach", "Kokkari"],
      plan: [
        "Drive towards Kokkari",
        "Beach time at Lemonakia or Tsamadou",
        "Late lunch or early dinner in Kokkari",
        "Harbour wander and photos",
        "Sunset drink if Rocco is still going"
      ]
    },
    {
      title: "Ancient Samos Day",
      mood: "History with a harbour reward",
      route: ["Heraion of Samos", "Pythagoreio", "Panagia Spiliani Monastery"],
      plan: [
        "Start with Heraion before it gets hot",
        "Head into Pythagoreio for lunch",
        "Visit Panagia Spiliani for views",
        "Harbour dinner in Pythagoreio"
      ]
    },
    {
      title: "Mountain Village Lunch",
      mood: "Slow, scenic and very Greek",
      route: ["Manolates", "Vourliotes", "Kokkari"],
      plan: [
        "Drive into the hills",
        "Wander Manolates",
        "Long lunch in a village taverna",
        "Optional stop at Vourliotes",
        "Finish with Kokkari or back to hotel"
      ]
    },
    {
      title: "Wine And Local Flavour",
      mood: "For the wine brain",
      route: ["Samos Wine Museum", "Pythagoreio", "Samos Beer"],
      plan: [
        "Visit the wine museum",
        "Look for Samos Muscat and dry Muscat",
        "Lunch in Vathy or Pythagoreio",
        "Find Samos Beer",
        "Buy a bottle for balcony tasting"
      ]
    }
  ],

  food: [
    ["Ρεβιθοκεφτέδες", "Revithokeftedes", "Chickpea fritters. Very worth ordering when you see them."],
    ["Γιουβέτσι", "Giouvetsi", "Slow cooked meat with orzo pasta."],
    ["Χταπόδι", "Htapodi", "Octopus, often grilled."],
    ["Καλαμάρι", "Kalamari", "Squid. Usually grilled or fried."],
    ["Ντολμαδάκια", "Dolmadakia", "Stuffed vine leaves."],
    ["Κολοκυθοκεφτέδες", "Kolokithokeftedes", "Courgette fritters."],
    ["Μπουρέκια", "Boureki or Bourekia", "Traditional pastry, sometimes with pumpkin or cheese."],
    ["Τυρί", "Tyri", "Cheese. Ask for local cheese if available."],
    ["Μέλι", "Meli", "Honey. Samos honey is worth looking for."],
    ["Μοσχάτο Σάμου", "Moschato Samou", "Samos Muscat wine."]
  ],

  phrases: [
    ["Hello", "Γεια σας", "Yassas"],
    ["Good morning", "Καλημέρα", "Kalimera"],
    ["Good evening", "Καλησπέρα", "Kalispera"],
    ["Thank you", "Ευχαριστώ", "Efharisto"],
    ["Please", "Παρακαλώ", "Parakalo"],
    ["Yes", "Ναι", "Ne"],
    ["No", "Όχι", "Ohi"],
    ["Sorry", "Συγγνώμη", "Signomi"],
    ["The bill please", "Τον λογαριασμό παρακαλώ", "Ton logariasmo parakalo"],
    ["A table for three please", "Ένα τραπέζι για τρεις παρακαλώ", "Ena trapezi gia tris parakalo"],
    ["Water please", "Νερό παρακαλώ", "Nero parakalo"],
    ["One beer please", "Μία μπύρα παρακαλώ", "Mia bira parakalo"],
    ["One wine please", "Ένα κρασί παρακαλώ", "Ena krasi parakalo"],
    ["Where is the toilet?", "Πού είναι η τουαλέτα;", "Pou ine i toualeta"],
    ["Fill it up please", "Γεμίστε το παρακαλώ", "Yemiste to parakalo"],
    ["Petrol", "Βενζίνη", "Venzini"],
    ["Diesel", "Πετρέλαιο", "Petreleo"]
  ]
};

function saveState() {
  localStorage.setItem("samosPlanner", JSON.stringify(APP.saved));
}

function isSaved(group, key) {
  return APP.saved[group] && APP.saved[group][key];
}

function toggleSaved(group, key) {
  APP.saved[group] = APP.saved[group] || {};
  APP.saved[group][key] = !APP.saved[group][key];
  saveState();
  render();
}

function googleLink(place) {
  return `<a class="map-btn" href="${place.maps}" target="_blank" rel="noopener">Open in Google Maps</a>`;
}

function score(label, value) {
  return `<span class="score">${label}: ${value}/10</span>`;
}

function locationCard(place) {
  const fav = isSaved("favourites", place.name);
  const visited = isSaved("visited", place.name);

  return `
    <article class="card">
      <div class="card-top">
        <div>
          <p class="eyebrow">${place.type} · ${place.area}</p>
          <h3>${place.name}</h3>
        </div>
        <button onclick="toggleSaved('favourites','${escapeQuotes(place.name)}')" class="icon-btn">${fav ? "★" : "☆"}</button>
      </div>
      <p>${place.description}</p>
      <div class="chips">
        ${place.tags.map(tag => `<span>${tag}</span>`).join("")}
      </div>
      <div class="scores">
        ${score("Kid", place.kidScore)}
        ${score("Honeymoon", place.romanceScore)}
      </div>
      <p class="drive">${place.drive}</p>
      <div class="actions">
        ${googleLink(place)}
        <button onclick="toggleSaved('visited','${escapeQuotes(place.name)}')" class="secondary-btn">
          ${visited ? "Visited ✓" : "Mark visited"}
        </button>
      </div>
    </article>
  `;
}

function escapeQuotes(text) {
  return text.replace(/'/g, "\\'");
}

function renderHome() {
  const totalVisited = Object.values(APP.saved.visited || {}).filter(Boolean).length;
  const totalFavs = Object.values(APP.saved.favourites || {}).filter(Boolean).length;

  return `
    <section class="hero">
      <p class="eyebrow">20 to 27 September · Samos · Erato by Samian Mare</p>
      <h1>Samos Honeymoon Planner</h1>
      <p>Your family friendly, wine aware, beach finding, taverna tracking, Google Maps powered trip app.</p>
      <div class="hero-stats">
        <span>${APP.locations.length} places</span>
        <span>${totalFavs} favourites</span>
        <span>${totalVisited} visited</span>
      </div>
    </section>

    <section class="grid">
      <button class="big-tile" onclick="setView('places')">Explore places</button>
      <button class="big-tile" onclick="setView('days')">Complete days out</button>
      <button class="big-tile" onclick="randomDay()">Surprise me</button>
      <button class="big-tile" onclick="setView('food')">Food decoder</button>
      <button class="big-tile" onclick="setView('phrases')">Greek phrases</button>
      <button class="big-tile" onclick="setView('journal')">Holiday journal</button>
    </section>

    <section>
      <h2>Best quick wins from your hotel</h2>
      <div class="cards">
        ${APP.locations.filter(p => p.tags.includes("nearby")).map(locationCard).join("")}
      </div>
    </section>
  `;
}

function renderPlaces(filter = "all") {
  const types = ["all", ...new Set(APP.locations.map(p => p.type))];
  const places = filter === "all" ? APP.locations : APP.locations.filter(p => p.type === filter);

  return `
    <section>
      <h1>Places</h1>
      <p>Everything has a Google Maps button so you can navigate straight there.</p>
      <div class="filter-row">
        ${types.map(type => `
          <button class="${filter === type ? "active" : ""}" onclick="renderPlacesToApp('${type}')">${type}</button>
        `).join("")}
      </div>
      <div class="cards">
        ${places.map(locationCard).join("")}
      </div>
    </section>
  `;
}

function renderPlacesToApp(filter) {
  document.getElementById("app").innerHTML = renderPlaces(filter);
}

function renderDays() {
  return `
    <section>
      <h1>Complete days out</h1>
      <p>Not strict itineraries. Just ready made ideas for the mornings when nobody wants to think.</p>
      <div class="cards">
        ${APP.days.map(day => {
          const places = day.route.map(name => APP.locations.find(p => p.name === name)).filter(Boolean);
          return `
            <article class="card day-card">
              <p class="eyebrow">${day.mood}</p>
              <h3>${day.title}</h3>
              <ol>
                ${day.plan.map(step => `<li>${step}</li>`).join("")}
              </ol>
              <h4>Stops</h4>
              <div class="mini-list">
                ${places.map(place => `
                  <a href="${place.maps}" target="_blank" rel="noopener">${place.name}</a>
                `).join("")}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function randomDay() {
  const beaches = APP.locations.filter(p => p.type === "Beach");
  const foodPlaces = APP.locations.filter(p => p.tags.includes("food"));
  const culture = APP.locations.filter(p => ["History", "Viewpoint", "Village", "Wine", "Beer"].includes(p.type));

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const morning = pick(culture);
  const lunch = pick(foodPlaces);
  const afternoon = pick(beaches);
  const evening = pick(foodPlaces);

  document.getElementById("app").innerHTML = `
    <section>
      <h1>Surprise day</h1>
      <p>A generated plan. Refresh it until it feels right.</p>
      <div class="card">
        <h3>Today's adventure</h3>
        <div class="timeline">
          <div><strong>Morning</strong><br>${morning.name}<br>${googleLink(morning)}</div>
          <div><strong>Lunch</strong><br>${lunch.name}<br>${googleLink(lunch)}</div>
          <div><strong>Afternoon</strong><br>${afternoon.name}<br>${googleLink(afternoon)}</div>
          <div><strong>Evening</strong><br>${evening.name}<br>${googleLink(evening)}</div>
        </div>
        <button class="primary-btn" onclick="randomDay()">Generate another</button>
      </div>
    </section>
  `;
  window.scrollTo(0, 0);
}

function renderFood() {
  return `
    <section>
      <h1>Food decoder</h1>
      <p>Greek words, rough pronunciation and what they mean when you see them on a menu.</p>
      <div class="cards">
        ${APP.food.map(item => `
          <article class="card">
            <p class="eyebrow">${item[1]}</p>
            <h3>${item[0]}</h3>
            <p>${item[2]}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPhrases() {
  return `
    <section>
      <h1>Greek phrase cards</h1>
      <p>Tap and show the screen if pronunciation fails you.</p>
      <div class="cards">
        ${APP.phrases.map(item => `
          <article class="card phrase-card">
            <p class="eyebrow">${item[0]}</p>
            <h3>${item[1]}</h3>
            <p>${item[2]}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTrackers() {
  const favourites = APP.locations.filter(p => isSaved("favourites", p.name));
  const visited = APP.locations.filter(p => isSaved("visited", p.name));

  return `
    <section>
      <h1>Trackers</h1>
      <div class="two-col">
        <div>
          <h2>Favourites</h2>
          <div class="cards">
            ${favourites.length ? favourites.map(locationCard).join("") : "<p>No favourites yet.</p>"}
          </div>
        </div>
        <div>
          <h2>Visited</h2>
          <div class="cards">
            ${visited.length ? visited.map(locationCard).join("") : "<p>No visited places yet.</p>"}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderJournal() {
  const entries = APP.saved.journal || [];

  return `
    <section>
      <h1>Holiday journal</h1>
      <p>Save little memories as you go. Stored on this device only.</p>
      <div class="card">
        <label>Date</label>
        <input id="journalDate" type="date">
        <label>Where did you go?</label>
        <input id="journalWhere" placeholder="Potami, Kokkari, Pythagoreio...">
        <label>Best food or drink</label>
        <input id="journalFood" placeholder="Octopus, Muscat, Samos Beer...">
        <label>Best Rocco moment</label>
        <input id="journalRocco" placeholder="Something funny he said or did">
        <label>Notes</label>
        <textarea id="journalNotes" placeholder="Anything else worth remembering"></textarea>
        <button class="primary-btn" onclick="saveJournalEntry()">Save memory</button>
      </div>

      <div class="cards">
        ${entries.length ? entries.map((entry, index) => `
          <article class="card">
            <p class="eyebrow">${entry.date || "Holiday memory"}</p>
            <h3>${entry.where || "Samos"}</h3>
            <p><strong>Food or drink:</strong> ${entry.food || ""}</p>
            <p><strong>Rocco:</strong> ${entry.rocco || ""}</p>
            <p>${entry.notes || ""}</p>
            <button class="secondary-btn" onclick="deleteJournalEntry(${index})">Delete</button>
          </article>
        `).join("") : "<p>No memories saved yet.</p>"}
      </div>
    </section>
  `;
}

function saveJournalEntry() {
  const entry = {
    date: document.getElementById("journalDate").value,
    where: document.getElementById("journalWhere").value,
    food: document.getElementById("journalFood").value,
    rocco: document.getElementById("journalRocco").value,
    notes: document.getElementById("journalNotes").value
  };

  APP.saved.journal = APP.saved.journal || [];
  APP.saved.journal.unshift(entry);
  saveState();
  setView("journal");
}

function deleteJournalEntry(index) {
  APP.saved.journal.splice(index, 1);
  saveState();
  setView("journal");
}

function renderPractical() {
  return `
    <section>
      <h1>Practical Samos</h1>
      <div class="cards">
        <article class="card">
          <h3>Nearest useful searches</h3>
          <div class="mini-list">
            <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=pharmacy+near+Erato+by+Samian+Mare">Nearest pharmacy</a>
            <a target="_blank" rel="noopener" href="https://www.g
