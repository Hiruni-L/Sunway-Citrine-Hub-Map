const mapWorld = document.getElementById("mapWorld");
const poiLayer = document.getElementById("poiLayer");
const mallLayer = document.getElementById("mallLayer");
const resetBtn = document.getElementById("resetBtn");
const trees = document.getElementById("trees");
const filterChips = document.querySelectorAll(".filter-chip");

const detailOverlay = document.getElementById("detailOverlay");
const detailPage    = document.getElementById("detailPage");
const detailArt     = document.getElementById("detailArt");
const artIcon       = document.getElementById("artIcon");
const artBgShapes   = document.getElementById("artBgShapes");
const detailText    = document.getElementById("detailText");
const detailBackBtn = document.getElementById("detailBackBtn");

let currentLayer = "main";
let overlayOpen   = false;
let inMallView    = false;

const mapCanvas = document.getElementById("mapCanvas");

let view = { x: 0, y: 0, scale: 1 };
let drag = { active: false, startX: 0, startY: 0, originX: 0, originY: 0 };

/* ─── POI Data ───────────────────────────────────── */

const pois = [
  {
    id: "walkway",
    marker: "W",
    category: "access",
    icon: "🚶",
    color: "#157347",
    artPalette: ["#176b42", "#2d9e62", "#b7e183", "#edffd6"],
    x: 800, y: 345,
    title: "Shaded Walkway",
    subtitle: "Pathway between Emerald Lake and Citrine Hub",
    body: "A cool, shaded pedestrian route connects Emerald Lake to Citrine Hub. Trees and covered walking areas make the journey comfortable during the day.",
    highlights: ["Shaded by mature trees", "Cooler walking experience", "Safe lake-to-hub connection", "Encourages visitors to explore both places"]
  },
  {
    id: "signage",
    marker: "S",
    category: "access",
    icon: "➜",
    color: "#235aa8",
    artPalette: ["#174ea6", "#2d6fd4", "#9ed4ff", "#e8f4ff"],
    x: 160, y: 330,
    title: "Directional Signage Posts",
    subtitle: "Wayfinding around Emerald Lake",
    body: "Signage posts around the lake guide visitors toward Citrine Hub, helping them discover nearby food, shopping, and facilities.",
    highlights: ["Clear directions to Citrine Hub", "Placed around lake entrances", "Improves visitor movement", "Encourages cross-visitation"]
  },
  {
    id: "picnic",
    marker: "P",
    category: "leisure",
    icon: "🧺",
    color: "#b76b12",
    artPalette: ["#b76b12", "#e08c30", "#ffe2a3", "#fffbee"],
    x: 465, y: 170,
    title: "Picnic Spots",
    subtitle: "Lake picnic experience supported by Citrine Hub",
    body: "Visitors can enjoy picnic spots around Emerald Lake and rent or purchase picnic baskets from Jaya Grocer at Citrine Hub.",
    highlights: ["Picnic basket rental concept", "Supported by Jaya Grocer", "Encourages longer lake visits", "Links outdoor leisure with mall retail"]
  },
  {
    id: "foodtruck",
    marker: "F",
    category: "food",
    icon: "🚚",
    color: "#7b3fb1",
    artPalette: ["#7433a8", "#9b5fcc", "#ffcc70", "#fff6e0"],
    x: 185, y: 600,
    title: "Food Trucks & Pop-Up Stalls",
    subtitle: "Parking lot activation",
    body: "The parking lot can host food trucks, pop-up stalls, and night market events to create evening activity and attract more visitors.",
    highlights: ["Food truck zone", "Weekend pop-up stalls", "Night market potential", "Activates underused parking space"]
  },
  {
    id: "hub",
    marker: "H",
    category: "retail",
    icon: "🏢",
    color: "#087f5b",
    x: 815, y: 520,
    entersMall: true
  }
];

const mallPois = [
  {
    id: "lighting",
    marker: "L",
    category: "retail",
    icon: "💡",
    color: "#e0a800",
    artPalette: ["#c48600", "#e0a800", "#fff3bf", "#fffde8"],
    x: 735, y: 500,
    title: "Improved Shop Lighting",
    subtitle: "Brighter, warmer, and more welcoming interiors",
    body: "Lighting inside the shops is upgraded to make products easier to see and create a more inviting shopping environment.",
    highlights: ["Brighter shopfront visibility", "Warmer customer experience", "Improves product display", "Makes corridors feel more active"]
  },
  {
    id: "storefront",
    marker: "R",
    category: "retail",
    icon: "🏬",
    color: "#0d6efd",
    artPalette: ["#0a4fb5", "#0d6efd", "#b6d4fe", "#eef4ff"],
    x: 895, y: 515,
    title: "Redesigned Storefronts",
    subtitle: "Cleaner, more attractive retail identity",
    body: "Storefront designs are refreshed so shops look more modern, consistent, and visually attractive to visitors.",
    highlights: ["Modernized shop facade", "Clearer retail identity", "More attractive mall walkways", "Encourages browsing and discovery"]
  }
];

/* ─── Trees ──────────────────────────────────────── */

function createTrees() {
  const positions = [
    [80,120],[135,100],[250,105],[650,90],[760,120],[980,135],
    [1050,210],[70,250],[225,385],[315,455],[545,435],[850,265],
    [1030,365],[110,485],[330,545],[540,590],[610,675],[1050,610],
    [575,105],[720,230],[965,80],[95,610],[440,115],[705,675]
  ];
  positions.forEach(([x, y]) => {
    const tree = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tree.setAttribute("class", "tree");
    tree.innerHTML = `
      <rect class="trunk" x="${x-5}" y="${y+18}" width="10" height="28" rx="3"></rect>
      <circle class="leaf" cx="${x}" cy="${y}" r="24"></circle>
      <circle class="leaf" cx="${x-18}" cy="${y+10}" r="18"></circle>
      <circle class="leaf" cx="${x+18}" cy="${y+10}" r="18"></circle>
    `;
    trees.appendChild(tree);
  });
}

/* ─── POI Rendering ──────────────────────────────── */

function renderPois(items, layer) {
  const target = layer === "main" ? poiLayer : mallLayer;
  items.forEach((poi) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("poi");
    group.dataset.id = poi.id;
    group.dataset.layer = layer;
    group.dataset.category = poi.category;
    group.setAttribute("transform", `translate(${poi.x}, ${poi.y})`);
    group.innerHTML = `
      <circle r="36" fill="${poi.color}"></circle>
      <text y="2">${poi.marker}</text>
    `;
    group.addEventListener("click", (e) => {
      e.stopPropagation();
      handlePoiClick(poi, layer, group);
    });
    target.appendChild(group);
  });
}

/* ─── Click handler ──────────────────────────────── */

function handlePoiClick(poi, layer, groupEl) {
  if (overlayOpen) return;

  if (poi.entersMall) {
    enterMallView(groupEl);
    return;
  }

  // Get the icon's exact centre in screen coordinates
  const circle = groupEl.querySelector("circle");
  const rect   = circle.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;

  openDetailPage(poi, cx, cy);
}

/* ─── Mall enter / exit ──────────────────────────── */

function enterMallView(groupEl) {
  // Zoom so the hub icon is centred on screen
  const circle = groupEl.querySelector("circle");
  const rect   = circle.getBoundingClientRect();
  const iconCX = rect.left + rect.width  / 2;
  const iconCY = rect.top  + rect.height / 2;

  const canvasRect = mapCanvas.getBoundingClientRect();
  const targetScale = 1.9;

  // Convert icon screen position back to SVG-space coordinates, then zoom to centre there
  // Icon screen pos relative to canvas
  const relX = iconCX - canvasRect.left;
  const relY = iconCY - canvasRect.top;

  // Current SVG position of the icon in canvas-space = (relX - view.x) / view.scale
  const svgX = (relX - view.x) / view.scale;
  const svgY = (relY - view.y) / view.scale;

  // New translate so svgX/Y maps to the canvas centre
  const newX = canvasRect.width  / 2 - svgX * targetScale;
  const newY = canvasRect.height / 2 - svgY * targetScale;

  view.scale = targetScale;
  view.x = newX;
  view.y = newY;

  mapWorld.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
  mapWorld.style.transform  = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;

  inMallView = true;
  currentLayer = "mall";
  poiLayer.classList.add("hidden");
  mallLayer.classList.remove("hidden");
}

function exitMallView() {
  inMallView = false;
  currentLayer = "main";
  view = { x: 0, y: 0, scale: 1 };
  mapWorld.style.transition = "transform 0.55s ease";
  mapWorld.style.transform  = "translate(0px, 0px) scale(1)";
  poiLayer.classList.remove("hidden");
  mallLayer.classList.add("hidden");
}

// Click anywhere on the map canvas (not on a POI) while in mall view → exit
mapCanvas.addEventListener("click", (e) => {
  if (inMallView && !e.target.closest(".poi")) {
    exitMallView();
  }
});

/* ─── Zoom-dissolve into detail page ─────────────── */

function openDetailPage(poi, originScreenX, originScreenY) {
  overlayOpen = true;

  buildArtPanel(poi);
  buildInfoPanel(poi);

  detailPage.classList.remove("is-visible", "is-hiding");
  detailOverlay.classList.add("is-active");

  // --- Correct zoom math ---
  // We want the map to zoom in so the clicked icon ends up filling/centring the screen.
  // originScreenX/Y is the icon's current screen position.
  // After applying newScale and newTranslate, the icon should sit at screen centre.
  const canvasRect = mapCanvas.getBoundingClientRect();

  // Icon position relative to the canvas element
  const relX = originScreenX - canvasRect.left;
  const relY = originScreenY - canvasRect.top;

  // Corresponding SVG coordinate (undo current view transform)
  const svgX = (relX - view.x) / view.scale;
  const svgY = (relY - view.y) / view.scale;

  // Target: zoom way in so that SVG point maps to canvas centre
  const zoomScale = 14;
  const destX = canvasRect.width  / 2 - svgX * zoomScale;
  const destY = canvasRect.height / 2 - svgY * zoomScale;

  mapWorld.style.transition = "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease 0.25s";
  mapWorld.style.transform  = `translate(${destX}px, ${destY}px) scale(${zoomScale})`;
  mapWorld.style.opacity    = "0";

  // Dissolve in the detail page as the map fades
  setTimeout(() => {
    detailPage.classList.add("is-visible");
  }, 350);

  setTimeout(() => {
    mapCanvas.style.visibility = "hidden";
  }, 700);
}

function closeDetailPage() {
  if (!overlayOpen) return;

  detailPage.classList.remove("is-visible");
  detailPage.classList.add("is-hiding");

  // Restore map: start zoomed in, then ease back to normal
  mapCanvas.style.visibility = "visible";
  mapWorld.style.transition  = "none";
  mapWorld.style.transform   = "translate(0px, 0px) scale(10)";
  mapWorld.style.opacity     = "0";

  // If we came from the mall layer, restore that state; otherwise go to main
  const restoreInMall = inMallView;

  setTimeout(() => {
    mapWorld.style.transition = "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease 0.1s";
    if (restoreInMall) {
      mapWorld.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    } else {
      mapWorld.style.transform = "translate(0px, 0px) scale(1)";
    }
    mapWorld.style.opacity = "1";
  }, 60);

  setTimeout(() => {
    overlayOpen = false;
    detailPage.classList.remove("is-visible", "is-hiding");
    detailOverlay.classList.remove("is-active");
    mapWorld.style.transition = "";
    mapWorld.style.opacity    = "";
  }, 750);
}

detailBackBtn.addEventListener("click", closeDetailPage);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (overlayOpen)   closeDetailPage();
    else if (inMallView) exitMallView();
  }
});

/* ─── Art & info builders ────────────────────────── */

function buildArtPanel(poi) {
  const [c1, c2, c3, c4] = poi.artPalette;
  detailArt.style.background = `linear-gradient(145deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)`;
  artBgShapes.innerHTML = `
    <svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg"
         style="position:absolute;inset:0;width:100%;height:100%;opacity:0.22;">
      <circle cx="80"  cy="120" r="200" fill="${c4}"/>
      <circle cx="520" cy="600" r="260" fill="${c1}" opacity="0.5"/>
      <ellipse cx="320" cy="350" rx="180" ry="280" fill="${c3}" opacity="0.3"/>
      <polygon points="0,700 300,340 600,700" fill="${c2}" opacity="0.35"/>
      <circle cx="480" cy="90"  r="110" fill="${c3}" opacity="0.5"/>
    </svg>
    <svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg"
         style="position:absolute;inset:0;width:100%;height:100%;opacity:0.14;">
      <line x1="0"   y1="0"   x2="600" y2="700" stroke="${c4}" stroke-width="80"/>
      <line x1="600" y1="0"   x2="0"   y2="700" stroke="${c4}" stroke-width="40"/>
      <circle cx="300" cy="350" r="220" fill="none" stroke="${c4}" stroke-width="60"/>
    </svg>
  `;
  artIcon.textContent = poi.icon;
}

function buildInfoPanel(poi) {
  detailText.innerHTML = `
    <p class="eyebrow">${poi.subtitle}</p>
    <h2>${poi.title}</h2>
    <p class="body-text">${poi.body}</p>
    <div class="pill-list">
      ${poi.highlights.map(item => `<div class="pill">${item}</div>`).join("")}
    </div>
  `;
}

/* ─── Filters ────────────────────────────────────── */

function filterPois(category) {
  document.querySelectorAll(".poi").forEach((marker) => {
    const isVisible = category === "all" || marker.dataset.category === category;
    marker.classList.toggle("is-filtered", !isVisible);
  });
}

function resetFilters() {
  filterChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === "all");
  });
  filterPois("all");
}

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    filterPois(chip.dataset.filter);
  });
});

/* ─── Map pan ────────────────────────────────────── */

function applyView(animate = true) {
  mapWorld.style.transition = animate ? "transform .55s ease" : "none";
  mapWorld.style.transform  = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

function resetMap() {
  if (overlayOpen) {
    closeDetailPage();
    setTimeout(doReset, 780);
  } else {
    doReset();
  }
}

function doReset() {
  inMallView = false;
  currentLayer = "main";
  mapCanvas.style.visibility = "visible";
  mapWorld.style.opacity     = "";
  mapWorld.style.transition  = "";
  view = { x: 0, y: 0, scale: 1 };
  applyView(true);
  resetFilters();
  poiLayer.classList.remove("hidden");
  mallLayer.classList.add("hidden");
}

resetBtn.addEventListener("click", resetMap);

mapCanvas.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".poi")) return;
  drag.active = true;
  drag.startX = event.clientX;
  drag.startY = event.clientY;
  drag.originX = view.x;
  drag.originY = view.y;
  mapCanvas.classList.add("is-dragging");
  mapCanvas.setPointerCapture(event.pointerId);
});

mapCanvas.addEventListener("pointermove", (event) => {
  if (!drag.active) return;
  view.x = drag.originX + event.clientX - drag.startX;
  view.y = drag.originY + event.clientY - drag.startY;
  applyView(false);
});

mapCanvas.addEventListener("pointerup", (event) => {
  drag.active = false;
  mapCanvas.classList.remove("is-dragging");
  mapCanvas.releasePointerCapture(event.pointerId);
});

mapCanvas.addEventListener("pointercancel", () => {
  drag.active = false;
  mapCanvas.classList.remove("is-dragging");
});

/* ─── Init ───────────────────────────────────────── */

createTrees();
renderPois(pois, "main");
renderPois(mallPois, "mall");
