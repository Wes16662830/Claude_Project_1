(function () {
  'use strict';

  const STORAGE_KEY = 'mara-checklist-v1';
  const THEME_KEY = 'mara-theme';
  const BIG5_IDS = SPECIES.filter(s => s.big5).map(s => s.id);

  // ---------- State ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { seen: {} };
    } catch (e) {
      return { seen: {} };
    }
  }
  let state = loadState();
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- Theme ----------
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  applyTheme(localStorage.getItem(THEME_KEY));
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // ---------- Filters ----------
  let activeCat = 'all';
  let searchTerm = '';
  let sortKey = 'name';
  let unseenOnly = false;

  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('emptyState');

  function matchesCat(s, cat) {
    if (cat === 'all') return true;
    if (cat === 'big5') return !!s.big5;
    return s.category === cat;
  }

  const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2 };

  function getFiltered() {
    let list = SPECIES.filter(s => matchesCat(s, activeCat));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.sciName.toLowerCase().includes(q));
    }
    if (unseenOnly) list = list.filter(s => !state.seen[s.id]);
    list = list.slice().sort((a, b) => {
      if (sortKey === 'rarity') return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || a.name.localeCompare(b.name);
      if (sortKey === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return list;
  }

  function cardHTML(s) {
    const seen = !!state.seen[s.id];
    return `
      <article class="card ${seen ? 'seen' : ''}" data-id="${s.id}">
        <div class="icon-wrap">
          ${renderIcon(s.icon)}
          <span class="rarity-dot">${s.rarity}</span>
          ${s.big5 ? '<span class="big5-star" title="Big Five">⭐</span>' : ''}
          <span class="seen-check">${seen ? '✓' : ''}</span>
        </div>
        <h3>${s.name}</h3>
        <p class="sci">${s.sciName}</p>
      </article>`;
  }

  function renderGrid() {
    const list = getFiltered();
    grid.innerHTML = list.map(cardHTML).join('');
    emptyState.hidden = list.length !== 0;
    grid.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.id));
    });
  }

  function updateCardVisual(id) {
    const card = grid.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;
    const seen = !!state.seen[id];
    card.classList.toggle('seen', seen);
    card.querySelector('.seen-check').textContent = seen ? '✓' : '';
  }

  // ---------- Stats ----------
  const overallCount = document.getElementById('overallCount');
  const overallRingFg = document.getElementById('overallRingFg');
  const big5Dots = document.getElementById('big5Dots');
  const RING_C = 2 * Math.PI * 17;
  overallRingFg.style.strokeDasharray = `${RING_C}`;

  function updateStats() {
    const total = SPECIES.length;
    const seenCount = Object.keys(state.seen).length;
    overallCount.textContent = `${seenCount}/${total}`;
    const frac = total ? seenCount / total : 0;
    overallRingFg.style.strokeDashoffset = `${RING_C * (1 - frac)}`;

    big5Dots.innerHTML = BIG5_IDS.map(id => {
      const sp = SPECIES.find(s => s.id === id);
      const done = !!state.seen[id];
      return `<span class="${done ? 'done' : ''}" title="${sp.name}">${done ? '✓' : ''}</span>`;
    }).join('');
  }

  function checkBig5Celebration(prevSeenIds) {
    const nowAll = BIG5_IDS.every(id => state.seen[id]);
    const beforeAll = BIG5_IDS.every(id => prevSeenIds.has(id));
    if (nowAll && !beforeAll) {
      showToast('🎉 The Big Five, complete! What a safari.');
      launchConfetti();
    }
  }

  // ---------- Toast ----------
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  // ---------- Confetti ----------
  const confettiCanvas = document.getElementById('confettiCanvas');
  function launchConfetti() {
    confettiCanvas.hidden = false;
    const ctx = confettiCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    confettiCanvas.width = innerWidth * dpr;
    confettiCanvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#e8c04a', '#b5651d', '#14532b', '#f1ecdd', '#a3352c'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * innerHeight * 0.5,
      r: 4 + Math.random() * 5,
      c: colors[Math.floor(Math.random() * colors.length)],
      vy: 2 + Math.random() * 3,
      vx: -1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    }));
    let frames = 0;
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      });
      frames++;
      if (frames < 160) requestAnimationFrame(tick);
      else confettiCanvas.hidden = true;
    }
    tick();
  }

  // ---------- Modal ----------
  const detailModal = document.getElementById('detailModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalRarity = document.getElementById('modalRarity');
  const modalBig5 = document.getElementById('modalBig5');
  const modalName = document.getElementById('modalName');
  const modalSci = document.getElementById('modalSci');
  const modalHabitat = document.getElementById('modalHabitat');
  const modalFact = document.getElementById('modalFact');
  const modalSeenCheck = document.getElementById('modalSeenCheck');
  const modalSeenLabel = document.getElementById('modalSeenLabel');
  const sightingDetails = document.getElementById('sightingDetails');
  const sightingWhen = document.getElementById('sightingWhen');
  const sightingNote = document.getElementById('sightingNote');
  const sightingMeta = document.getElementById('sightingMeta');
  const sightingPhoto = document.getElementById('sightingPhoto');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const tagLocationBtn = document.getElementById('tagLocationBtn');
  const photoInput = document.getElementById('photoInput');

  let currentId = null;

  function nowLocalInputValue() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  function renderSightingMeta(entry) {
    const bits = [];
    if (entry.lat != null) bits.push(`📍 ${entry.lat.toFixed(4)}, ${entry.lng.toFixed(4)}`);
    sightingMeta.textContent = bits.join('  ·  ');
    if (entry.photo) {
      sightingPhoto.src = entry.photo;
      sightingPhoto.hidden = false;
      removePhotoBtn.hidden = false;
    } else {
      sightingPhoto.hidden = true;
      removePhotoBtn.hidden = true;
    }
  }

  function openModal(id) {
    const s = SPECIES.find(x => x.id === id);
    if (!s) return;
    currentId = id;
    modalIcon.innerHTML = renderIcon(s.icon);
    modalRarity.textContent = s.rarity;
    modalBig5.hidden = !s.big5;
    modalName.textContent = s.name;
    modalSci.textContent = s.sciName;
    modalHabitat.textContent = s.habitat;
    modalFact.textContent = s.fact;

    const entry = state.seen[id];
    modalSeenCheck.checked = !!entry;
    sightingDetails.hidden = !entry;
    modalSeenLabel.textContent = entry ? 'Spotted!' : 'Mark as spotted';
    sightingWhen.value = entry ? entry.seenAt.slice(0, 16) : nowLocalInputValue();
    sightingNote.value = entry ? (entry.note || '') : '';
    renderSightingMeta(entry || {});

    detailModal.showModal();
  }

  function ensureEntry() {
    if (!state.seen[currentId]) {
      state.seen[currentId] = { seenAt: new Date().toISOString(), note: '' };
    }
    return state.seen[currentId];
  }

  modalSeenCheck.addEventListener('change', () => {
    const prevSeenIds = new Set(Object.keys(state.seen));
    if (modalSeenCheck.checked) {
      const entry = ensureEntry();
      sightingDetails.hidden = false;
      modalSeenLabel.textContent = 'Spotted!';
      sightingWhen.value = entry.seenAt.slice(0, 16);
      const sp = SPECIES.find(x => x.id === currentId);
      showToast(`Nice spot! ${sp.name} added to your list.`);
    } else {
      delete state.seen[currentId];
      sightingDetails.hidden = true;
      modalSeenLabel.textContent = 'Mark as spotted';
    }
    saveState();
    updateCardVisual(currentId);
    updateStats();
    checkBig5Celebration(prevSeenIds);
  });

  sightingWhen.addEventListener('change', () => {
    if (!state.seen[currentId]) return;
    const d = new Date(sightingWhen.value);
    if (!isNaN(d)) { state.seen[currentId].seenAt = d.toISOString(); saveState(); }
  });
  sightingNote.addEventListener('input', () => {
    if (!state.seen[currentId]) return;
    state.seen[currentId].note = sightingNote.value;
    saveState();
  });

  tagLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { showToast('Location isn\'t available on this device.'); return; }
    const entry = ensureEntry();
    tagLocationBtn.textContent = '📍 Locating…';
    navigator.geolocation.getCurrentPosition(pos => {
      entry.lat = pos.coords.latitude;
      entry.lng = pos.coords.longitude;
      saveState();
      renderSightingMeta(entry);
      tagLocationBtn.textContent = '📍 Tag GPS location';
      showToast('Location saved.');
    }, () => {
      tagLocationBtn.textContent = '📍 Tag GPS location';
      showToast('Couldn\'t get your location.');
    }, { enableHighAccuracy: true, timeout: 10000 });
  });

  function resizeImageFile(file, maxDim, cb) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; }
        else if (height > maxDim) { width *= maxDim / height; height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        cb(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    const entry = ensureEntry();
    resizeImageFile(file, 800, dataUrl => {
      entry.photo = dataUrl;
      saveState();
      renderSightingMeta(entry);
      showToast('Photo attached.');
    });
  });
  removePhotoBtn.addEventListener('click', () => {
    if (!state.seen[currentId]) return;
    delete state.seen[currentId].photo;
    saveState();
    renderSightingMeta(state.seen[currentId]);
  });

  // ---------- Filter bar wiring ----------
  document.getElementById('categoryChips').addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    renderGrid();
  });
  document.getElementById('searchInput').addEventListener('input', e => {
    searchTerm = e.target.value;
    renderGrid();
  });
  document.getElementById('sortSelect').addEventListener('change', e => {
    sortKey = e.target.value;
    renderGrid();
  });
  document.getElementById('unseenOnly').addEventListener('change', e => {
    unseenOnly = e.target.checked;
    renderGrid();
  });

  // ---------- Suggest ----------
  document.getElementById('suggestBtn').addEventListener('click', () => {
    const pool = SPECIES.filter(s => matchesCat(s, activeCat) && !state.seen[s.id]);
    const source = pool.length ? pool : SPECIES.filter(s => !state.seen[s.id]);
    if (!source.length) { showToast('You\'ve ticked off everything here. Legendary safari! 🏆'); return; }
    const pick = source[Math.floor(Math.random() * source.length)];
    openModal(pick.id);
  });

  // ---------- Menu ----------
  const menuModal = document.getElementById('menuModal');
  document.getElementById('menuToggle').addEventListener('click', () => menuModal.showModal());

  document.getElementById('shareBtn').addEventListener('click', async () => {
    const seenList = Object.keys(state.seen);
    const names = seenList.map(id => SPECIES.find(s => s.id === id)?.name).filter(Boolean);
    const text = `My Masai Mara wildlife checklist 🐾\n${names.length}/${SPECIES.length} species spotted:\n` +
      names.map(n => `✓ ${n}`).join('\n');
    if (navigator.share) {
      try { await navigator.share({ text, title: 'My Masai Mara Checklist' }); return; } catch (e) { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Summary copied to clipboard.');
    } catch (e) {
      showToast('Could not share automatically — copy manually from the console.');
    }
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), seen: state.seen };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masai-mara-checklist-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data && data.seen) {
          state.seen = Object.assign({}, state.seen, data.seen);
          saveState();
          renderGrid();
          updateStats();
          showToast('Checklist imported.');
        }
      } catch (err) {
        showToast('That file doesn\'t look like a valid checklist export.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Reset all ticked species and sighting notes? This can\'t be undone.')) {
      state = { seen: {} };
      saveState();
      renderGrid();
      updateStats();
      showToast('Checklist reset.');
    }
  });

  // ---------- Install prompt ----------
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');
  const iosInstallHint = document.getElementById('iosInstallHint');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (isIos && !isStandalone) iosInstallHint.hidden = false;

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // ---------- Init ----------
  renderGrid();
  updateStats();
})();
