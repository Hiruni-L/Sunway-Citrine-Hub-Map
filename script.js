const mapWorld = document.getElementById("mapWorld");
const poiLayer = document.getElementById("poiLayer");
const mallLayer = document.getElementById("mallLayer");
const detailsContent = document.getElementById("detailsContent");
const resetBtn = document.getElementById("resetBtn");
const backBtn = document.getElementById("backBtn");
const trees = document.getElementById("trees");

let currentLayer = "main";

const mapCanvas = document.getElementById("mapCanvas");

let view = {
  x: 0,
  y: 0,
  scale: 1
};

let drag = {
  active: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0
};

const pois = [
  {
    id: "walkway",
    icon: "🚶",
    color: "#157347",
    x: 800,
    y: 345,
    focus: { x: 800, y: 345, scale: 1.65 },
    title: "Shaded Walkway",
    subtitle: "Pathway between Emerald Lake and Citrine Hub",
    body: "A cool, shaded pedestrian route connects Emerald Lake to Citrine Hub. Trees and covered walking areas make the journey comfortable during the day.",
    highlights: ["Shaded by mature trees", "Cooler walking experience", "Safe lake-to-hub connection", "Encourages visitors to explore both places"]
  },
  {
    id: "signage",
    icon: "➜",
    color: "#235aa8",
    x: 160,
    y: 330,
    focus: { x: 160, y: 330, scale: 1.65 },
    title: "Directional Signage Posts",
    subtitle: "Wayfinding around Emerald Lake",
    body: "Signage posts around the lake guide visitors toward Citrine Hub, helping them discover nearby food, shopping, and facilities.",
    highlights: ["Clear directions to Citrine Hub", "Placed around lake entrances", "Improves visitor movement", "Encourages cross-visitation"]
  },
  {
    id: "picnic",
    icon: "🧺",
    color: "#b76b12",
    x: 465,
    y: 170,
    focus: { x: 465, y: 170, scale: 1.75 },
    title: "Picnic Spots",
    subtitle: "Lake picnic experience supported by Citrine Hub",
    body: "Visitors can enjoy picnic spots around Emerald Lake and rent or purchase picnic baskets from Jaya Grocer at Citrine Hub.",
    highlights: ["Picnic basket rental concept", "Supported by Jaya Grocer", "Encourages longer lake visits", "Links outdoor leisure with mall retail"]
  },
  {
    id: "foodtruck",
    icon: "🚚",
    color: "#7b3fb1",
    x: 185,
    y: 600,
    focus: { x: 185, y: 600, scale: 1.75 },
    title: "Food Trucks & Pop-Up Stalls",
    subtitle: "Parking lot activation",
    body: "The parking lot can host food trucks, pop-up stalls, and night market events to create evening activity and attract more visitors.",
    highlights: ["Food truck zone", "Weekend pop-up stalls", "Night market potential", "Activates underused parking space"]
  },
  {
    id: "hub",
    icon: "🏢",
    color: "#087f5b",
    x: 815,
    y: 520,
    focus: { x: 815, y: 520, scale: 1.9 },
    title: "Citrine Hub",
    subtitle: "Mall improvement layer",
    body: "Zoom into Citrine Hub to view the proposed interior improvements, including better lighting and redesigned storefronts.",
    highlights: ["Improved mall atmosphere", "Clearer shop visibility", "Better visitor experience", "Click hub to enter the second layer"],
    entersMall: true
  }
];

const mallPois = [
  {
    id: "lighting",
    icon: "💡",
    color: "#e0a800",
    x: 735,
    y: 500,
    focus: { x: 735, y: 500, scale: 2.4 },
    title: "Improved Shop Lighting",
    subtitle: "Brighter, warmer, and more welcoming interiors",
    body: "Lighting inside the shops is upgraded to make products easier to see and create a more inviting shopping environment.",
    highlights: ["Brighter shopfront visibility", "Warmer customer experience", "Improves product display", "Makes corridors feel more active"]
  },
  {
    id: "storefront",
    icon: "🏬",
    color: "#0d6efd",
    x: 895,
    y: 515,
    focus: { x: 895, y: 515, scale: 2.4 },    title: "Redesigned Storefronts",
    subtitle: "Cleaner, more attractive retail identity",
    body: "Storefront designs are refreshed so shops look more modern, consistent, and visually attractive to visitors.",
    highlights: ["Modernized shop facade", "Clearer retail identity", "More attractive mall walkways", "Encourages browsing and discovery"]
  }
];

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
      <rect class="trunk" x="${x - 5}" y="${y + 18}" width="10" height="28" rx="3"></rect>
      <circle class="leaf" cx="${x}" cy="${y}" r="24"></circle>
      <circle class="leaf" cx="${x - 18}" cy="${y + 10}" r="18"></circle>
      <circle class="leaf" cx="${x + 18}" cy="${y + 10}" r="18"></circle>
    `;
    trees.appendChild(tree);
  });
}

function renderPois(items, layer) {
  const target = layer === "main" ? poiLayer : mallLayer;

  items.forEach((poi) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("poi");
    group.dataset.id = poi.id;
    group.dataset.layer = layer;
    group.setAttribute("transform", `translate(${poi.x}, ${poi.y})`);
    group.innerHTML = `
      <circle r="36" fill="${poi.color}"></circle>
      <text y="2">${poi.icon}</text>
    `;
    group.addEventListener("click", () => selectPoi(poi, layer));
    target.appendChild(group);
  });
}

function selectPoi(poi, layer) {
  zoomTo(poi.focus.x, poi.focus.y, poi.focus.scale);
  showDetails(poi);

  if (poi.entersMall) {
    currentLayer = "mall";
    poiLayer.classList.add("hidden");
    mallLayer.classList.remove("hidden");
    backBtn.classList.remove("hidden");
  }
}

function showDetails(poi) {
  sidePanel.classList.remove("hidden");

  detailsContent.innerHTML = `
    <p class="eyebrow">${poi.subtitle}</p>
    <h2>${poi.title}</h2>
    <p>${poi.body}</p>
    <div class="pill-list">
      ${poi.highlights.map(item => `<div class="pill">✓ ${item}</div>`).join("")}
    </div>
  `;
}

function getImageGradient(id) {
  const images = {
    walkway: "linear-gradient(135deg, #176b42, #b7e183)",
    signage: "linear-gradient(135deg, #174ea6, #9ed4ff)",
    picnic: "linear-gradient(135deg, #b76b12, #ffe2a3)",
    foodtruck: "linear-gradient(135deg, #7433a8, #ffcc70)",
    hub: "linear-gradient(135deg, #0f5132, #b8e4d2)",
    lighting: "linear-gradient(135deg, #ffbf00, #fff3bf)",
    storefront: "linear-gradient(135deg, #0d6efd, #b6d4fe)"
  };

  return images[id] || "linear-gradient(135deg, #0f5132, #d8f3dc)";
}

const sidePanel = document.getElementById("sidePanel");
const closePanel = document.getElementById("closePanel");

function closeSidePanel() {
  sidePanel.classList.add("hidden");
  currentLayer = "main";
  resetView();

  poiLayer.classList.remove("hidden");
  mallLayer.classList.add("hidden");
  backBtn.classList.add("hidden");
}

closePanel.addEventListener("click", closeSidePanel);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidePanel();
  }
});

function applyView(animate = true) {
  mapWorld.style.transition = animate ? "transform .55s ease" : "none";
  mapWorld.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

function zoomTo(x, y, scale) {
  const canvasRect = mapCanvas.getBoundingClientRect();
  const centerX = canvasRect.width / 2;
  const centerY = canvasRect.height / 2;

  view.scale = scale;
  view.x = centerX - x * scale;
  view.y = centerY - y * scale;

  applyView(true);
}

function resetView() {
  view = {
    x: 0,
    y: 0,
    scale: 1
  };

  applyView(true);
}

function resetMap() {
  currentLayer = "main";
  resetView();

  poiLayer.classList.remove("hidden");
  mallLayer.classList.add("hidden");
  backBtn.classList.add("hidden");

  if (sidePanel) {
    sidePanel.classList.add("hidden");
  }
}

createTrees();
renderPois(pois, "main");
renderPois(mallPois, "mall");

resetBtn.addEventListener("click", resetMap);
backBtn.addEventListener("click", resetMap);

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