(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     POI DATA
     x / y are percentage positions on the map image.
     Adjust these values if you want to move any pin.
  ═══════════════════════════════════════════════════════ */
  const POIS = [
    {
      id: 'p1',
      category: 'access',
      emoji: '🅿️',
      color: '#235aa8',
      x: 56.5, y: 26.0,
      title: 'Main Car Park',
      eyebrow: 'Access · Parking',
      body: 'The main car park provides over 80 spaces for visitors, including designated accessible bays. Entry is via the northern approach road through the roundabout.',
      pills: [
        '🕖 Open 7 am – 9 pm daily',
        '🚗 80+ vehicle spaces',
        '♿ Accessible bays available',
        '⚡ EV charging points coming soon',
      ],
      artColor: '#1a4a8a',
    },
    {
      id: 'p2',
      category: 'retail',
      emoji: '🏬',
      color: '#087f5b',
      x: 78.5, y: 17.5,
      title: 'Citrine Hub',
      eyebrow: 'Retail · Community Hub',
      body: 'Citrine Hub is the central retail and community anchor of the park, hosting local boutiques, a café, a visitor information centre, and flexible event spaces.',
      pills: [
        '🕘 Mon – Sun: 9 am – 8 pm',
        'ℹ️ Visitor information inside',
        '♿ Fully wheelchair accessible',
        '🎪 Event hire available',
      ],
      artColor: '#054d36',
    },
    {
      id: 'p3',
      category: 'food',
      emoji: '🍜',
      color: '#7b3fb1',
      x: 64.0, y: 38.5,
      title: 'Food Pop-Up Zone',
      eyebrow: 'Food · Pop-Up Stalls',
      body: 'A rotating selection of food vendors gathers here on weekends and public holidays, offering local street food, artisan coffee, and fresh juices.',
      pills: [
        '📅 Weekends & public holidays',
        '🏪 6 – 12 vendors rotating weekly',
        '💺 Seating for 80+ guests',
        '💳 Cashless payments accepted',
      ],
      artColor: '#5a2a8a',
    },
    {
      id: 'p4',
      category: 'access',
      emoji: '🌿',
      color: '#3cb344',
      x: 72.0, y: 50.5,
      title: 'Shaded walkway',
      eyebrow: 'Shade · Walkway path',
      body: 'A shaded walkway to provide visitors a comfortable journey back and forth from mall to the lake.',
      pills: [''
      ],
      artColor: '#3cb344',
    },
    {
      id: 'p5',
      category: 'leisure',
      emoji: '🧺',
      color: '#b76b12',
      x: 31.0, y: 47.5,
      title: 'Picnic Lawn',
      eyebrow: 'Leisure · Picnic Area',
      body: 'A shaded picnic area with lush grass, picnic tables, and nearby BBQ facilities — perfect for families and groups relaxing by the upper lake.',
      pills: [
        '🪑 Picnic tables provided',
        '🔥 BBQ grills available (book ahead)',
        '🗑️ Bin stations nearby',
        '🐶 Dog-friendly zone',
      ],
      artColor: '#8a4d0a',
    },
    {
      id: 'p6',
      category: 'access',
      emoji: '🪧',
      color: '#235aa8',
      x: 9.0, y: 32.0,
      title: 'Wayfinding Sign',
      eyebrow: 'Access · Wayfinding',
      body: 'Directional signage at the western entrance helping visitors navigate to the lake loop, picnic areas, and the main car park.',
      pills: [
        '🗺️ Directions to all key areas',
        '📱 QR code for digital map',
        '🚨 Emergency contact displayed',
      ],
      artColor: '#1a4a8a',
    },
  ];

  /* ═══════════════════════════════════════════════════════
     DOM REFERENCES
  ═══════════════════════════════════════════════════════ */
  const canvas      = document.getElementById('mapCanvas');
  const world       = document.getElementById('mapWorld');
  const mapImg      = document.getElementById('mapImage');
  const poiLayer    = document.getElementById('poiLayer');
  const filterBtns  = document.querySelectorAll('.filter-chip');
  const resetBtn    = document.getElementById('resetBtn');
  const overlay     = document.getElementById('detailOverlay');
  const detailPage  = document.getElementById('detailPage');
  const backBtn     = document.getElementById('detailBackBtn');
  const detailText  = document.getElementById('detailText');
  const artIconEl   = document.getElementById('artIcon');
  const artBgShapes = document.getElementById('artBgShapes');
  const detailArt   = document.querySelector('.detail-art');

  /* ═══════════════════════════════════════════════════════
     PAN / ZOOM STATE
  ═══════════════════════════════════════════════════════ */
  let tx = 0, ty = 0, scale = 1;
  const MIN_SCALE = 0.4, MAX_SCALE = 4.0;

  function applyTransform(noAnim) {
    if (noAnim) world.style.transition = 'none';
    world.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }

  /* ─── Mouse Drag ───────────────────────────────────── */
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let originT   = { tx: 0, ty: 0 };

  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    originT   = { tx, ty };
    canvas.classList.add('is-dragging');
    world.style.transition = 'none';
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    tx = originT.tx + (e.clientX - dragStart.x);
    ty = originT.ty + (e.clientY - dragStart.y);
    world.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove('is-dragging');
    world.style.transition = 'transform .55s ease';
  });

  /* ─── Touch Drag & Pinch Zoom ──────────────────────── */
  let prevTouches = null;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touches = getTouches(e);
    if (touches.length === 1) {
      dragging  = true;
      dragStart = { x: touches[0].x, y: touches[0].y };
      originT   = { tx, ty };
    }
    prevTouches = touches;
    world.style.transition = 'none';
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touches = getTouches(e);

    if (touches.length === 1 && dragging) {
      tx = originT.tx + (touches[0].x - dragStart.x);
      ty = originT.ty + (touches[0].y - dragStart.y);
    } else if (touches.length === 2 && prevTouches && prevTouches.length === 2) {
      const prevDist = dist(prevTouches[0], prevTouches[1]);
      const newDist  = dist(touches[0],     touches[1]);
      const ratio    = newDist / prevDist;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * ratio));
      const rect = canvas.getBoundingClientRect();
      const cx   = ((touches[0].x + touches[1].x) / 2) - rect.left;
      const cy   = ((touches[0].y + touches[1].y) / 2) - rect.top;
      tx    = cx - (cx - tx) * (newScale / scale);
      ty    = cy - (cy - ty) * (newScale / scale);
      scale = newScale;
    }

    prevTouches = touches;
    world.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    if (e.touches.length === 0) {
      dragging    = false;
      prevTouches = null;
      world.style.transition = 'transform .55s ease';
    } else {
      prevTouches = getTouches(e);
    }
  });

  function getTouches(e) {
    return Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /* ─── Wheel Zoom ───────────────────────────────────── */
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor   = e.deltaY < 0 ? 1.12 : 0.9;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    const rect     = canvas.getBoundingClientRect();
    const px       = e.clientX - rect.left;
    const py       = e.clientY - rect.top;
    tx    = px - (px - tx) * (newScale / scale);
    ty    = py - (py - ty) * (newScale / scale);
    scale = newScale;
    world.style.transition = 'none';
    world.style.transform  = `translate(${tx}px,${ty}px) scale(${scale})`;
  }, { passive: false });

  /* ─── Reset Button ─────────────────────────────────── */
  resetBtn.addEventListener('click', () => {
    tx = 0; ty = 0; scale = 1;
    world.style.transition = 'transform .55s ease';
    world.style.transform  = 'translate(0px,0px) scale(1)';
  });

  /* ═══════════════════════════════════════════════════════
     BUILD POI MARKERS
  ═══════════════════════════════════════════════════════ */
  function renderPOIs() {
    poiLayer.innerHTML = '';
    POIS.forEach(poi => {
      const btn = document.createElement('button');
      btn.className            = 'poi';
      btn.id                   = `poi-${poi.id}`;
      btn.dataset.category     = poi.category;
      btn.setAttribute('aria-label', poi.title);
      btn.style.left           = `${poi.x}%`;
      btn.style.top            = `${poi.y}%`;
      btn.style.background     = poi.color;
      btn.innerHTML            = `<span>${poi.emoji}</span>`;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDetail(poi);
      });
      poiLayer.appendChild(btn);
    });
  }

  if (mapImg.complete && mapImg.naturalWidth > 0) {
    renderPOIs();
  } else {
    mapImg.addEventListener('load', renderPOIs);
  }

  /* ═══════════════════════════════════════════════════════
     CATEGORY FILTER
  ═══════════════════════════════════════════════════════ */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.poi').forEach(el => {
        const match = f === 'all' || el.dataset.category === f;
        el.classList.toggle('is-filtered', !match);
      });
    });
  });

  /* ═══════════════════════════════════════════════════════
     DETAIL OVERLAY
  ═══════════════════════════════════════════════════════ */
  function openDetail(poi) {
    artIconEl.textContent      = poi.emoji;
    detailArt.style.background = poi.artColor;
    artBgShapes.innerHTML      = bgShapes();

    detailText.innerHTML = `
      <p class="eyebrow">${poi.eyebrow}</p>
      <h2>${poi.title}</h2>
      <p class="body-text">${poi.body}</p>
      <div class="pill-list">
        ${poi.pills.map(p => `<div class="pill">${p}</div>`).join('')}
      </div>`;

    overlay.classList.add('is-active');
    overlay.removeAttribute('aria-hidden');
    detailPage.classList.remove('is-hiding');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      detailPage.classList.add('is-visible');
    }));
  }

  function closeDetail() {
    detailPage.classList.remove('is-visible');
    detailPage.classList.add('is-hiding');
    setTimeout(() => {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      detailPage.classList.remove('is-hiding');
    }, 280);
  }

  backBtn.addEventListener('click', closeDetail);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

  function bgShapes() {
    return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
              style="position:absolute;inset:0;pointer-events:none">
      <circle cx="15%" cy="85%" r="200" fill="rgba(255,255,255,0.06)"/>
      <circle cx="80%" cy="15%" r="140" fill="rgba(255,255,255,0.05)"/>
      <circle cx="55%" cy="55%" r="100" fill="rgba(0,0,0,0.05)"/>
      <circle cx="90%" cy="72%" r="70"  fill="rgba(255,255,255,0.04)"/>
    </svg>`;
  }

})();