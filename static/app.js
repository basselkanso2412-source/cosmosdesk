'use strict';

// ── Landing Page ───────────────────────────────────────────────────────────
(function initLanding() {
  const canvas = document.getElementById('landing-stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [], comets = [], t = 0;

  // Static black holes (rx/ry = fraction of canvas size)
  const blackHoles = [
    { rx: 0.04,  ry: 0.88, size: 52 },
    { rx: 0.96,  ry: 0.10, size: 42 },
  ];

  // Neutron stars
  const neutronStars = [
    { rx: 0.93, ry: 0.72, angle: 0 },
    { rx: 0.07, ry: 0.20, angle: Math.PI / 3 },
  ];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 300 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.2,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.005,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
    }));
  }

  function spawnComet() {
    const fromTop = Math.random() < 0.6;
    let x, y;
    if (fromTop) { x = Math.random() * canvas.width; y = -30; }
    else         { x = -30; y = Math.random() * canvas.height * 0.6; }
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    const speed = 4 + Math.random() * 4;
    comets.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 100 + Math.random() * 120,
      maxAge: 160 + Math.random() * 80,
      age: 0,
    });
  }

  function drawStars() {
    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      s.a += s.da;
      if (s.a > 1)  { s.a = 1;  s.da *= -1; }
      if (s.a < 0)  { s.a = 0;  s.da *= -1; }
      if (s.x < 0)  s.x = canvas.width;
      if (s.x > canvas.width)  s.x = 0;
      if (s.y < 0)  s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,230,255,${s.a * 0.75})`;
      ctx.fill();
    }
  }

  function drawComets() {
    if (Math.random() < 0.004 && comets.length < 3) spawnComet();
    comets = comets.filter(c => c.age < c.maxAge);
    for (const c of comets) {
      c.x += c.vx; c.y += c.vy; c.age++;
      const life = 1 - c.age / c.maxAge;
      const spd  = Math.hypot(c.vx, c.vy);
      const tx   = c.x - (c.vx / spd) * c.length;
      const ty   = c.y - (c.vy / spd) * c.length;
      const grad = ctx.createLinearGradient(tx, ty, c.x, c.y);
      grad.addColorStop(0,   'rgba(255,255,255,0)');
      grad.addColorStop(0.75, `rgba(180,220,255,${life * 0.45})`);
      grad.addColorStop(1,    `rgba(255,255,255,${life * 0.9})`);
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(c.x, c.y);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.8; ctx.stroke();
      const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 9);
      hg.addColorStop(0, `rgba(255,255,255,${life * 0.9})`);
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = hg; ctx.fill();
    }
  }

  function drawBlackHoles() {
    for (const bh of blackHoles) {
      const x = bh.rx * canvas.width;
      const y = bh.ry * canvas.height;
      const r = bh.size;
      // Outer gravitational glow
      const og = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 4.5);
      og.addColorStop(0, 'rgba(100,0,160,0.18)');
      og.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x, y, r * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = og; ctx.fill();
      // Accretion disk (squashed ellipse, slowly rotating)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.0008 + bh.rx * 3);
      ctx.scale(1, 0.25);
      const dg = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 2.4);
      dg.addColorStop(0,   'rgba(255,100,0,0)');
      dg.addColorStop(0.35,'rgba(255,160,30,0.38)');
      dg.addColorStop(0.65,'rgba(255,70,0,0.22)');
      dg.addColorStop(1,   'rgba(200,30,0,0)');
      ctx.beginPath(); ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = dg; ctx.fill();
      ctx.restore();
      // Event horizon
      const eh = ctx.createRadialGradient(x, y, 0, x, y, r);
      eh.addColorStop(0,   'rgba(0,0,0,1)');
      eh.addColorStop(0.88,'rgba(0,0,0,1)');
      eh.addColorStop(1,   'rgba(5,0,15,0)');
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = eh; ctx.fill();
      // Photon ring
      ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,150,40,0.28)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  function drawNeutronStars() {
    for (const ns of neutronStars) {
      const x = ns.rx * canvas.width;
      const y = ns.ry * canvas.height;
      ns.angle += 0.045;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.09);
      const cr    = 4 + pulse * 2;
      // Pulsar jets
      for (let i = 0; i < 2; i++) {
        const ja = ns.angle + i * Math.PI;
        const jl = 70 + pulse * 35;
        const jx = x + Math.cos(ja) * jl;
        const jy = y + Math.sin(ja) * jl;
        const jg = ctx.createLinearGradient(x, y, jx, jy);
        jg.addColorStop(0, `rgba(140,210,255,${0.65 * pulse})`);
        jg.addColorStop(1,  'rgba(80,180,255,0)');
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(jx, jy);
        ctx.strokeStyle = jg; ctx.lineWidth = 1.5; ctx.stroke();
      }
      // Magnetosphere halo
      const mg = ctx.createRadialGradient(x, y, cr, x, y, 32);
      mg.addColorStop(0, `rgba(100,200,255,${0.28 * pulse})`);
      mg.addColorStop(1,  'rgba(40,90,255,0)');
      ctx.beginPath(); ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fillStyle = mg; ctx.fill();
      // Core
      const cg = ctx.createRadialGradient(x, y, 0, x, y, cr);
      cg.addColorStop(0, `rgba(255,255,255,${0.92 + pulse * 0.08})`);
      cg.addColorStop(0.5,'rgba(160,225,255,0.85)');
      cg.addColorStop(1,  'rgba(80,150,255,0)');
      ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t++;
    drawStars();
    drawBlackHoles();
    drawNeutronStars();
    drawComets();
    requestAnimationFrame(draw);
  }

  // Landing phrase rotator
  let lCurrent = 0;
  const lPhrases = document.querySelectorAll('.landing-phrase');
  const lDots    = document.querySelectorAll('.landing-dot');
  if (lPhrases.length) {
    lPhrases[0].classList.add('active');
    lDots[0]?.classList.add('active');
    setInterval(() => {
      lPhrases[lCurrent].classList.remove('active');
      lDots[lCurrent]?.classList.remove('active');
      lCurrent = (lCurrent + 1) % lPhrases.length;
      lPhrases[lCurrent].classList.add('active');
      lDots[lCurrent]?.classList.add('active');
    }, 3500);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

function enterApp() {
  const landing = document.getElementById('landing-page');
  const app     = document.getElementById('app');
  landing.classList.add('fade-out');
  setTimeout(() => {
    landing.style.display = 'none';
    app.classList.add('visible');
  }, 680);
}

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  tab:           'home',
  newsCategory:  'all',
  newsLoaded:    false,
  topicsLoaded:  false,
  timelineLoaded: false,
  chatHistory:   [],
  chatStreaming:  false,
};

const CAT_COLORS = {
  quantum:      'var(--quantum)',
  astronomy:    'var(--astronomy)',
  cosmology:    'var(--cosmology)',
  astrophysics: 'var(--astrophysics)',
  evolution:    'var(--evolution)',
  reason:       'var(--reason)',
  general:      'var(--general)',
};

const CAT_LABELS = {
  quantum:      'Quantum',
  astronomy:    'Astronomy',
  cosmology:    'Cosmology',
  astrophysics: 'Astrophysics',
  evolution:    'Evolution',
  reason:       'Reason',
  general:      'General',
};

// ── Tab Navigation ─────────────────────────────────────────────────────────
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(tab + '-panel');
  const btn   = document.getElementById('nav-' + tab);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');

  if (tab === 'home')          initHome();
  if (tab === 'news')          initNews();
  if (tab === 'topics')        initTopics();
  if (tab === 'timeline')      initTimeline();
  if (tab === 'freethinkers')  initFreethinkers();
  if (tab === 'glossary')      initGlossary();
  if (tab === 'library')       initLibrary();
  if (tab === 'chat')          initChat();
  if (tab === 'events')        initEvents();
  if (tab === 'debunked')      initDebunked();
  if (tab === 'scale')         initScale();
  if (tab === 'media')         initMedia();
  if (tab === 'articles')      initArticles();
  if (tab === 'fallacies')     initFallacies();
  if (tab === 'vsscript')      initVsScript();
  if (tab === 'args')          initArgs();
  if (tab === 'debate')        initDebatePanel();
}

// ── Home Tab ───────────────────────────────────────────────────────────────
async function initHome() {
  initStarfield();
  loadDailyFact();
  loadOnThisDay();
  loadFeaturedTopics();
  loadMiniNews();
  initHeroSearch();
  initCompositionBars();
}

async function loadOnThisDay() {
  const el = document.getElementById('otd-text');
  if (!el) return;
  try {
    const r = await fetch('/api/on_this_day');
    const d = await r.json();
    el.textContent = d.event;
  } catch (_) {}
}

async function loadDailyFact() {
  const el = document.getElementById('fact-text');
  if (!el) return;
  try {
    const r = await fetch('/api/daily_fact');
    const d = await r.json();
    el.textContent = d.fact;
    const cat = d.category;
    const banner = document.querySelector('.fact-banner');
    if (banner) banner.style.borderColor = `color-mix(in srgb, ${CAT_COLORS[cat] || 'var(--cosmology)'} 40%, transparent)`;
  } catch (_) {}
}

async function loadFeaturedTopics() {
  const el = document.getElementById('featured-topics');
  if (!el) return;
  try {
    const r = await fetch('/api/topics');
    const topics = await r.json();
    if (!allTopicsCache) allTopicsCache = topics;
    const featured = topics.slice(0, 6);
    el.innerHTML = featured.map(topicCardHTML).join('');
    el.querySelectorAll('.topic-card').forEach(c => {
      c.addEventListener('click', () => openTopic(c.dataset.slug));
    });
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load topics.</div>';
  }
}

async function loadMiniNews() {
  const el = document.getElementById('mini-news');
  if (!el) return;
  try {
    const r = await fetch('/api/news?category=all');
    const sources = await r.json();
    const all = sources.flatMap(s => s.articles || []);
    all.sort((a, b) => b.timestamp - a.timestamp);
    const top = all.slice(0, 5);
    el.innerHTML = top.map(a => {
      const color = CAT_COLORS[a.category] || 'var(--general)';
      return `<a class="news-mini" href="${escHtml(a.url)}" target="_blank" rel="noopener" style="--cat-color:${color}">
        <div class="news-mini-cat"></div>
        <div>
          <div class="news-mini-title">${escHtml(a.title)}</div>
          <div class="news-mini-meta">${escHtml(a.source)} · ${timeAgo(a.timestamp)}</div>
        </div>
      </a>`;
    }).join('');
  } catch (_) {}
}

// ── Starfield Canvas ───────────────────────────────────────────────────────
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas || canvas._init) return;
  canvas._init = true;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.2 + 0.2,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.004,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.x  += s.vx;
      s.y  += s.vy;
      s.a  += s.da;
      if (s.a > 1) { s.a = 1; s.da *= -1; }
      if (s.a < 0) { s.a = 0; s.da *= -1; }
      if (s.x < 0)  s.x = canvas.width;
      if (s.x > canvas.width)  s.x = 0;
      if (s.y < 0)  s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,230,255,${s.a * 0.7})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

// ── News Tab ───────────────────────────────────────────────────────────────
async function initNews() {
  if (!document.getElementById('news-panel').dataset.init) {
    renderNewsFilters();
    document.getElementById('news-panel').dataset.init = '1';
  }
  loadNews(state.newsCategory);
}

function renderNewsFilters() {
  const bar = document.getElementById('news-filter-bar');
  if (!bar) return;
  const cats = [
    { id: 'all',          label: 'All',          color: '#94a3b8' },
    { id: 'quantum',      label: 'Quantum',       color: 'var(--quantum)' },
    { id: 'astronomy',    label: 'Astronomy',     color: 'var(--astronomy)' },
    { id: 'cosmology',    label: 'Cosmology',     color: 'var(--cosmology)' },
    { id: 'astrophysics', label: 'Astrophysics',  color: 'var(--astrophysics)' },
    { id: 'evolution',    label: 'Evolution',     color: 'var(--evolution)' },
    { id: 'general',      label: 'General',       color: 'var(--general)' },
  ];
  bar.innerHTML = cats.map(c => `
    <button class="filter-btn ${c.id === state.newsCategory ? 'active' : ''}"
      data-cat="${c.id}" style="--active-color:${c.color}"
      onclick="setNewsCategory('${c.id}')">${c.label}</button>
  `).join('');
}

function setNewsCategory(cat) {
  state.newsCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  loadNews(cat);
}

async function loadNews(category = 'all') {
  const container = document.getElementById('news-sources');
  if (!container) return;
  container.innerHTML = skeletonNewsHTML();
  try {
    const r = await fetch(`/api/news?category=${category}`);
    const sources = await r.json();
    const hasAny = sources.some(s => s.articles && s.articles.length > 0);
    if (!hasAny) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📡</div>No articles found for this category. Try refreshing.</div>`;
      return;
    }
    container.innerHTML = sources.map(s => renderSource(s)).join('');
    container.querySelectorAll('a.article-card').forEach(c => {
      const cat = c.dataset.cat;
      if (cat) c.style.setProperty('--cat-color', CAT_COLORS[cat] || 'var(--general)');
    });
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div>Failed to load news. Is the server running?</div>`;
  }
}

function renderSource(source) {
  if (!source.articles || source.articles.length === 0) return '';
  return `
    <div class="source-section">
      <div class="source-header">
        <span class="source-name">${escHtml(source.source)}</span>
        <span class="source-count">${source.articles.length} articles</span>
        ${source.error ? `<span class="source-error">⚠ ${escHtml(source.error)}</span>` : ''}
      </div>
      <div class="articles-list">
        ${source.articles.map(articleCardHTML).join('')}
      </div>
    </div>`;
}

function articleCardHTML(a) {
  const color = CAT_COLORS[a.category] || 'var(--general)';
  return `<a class="article-card" href="${escHtml(a.url)}" target="_blank" rel="noopener"
      data-cat="${escHtml(a.category)}" style="--cat-color:${color}">
    <div class="article-title">${escHtml(a.title)}</div>
    ${a.summary ? `<div class="article-summary">${escHtml(truncate(a.summary, 120))}</div>` : ''}
    <div class="article-meta">
      <span class="article-cat">${CAT_LABELS[a.category] || 'General'}</span>
      <span class="article-time">${timeAgo(a.timestamp)}</span>
    </div>
  </a>`;
}

function skeletonNewsHTML() {
  return `<div class="source-section">
    <div class="articles-list">
      ${Array(6).fill('<div class="skeleton" style="height:100px"></div>').join('')}
    </div>
  </div>`;
}

// ── Topics Tab ─────────────────────────────────────────────────────────────
let allTopicsCache = null;

async function initTopics() {
  if (state.topicsLoaded) return;
  state.topicsLoaded = true;
  const el = document.getElementById('topics-grid-main');
  if (!el) return;
  el.innerHTML = Array(8).fill('<div class="skeleton" style="height:180px; border-radius:16px"></div>').join('');
  try {
    const r = await fetch('/api/topics');
    const topics = await r.json();
    allTopicsCache = topics;
    renderTopicsFilter(topics);
    el.innerHTML = topics.map(topicCardHTML).join('');
    el.querySelectorAll('.topic-card').forEach(c => {
      c.addEventListener('click', () => openTopic(c.dataset.slug));
    });
    const search = document.getElementById('topics-search');
    if (search) search.addEventListener('input', () => searchTopics(search.value));
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load topics.</div>';
  }
}

function searchTopics(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('#topics-grid-main .topic-card').forEach(c => {
    const text = c.textContent.toLowerCase();
    c.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
}

function renderTopicsFilter(topics) {
  const bar = document.getElementById('topics-filter-bar');
  if (!bar) return;
  const cats = ['all', 'cosmology', 'astrophysics', 'quantum', 'evolution', 'reason'];
  const labels = { all: 'All', cosmology: 'Cosmology', astrophysics: 'Astrophysics', quantum: 'Quantum Physics', evolution: 'Evolution', reason: 'Science & Reason' };
  bar.innerHTML = cats.map(c => `
    <button class="filter-btn ${c === 'all' ? 'active' : ''}"
      data-cat="${c}" style="--active-color:${CAT_COLORS[c] || '#94a3b8'}"
      onclick="filterTopics('${c}')">${labels[c]}</button>
  `).join('');
}

function filterTopics(cat) {
  document.querySelectorAll('#topics-filter-bar .filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  const cards = document.querySelectorAll('#topics-grid-main .topic-card');
  cards.forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
}

function topicCardHTML(t) {
  const color = CAT_COLORS[t.category] || 'var(--quantum)';
  const hasVs = !!t.vs_religion;
  return `<div class="topic-card" data-slug="${escHtml(t.slug)}" data-cat="${escHtml(t.category)}"
      style="--card-color:${color}">
    <div class="topic-card-header">
      <span class="topic-icon">${t.icon || '🔬'}</span>
      <span class="topic-cat-badge">${CAT_LABELS[t.category] || t.category}</span>
    </div>
    <div class="topic-title">${escHtml(t.title)}</div>
    <div class="topic-sub">${escHtml(t.subtitle || '')}</div>
    <div class="topic-summary">${escHtml(t.summary || '')}</div>
    ${hasVs ? `<div class="topic-vs">⚔️ vs Religious Claim</div>` : ''}
  </div>`;
}

// ── Topic Modal ────────────────────────────────────────────────────────────
async function openTopic(slug) {
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-inner');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(initModalProgress, 80);
  body.innerHTML = `<div class="modal-hero" style="padding:60px"><div class="skeleton" style="height:200px; border-radius:12px"></div></div>`;

  try {
    const r = await fetch('/api/topic/' + slug);
    const t = await r.json();
    body.innerHTML = renderTopicModal(t);
  } catch (_) {
    body.innerHTML = `<div style="padding:40px; color:var(--tx2)">Failed to load topic.</div>`;
  }
}

function renderTopicModal(t) {
  const color = CAT_COLORS[t.category] || 'var(--quantum)';

  const evidenceHTML = (t.evidence || []).map(e => `
    <div class="evidence-item">
      <div class="evidence-title">${escHtml(e.title)}</div>
      <div class="evidence-body">${escHtml(e.body)}</div>
    </div>`).join('');

  const factsHTML = (t.key_facts || []).map(f => `
    <div class="fact-item">
      <span class="fact-bullet">◆</span>
      <span>${escHtml(f)}</span>
    </div>`).join('');

  const misconHTML = (t.misconceptions || []).map(m => `
    <div class="misconception">
      <div class="myth-row"><span class="myth-label">MYTH</span><span class="myth-text">${escHtml(m.myth)}</span></div>
      <div class="reality-row"><span class="reality-label">REALITY</span><span class="reality-text">${escHtml(m.reality)}</span></div>
    </div>`).join('');

  const vsHTML = t.vs_religion ? `
    <div class="modal-section">
      <div class="modal-section-title">⚔️ Religious Claim vs Science</div>
      <div class="vs-box">
        <div class="vs-claim">"${escHtml(t.vs_religion.claim)}"</div>
        <div class="vs-response">${escHtml(t.vs_religion.response)}</div>
      </div>
    </div>` : '';

  const figuresHTML = (t.figures || []).map(f => `
    <div class="figure-item">
      <div>
        <div class="figure-name">${escHtml(f.name)}</div>
        <div class="figure-role">${escHtml(f.role)}</div>
      </div>
    </div>`).join('');

  const related = (allTopicsCache || [])
    .filter(o => o.category === t.category && o.slug !== t.slug)
    .slice(0, 4);
  const relatedHTML = related.length ? `
    <div class="modal-section">
      <div class="modal-section-title">Related Topics</div>
      <div class="related-topics-list">
        ${related.map(o => `<button class="related-topic-chip" onclick="openTopic('${escAttr(o.slug)}')" style="--chip-color:${CAT_COLORS[o.category] || 'var(--quantum)'}">${o.icon || '🔬'} ${escHtml(o.title)}</button>`).join('')}
      </div>
    </div>` : '';

  return `
    <div class="modal-hero" style="--modal-color:${color}">
      <span class="modal-icon">${t.icon || '🔬'}</span>
      <div class="modal-cat-badge">${CAT_LABELS[t.category] || t.category}</div>
      <div class="modal-title">${escHtml(t.title)}</div>
      <div class="modal-subtitle">${escHtml(t.subtitle || '')}</div>
    </div>
    <div class="modal-body" style="--modal-color:${color}">
      <div class="modal-section">
        <div class="modal-section-title">What Is It?</div>
        <div class="modal-text">${escHtml(t.what_is || t.summary || '')}</div>
      </div>
      ${evidenceHTML ? `
      <div class="modal-section">
        <div class="modal-section-title">The Evidence</div>
        <div class="evidence-list">${evidenceHTML}</div>
      </div>` : ''}
      ${factsHTML ? `
      <div class="modal-section">
        <div class="modal-section-title">Key Facts</div>
        <div class="facts-list">${factsHTML}</div>
      </div>` : ''}
      ${misconHTML ? `
      <div class="modal-section">
        <div class="modal-section-title">Common Misconceptions</div>
        <div class="misconceptions-list">${misconHTML}</div>
      </div>` : ''}
      ${vsHTML}
      ${figuresHTML ? `
      <div class="modal-section">
        <div class="modal-section-title">Key Scientists</div>
        <div class="figures-list">${figuresHTML}</div>
      </div>` : ''}
      ${relatedHTML}
    </div>`;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Timeline Tab ───────────────────────────────────────────────────────────
async function initTimeline() {
  if (state.timelineLoaded) return;
  state.timelineLoaded = true;
  const el = document.getElementById('timeline-events');
  if (!el) return;
  try {
    const r = await fetch('/api/timeline');
    const events = await r.json();
    el.innerHTML = events.map(renderTimelineEvent).join('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load timeline.</div>';
  }
}

function renderTimelineEvent(e) {
  const color = CAT_COLORS[e.category] || 'var(--general)';
  const timeLabel = formatYearsAgo(e.years_ago);
  return `
    <div class="tl-event" style="--cat-color:${color}">
      <div class="tl-dot"></div>
      <div class="tl-icon">${e.icon || '●'}</div>
      <div class="tl-body">
        <div class="tl-label">${escHtml(e.label)}</div>
        <div class="tl-time">${timeLabel}</div>
        <div class="tl-event-text">${escHtml(e.event)}</div>
      </div>
    </div>`;
}

function formatYearsAgo(y) {
  if (y === 0) return 'Present Day';
  if (y < 1000) return `${y} years ago`;
  if (y < 1_000_000) return `${(y / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} thousand years ago`;
  if (y < 1_000_000_000) return `${(y / 1_000_000).toFixed(1)} million years ago`;
  return `${(y / 1_000_000_000).toFixed(2)} billion years ago`;
}

// ── Freethinkers Tab ───────────────────────────────────────────────────────
let ftData = null;

async function initFreethinkers() {
  const search = document.getElementById('ft-search');
  if (search && !search.dataset.wired) {
    search.dataset.wired = '1';
    search.addEventListener('input', () => searchFt(search.value));
  }
  if (ftData) return;
  renderFtFilters();
  const grid = document.getElementById('ft-grid');
  grid.innerHTML = Array(6).fill('<div class="skeleton" style="height:280px;border-radius:20px"></div>').join('');
  try {
    const r = await fetch('/api/scientists');
    ftData = await r.json();
    renderFtGrid(ftData);
  } catch (_) {
    grid.innerHTML = '<div class="empty-state">Could not load scientists.</div>';
  }
}

function searchFt(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('#ft-grid .ft-card').forEach(c => {
    const text = c.textContent.toLowerCase();
    c.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
}

function renderFtFilters() {
  const bar = document.getElementById('ft-filter-bar');
  if (!bar) return;
  const filters = [
    { id: 'all',           label: 'All',           color: '#94a3b8' },
    { id: 'Nobel Laureate', label: '🏅 Nobel Laureates', color: 'var(--astronomy)' },
  ];
  bar.innerHTML = filters.map(f => `
    <button class="filter-btn ${f.id === 'all' ? 'active' : ''}"
      data-ft="${f.id}" style="--active-color:${f.color}"
      onclick="filterFt('${f.id}')">${f.label}</button>
  `).join('');
}

function filterFt(key) {
  document.querySelectorAll('#ft-filter-bar .filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.ft === key));
  if (!ftData) return;
  const filtered = key === 'all' ? ftData
    : ftData.filter(s =>
        s.stance.includes(key.toLowerCase()) ||
        (s.tags || []).some(t => t.toLowerCase().includes(key.toLowerCase()))
      );
  renderFtGrid(filtered);
}

function renderFtGrid(scientists) {
  const grid = document.getElementById('ft-grid');
  grid.innerHTML = scientists.map(scientistCardHTML).join('');
  grid.querySelectorAll('.ft-card').forEach(card => {
    card.querySelector('.ft-expand-btn')?.addEventListener('click', () => {
      card.classList.toggle('expanded');
      const btn = card.querySelector('.ft-expand-btn');
      btn.textContent = card.classList.contains('expanded') ? 'Show less ↑' : 'More quotes ↓';
    });
  });
}

function scientistCardHTML(s) {
  const color = s.color || '#94a3b8';
  const stanceBadge = s.stance.includes('atheist')
    ? `<span class="ft-badge ft-badge-atheist">Atheist</span>`
    : `<span class="ft-badge ft-badge-agnostic">Agnostic</span>`;

  const extraQuotes = (s.extra_quotes || []).map(q =>
    `<div class="ft-extra-quote"><span class="ft-eq-mark">"</span>${escHtml(q)}"</div>`
  ).join('');

  const tags = (s.tags || []).map(t =>
    `<span class="ft-tag">${escHtml(t)}</span>`
  ).join('');

  return `
    <div class="ft-card" style="--ft-color:${color}">
      <div class="ft-card-top">
        <div class="ft-emoji">${s.emoji}</div>
        <div class="ft-card-meta">
          ${stanceBadge}
          <div class="ft-name">${escHtml(s.name)}</div>
          <div class="ft-field">${escHtml(s.field)}</div>
          <div class="ft-years">${escHtml(s.years)}</div>
        </div>
      </div>

      <div class="ft-quote-block">
        <div class="ft-qmark">"</div>
        <blockquote class="ft-main-quote">${escHtml(s.quote)}</blockquote>
        <div class="ft-source">— ${escHtml(s.quote_source)}</div>
      </div>

      <p class="ft-bio">${escHtml(s.bio)}</p>

      <div class="ft-tags">${tags}</div>

      ${extraQuotes ? `
        <button class="ft-expand-btn">More quotes ↓</button>
        <div class="ft-extra-quotes">${extraQuotes}</div>
      ` : ''}
    </div>`;
}

// ── Glossary Tab ───────────────────────────────────────────────────────────
let glossaryData = null;

async function initGlossary() {
  const search = document.getElementById('glossary-search');
  if (search && !search.dataset.wired) {
    search.dataset.wired = '1';
    search.addEventListener('input', () => renderGlossary(search.value));
  }
  if (glossaryData) return;
  const el = document.getElementById('glossary-list');
  el.innerHTML = Array(8).fill('<div class="skeleton" style="height:60px;border-radius:10px"></div>').join('');
  try {
    const r = await fetch('/api/glossary');
    glossaryData = await r.json();
    renderGlossary('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load glossary.</div>';
  }
}

function renderGlossary(query) {
  const el = document.getElementById('glossary-list');
  if (!el || !glossaryData) return;
  const q = query.trim().toLowerCase();
  const filtered = !q ? glossaryData : glossaryData.filter(g =>
    g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
  el.innerHTML = filtered.length
    ? filtered.map(g => `
      <div class="glossary-item">
        <div class="glossary-term">${escHtml(g.term)}</div>
        <div class="glossary-def">${escHtml(g.definition)}</div>
      </div>`).join('')
    : '<div class="empty-state">No terms match.</div>';
}

// ── Library Tab ────────────────────────────────────────────────────────────
let libraryLoaded = false;

async function initLibrary() {
  if (libraryLoaded) return;
  libraryLoaded = true;
  const el = document.getElementById('library-list');
  el.innerHTML = Array(6).fill('<div class="skeleton" style="height:120px;border-radius:14px"></div>').join('');
  try {
    const r = await fetch('/api/books');
    const books = await r.json();
    el.innerHTML = books.map(b => `
      <div class="book-card">
        <div class="book-title">${escHtml(b.title)}</div>
        <div class="book-author">${escHtml(b.author)} · ${b.year}</div>
        <div class="book-why">${escHtml(b.why)}</div>
      </div>`).join('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load books.</div>';
  }
}

// ── Myth vs Fact Quiz ──────────────────────────────────────────────────────
let quizData = null;
let quizState = { items: [], idx: 0, score: 0 };

async function openQuiz() {
  const overlay = document.getElementById('quiz-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!quizData) {
    try {
      const r = await fetch('/api/quiz');
      quizData = await r.json();
    } catch (_) {
      quizData = [];
    }
  }
  startQuiz();
}

function closeQuiz() {
  document.getElementById('quiz-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function startQuiz() {
  const shuffled = [...quizData].sort(() => Math.random() - 0.5).slice(0, 8);
  quizState = { items: shuffled, idx: 0, score: 0 };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const inner = document.getElementById('quiz-inner');
  if (!inner) return;
  if (quizState.idx >= quizState.items.length) {
    inner.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result-score">${quizState.score} / ${quizState.items.length}</div>
        <div class="quiz-result-label">Myths correctly spotted</div>
        <button class="btn btn-primary" onclick="startQuiz()">Play Again</button>
      </div>`;
    return;
  }
  const item = quizState.items[quizState.idx];
  const showAsMyth = Math.random() < 0.5;
  const statement = showAsMyth ? item.myth : item.reality;
  inner.innerHTML = `
    <div class="quiz-progress">Question ${quizState.idx + 1} of ${quizState.items.length} · Score: ${quizState.score}</div>
    <div class="quiz-topic-tag">${escHtml(item.topic)}</div>
    <div class="quiz-statement">"${escHtml(statement)}"</div>
    <div class="quiz-question">Is this statement a common <strong>MYTH</strong>, or scientifically <strong>ACCURATE</strong>?</div>
    <div class="quiz-buttons">
      <button class="btn btn-outline quiz-btn" data-answer="myth">It's a Myth</button>
      <button class="btn btn-outline quiz-btn" data-answer="reality">It's Accurate</button>
    </div>
    <div id="quiz-feedback" class="quiz-feedback"></div>`;
  inner.querySelectorAll('.quiz-btn').forEach(btn => {
    btn.addEventListener('click', () => answerQuiz(btn.dataset.answer === 'myth' ? showAsMyth : !showAsMyth, item));
  });
}

function answerQuiz(correct, item) {
  if (correct) quizState.score++;
  const fb = document.getElementById('quiz-feedback');
  document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
  fb.innerHTML = `
    <div class="quiz-feedback-box ${correct ? 'correct' : 'incorrect'}">
      ${correct ? '✅ Correct!' : '❌ Not quite.'}
      <div class="quiz-explain"><strong>Myth:</strong> ${escHtml(item.myth)}<br><strong>Reality:</strong> ${escHtml(item.reality)}</div>
      <button class="btn btn-primary" onclick="nextQuizQuestion()" style="margin-top:10px">Next →</button>
    </div>`;
}

function nextQuizQuestion() {
  quizState.idx++;
  renderQuizQuestion();
}

// ── Chat Tab ───────────────────────────────────────────────────────────────
function initChat() {
  if (document.getElementById('chat-panel').dataset.init) return;
  document.getElementById('chat-panel').dataset.init = '1';

  const suggestions = [
    'Why does evolution disprove creation?',
    'What is the evidence for the Big Bang?',
    'How do we know the universe is 13.8 billion years old?',
    'Can quantum mechanics prove God exists?',
    'Where did life come from?',
    'What is dark matter?',
  ];
  const sEl = document.getElementById('chat-suggestions');
  if (sEl) {
    sEl.innerHTML = suggestions.map(s =>
      `<button class="suggestion-chip" onclick="sendSuggestion('${escAttr(s)}')">${escHtml(s)}</button>`
    ).join('');
  }
}

function sendSuggestion(text) {
  const input = document.getElementById('chat-input');
  if (input) { input.value = text; sendMessage(); }
}

async function sendMessage() {
  if (state.chatStreaming) return;
  const input = document.getElementById('chat-input');
  const text  = input ? input.value.trim() : '';
  if (!text) return;

  input.value = '';
  input.style.height = '44px';
  state.chatHistory.push({ role: 'user', content: text });
  renderChatMessages();

  state.chatStreaming = true;
  document.getElementById('chat-send').disabled = true;

  const msgEl = appendAssistantTyping();

  try {
    const resp = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: state.chatHistory }),
    });

    if (!resp.ok) {
      const err = await resp.json();
      msgEl.textContent = err.error || 'Error communicating with AI.';
      state.chatHistory.push({ role: 'assistant', content: msgEl.textContent });
    } else {
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let full = '';
      msgEl.textContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const obj = JSON.parse(payload);
            if (obj.delta) {
              full += obj.delta;
              msgEl.innerHTML = renderMarkdown(full);
              scrollChat();
            }
          } catch (_) {}
        }
      }
      state.chatHistory.push({ role: 'assistant', content: full });
    }
  } catch (e) {
    msgEl.textContent = 'Network error. Is the server running?';
  }

  state.chatStreaming = false;
  document.getElementById('chat-send').disabled = false;
  scrollChat();
}

function appendAssistantTyping() {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg assistant';
  div.innerHTML = `<div class="msg-label">CosmosDesk</div><div class="msg-bubble"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`;
  messages.appendChild(div);
  scrollChat();
  return div.querySelector('.msg-bubble');
}

function renderChatMessages() {
  const el = document.getElementById('chat-messages');
  if (!el) return;
  el.innerHTML = state.chatHistory.map(m => {
    const isUser = m.role === 'user';
    return `<div class="msg ${isUser ? 'user' : 'assistant'}">
      <div class="msg-label">${isUser ? 'You' : 'CosmosDesk'}</div>
      <div class="msg-bubble">${isUser ? escHtml(m.content) : renderMarkdown(m.content)}</div>
    </div>`;
  }).join('');
  scrollChat();
}

function scrollChat() {
  const el = document.getElementById('chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// ── Utilities ──────────────────────────────────────────────────────────────
function escHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(s) {
  return String(s || '').replace(/'/g, "\\'");
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString();
}

// ── Phrase rotator (strip + footer, synced) ────────────────────────────────
function initPhraseRotators() {
  const groups = [
    { phrases: document.querySelectorAll('.footer-phrase'), dots: document.querySelectorAll('.footer-dot') },
    { phrases: document.querySelectorAll('.strip-phrase'),  dots: document.querySelectorAll('.strip-dot') },
  ];
  let current = 0;
  setInterval(() => {
    const next = (current + 1) % 4;
    groups.forEach(({ phrases, dots }) => {
      if (!phrases.length) return;
      phrases[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      phrases[next].classList.add('active');
      dots[next]?.classList.add('active');
    });
    current = next;
  }, 3500);
}

// ── Sky Events Tab ─────────────────────────────────────────────────────────
let eventsLoaded = false;

async function initEvents() {
  if (eventsLoaded) return;
  eventsLoaded = true;
  const el = document.getElementById('events-grid');
  if (!el) return;
  el.innerHTML = Array(4).fill('<div class="skeleton" style="height:260px;border-radius:16px"></div>').join('');
  try {
    const r = await fetch('/api/events');
    const events = await r.json();
    el.innerHTML = events.map(renderEventCard).join('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📡</div>Could not load events.</div>';
  }
}

const EV_COLORS = {
  eclipse: 'var(--cosmology)',
  meteor:  'var(--quantum)',
  planet:  'var(--astrophysics)',
  moon:    'var(--astronomy)',
};

function renderEventCard(ev) {
  const color   = EV_COLORS[ev.category] || 'var(--general)';
  const date    = new Date(ev.date + 'T00:00:00');
  const now     = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDay = Math.round((date - now) / 86400000);
  const isPast  = diffDay < 0;
  const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let countdownHTML;
  if (isPast) {
    countdownHTML = `<div class="event-countdown past"><span class="ev-cd-past-label">This event has passed</span></div>`;
  } else if (diffDay === 0) {
    countdownHTML = `<div class="event-countdown" style="border-color:${color}40">
      <div><div class="ev-cd-days" style="color:${color}">TODAY</div></div>
      <div class="ev-cd-right"><div class="ev-cd-label">Happening on</div><div class="ev-cd-date">${dateStr}</div></div>
    </div>`;
  } else {
    countdownHTML = `<div class="event-countdown">
      <div><div class="ev-cd-days" style="color:${color}">${diffDay}</div><div class="ev-cd-unit">days away</div></div>
      <div class="ev-cd-right"><div class="ev-cd-label">Happening on</div><div class="ev-cd-date">${dateStr}</div></div>
    </div>`;
  }

  const tipHTML  = ev.tip  ? `<div class="event-tip"><span class="event-tip-icon">💡</span><span>${escHtml(ev.tip)}</span></div>` : '';
  const factHTML = ev.fact ? `<div class="event-fact">⚡ ${escHtml(ev.fact)}</div>` : '';

  return `<div class="event-card" style="--ev-color:${color}">
    <div class="event-top">
      <div class="event-icon">${ev.icon}</div>
      <div class="event-meta">
        <div class="event-cat-badge">${ev.category}</div>
        <div class="event-name">${escHtml(ev.name)}</div>
        <div class="event-date-str">${dateStr}</div>
      </div>
    </div>
    ${countdownHTML}
    <div class="event-desc">${escHtml(ev.description)}</div>
    ${tipHTML}
    ${factHTML}
  </div>`;
}

// ── Debunked Tab ───────────────────────────────────────────────────────────
let debunkedLoaded = false;
let debunkedData   = null;

async function initDebunked() {
  if (debunkedLoaded) return;
  debunkedLoaded = true;
  renderDebunkedFilters();
  const el = document.getElementById('debunked-list');
  if (!el) return;
  el.innerHTML = Array(5).fill('<div class="skeleton" style="height:76px;border-radius:18px"></div>').join('');
  try {
    const r = await fetch('/api/debunked');
    debunkedData = await r.json();
    renderDebunkedList(debunkedData);
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load debunked claims.</div>';
  }
}

function renderDebunkedFilters() {
  const bar = document.getElementById('debunked-filter-bar');
  if (!bar) return;
  const cats = [
    { id: 'all',       label: 'All Claims',    color: '#94a3b8' },
    { id: 'evolution', label: '🧬 Evolution',  color: 'var(--evolution)' },
    { id: 'cosmology', label: '💥 Cosmology',  color: 'var(--cosmology)' },
    { id: 'reason',    label: '⚖️ Philosophy', color: 'var(--reason)' },
  ];
  bar.innerHTML = cats.map(c => `
    <button class="filter-btn ${c.id === 'all' ? 'active' : ''}"
      data-dbcat="${c.id}" style="--active-color:${c.color}"
      onclick="filterDebunkedCat('${c.id}')">${c.label}</button>
  `).join('');
}

function filterDebunkedCat(cat) {
  document.querySelectorAll('#debunked-filter-bar .filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.dbcat === cat));
  if (!debunkedData) return;
  const filtered = cat === 'all' ? debunkedData : debunkedData.filter(d => d.category === cat);
  renderDebunkedList(filtered);
}

function renderDebunkedList(items) {
  const el = document.getElementById('debunked-list');
  if (!el) return;
  el.innerHTML = items.map(renderDebunkedCard).join('');
  el.querySelectorAll('.db-header').forEach(h => {
    h.addEventListener('click', () => h.closest('.db-card').classList.toggle('open'));
  });
}

function renderDebunkedCard(d) {
  const verdictClass = { 'MYTH': 'db-verdict-myth', 'FLAWED': 'db-verdict-flawed', 'MISLEADING': 'db-verdict-misleading' }[d.verdict] || 'db-verdict-myth';
  const evidenceHTML = (d.evidence || []).map(e =>
    `<div class="db-evidence-item"><span class="db-evidence-bullet">◆</span><span>${escHtml(e)}</span></div>`
  ).join('');
  const quoteHTML = d.quote ? `
    <div class="db-quote">
      <div class="db-quote-text">"${escHtml(d.quote.text)}"</div>
      <div class="db-quote-author">— ${escHtml(d.quote.author)}</div>
    </div>` : '';

  return `<div class="db-card" id="db-${escHtml(d.id)}">
    <div class="db-header">
      <div class="db-icon">${d.icon}</div>
      <div class="db-header-right">
        <div class="db-verdict ${verdictClass}">${escHtml(d.verdict)}</div>
        <div class="db-claim">${escHtml(d.claim)}</div>
        <div class="db-short">${escHtml(d.short_rebuttal)}</div>
      </div>
      <div class="db-chevron">▾</div>
    </div>
    <div class="db-body">
      <div>
        <div class="db-label">Full Scientific Rebuttal</div>
        <div class="db-rebuttal">${escHtml(d.full_rebuttal)}</div>
      </div>
      ${evidenceHTML ? `<div><div class="db-label">The Evidence</div><div class="db-evidence-list">${evidenceHTML}</div></div>` : ''}
      ${quoteHTML}
      ${d.source_claim ? `<div class="db-source">📌 Source of claim: ${escHtml(d.source_claim)}</div>` : ''}
    </div>
  </div>`;
}

// ── Universe Scale Tab ─────────────────────────────────────────────────────
const UNIVERSE_SCALES = [
  { name: 'Planck Length', sizeLabel: '1.6 × 10⁻³⁵ m', icon: '∞', color: '#a855f7', description: 'The smallest meaningful length in physics. Below this scale, quantum gravity dominates and all known physics breaks down entirely. Our equations produce infinities here — a sign our theories are incomplete.', context: '10²⁰ times smaller than a proton' },
  { name: 'Superstring (theoretical)', sizeLabel: '~10⁻³⁴ m', icon: '〰', color: '#a855f7', description: 'The hypothetical size of a fundamental string in String Theory. If strings are real, this is what quarks are made of — vibrating filaments of energy whose different oscillation modes produce different particles.', context: 'The deepest layer of reality, if String Theory is correct' },
  { name: 'Quark', sizeLabel: '< 10⁻¹⁸ m', icon: '⚫', color: '#00d4ff', description: 'The fundamental building blocks of protons and neutrons. There are 6 "flavors." Quarks are permanently confined by the strong nuclear force — no isolated quark has ever been observed. The force holding them together actually increases with distance.', context: 'Every proton: 2 up quarks + 1 down quark' },
  { name: 'Proton', sizeLabel: '8.8 × 10⁻¹⁶ m', icon: '🔵', color: '#00d4ff', description: 'Made of 2 up quarks + 1 down quark held by gluons. The nucleus of a hydrogen atom — and 99.97% of its mass. All the matter you have ever touched is made of protons and neutrons. 99.9999% of it is empty space.', context: '~1836 times heavier than an electron; almost all of an atom\'s mass' },
  { name: 'Atomic Nucleus', sizeLabel: '~10⁻¹⁴ m', icon: '💫', color: '#f97316', description: 'The dense core of an atom, packed with protons and neutrons held by the strong nuclear force — the most powerful fundamental force in nature, roughly 137 times stronger than electromagnetism at this range.', context: '99.97% of an atom\'s mass; 0.01% of its volume' },
  { name: 'Hydrogen Atom', sizeLabel: '1.06 × 10⁻¹⁰ m', icon: '⚛️', color: '#00d4ff', description: 'The simplest atom: one proton, one electron. 75% of all ordinary matter in the universe is hydrogen. Stars fuse hydrogen into helium for billions of years, releasing the energy that powers all life. A hydrogen atom is 99.9999999% empty space.', context: '75% of all ordinary matter in the universe is hydrogen' },
  { name: 'DNA Double Helix', sizeLabel: '2.5 × 10⁻⁹ m', icon: '🧬', color: '#22c55e', description: 'The width of a DNA strand — the molecule that encodes all life on Earth. Three billion base pairs carry your full genetic code. If you stretched out all the DNA in one human cell, it would reach 2 meters. All 37 trillion cells: DNA reaching the Sun and back 70 times.', context: '3.8 billion years of evolutionary information in one molecule' },
  { name: 'Virus', sizeLabel: '~100 nm', icon: '🦠', color: '#fbbf24', description: 'Packages of genetic code in a protein shell. Not quite alive — no metabolism, no cells — but they hijack cellular machinery with extraordinary precision. The SARS-CoV-2 virus that swept the world in 2020 was about 100 nm across.', context: 'Blurring the line between chemistry and life' },
  { name: 'Bacterium', sizeLabel: '~2 μm', icon: '🔬', color: '#22c55e', description: 'Single-celled life — Earth\'s first lifeform, arising 3.8 billion years ago. Bacteria survived every mass extinction in Earth\'s history. Their total biomass on Earth exceeds all animals, plants, and fungi combined. You have more bacterial cells in your gut than human cells in your body.', context: '3.8 billion years of unbroken life — ancestors of everything' },
  { name: 'Human Cell', sizeLabel: '~10 μm', icon: '🫀', color: '#22c55e', description: 'The basic unit of you. Each of your ~37 trillion cells contains 2 meters of DNA, ~20,000 protein-coding genes, hundreds of mitochondria (themselves descended from ancient bacteria), and the full genetic blueprint for every other cell in your body.', context: '~37 trillion of these make up a human body' },
  { name: 'Human Hair Width', sizeLabel: '~70 μm', icon: '〰', color: '#fbbf24', description: 'The approximate limit of unaided human vision. Below this, we need instruments. A reminder that most of reality — at the atomic, cellular, and nanoscale — is completely invisible to us without technology. The universe is far stranger than it looks.', context: 'The edge of what unaided human senses can resolve' },
  { name: 'Ant', sizeLabel: '1–2 mm', icon: '🐜', color: '#fbbf24', description: 'Ants have walked the Earth for ~130 million years, surviving the asteroid impact that killed the non-avian dinosaurs. Their combined biomass rivals that of all wild mammals. Their colonies exhibit emergent intelligence with no central controller — order from simple rules.', context: '130 million years of survival; colonies smarter than any individual' },
  { name: 'Human', sizeLabel: '~1.7 m', icon: '🧍', color: '#94a3b8', description: 'Homo sapiens — a 300,000-year-old primate. Every atom in your body was forged inside a star that exploded before our solar system existed. You are the universe briefly aware of itself — made of stardust, organized by 3.8 billion years of evolution, reading this on a pale blue dot.', context: '300,000 years old; on a 4.54-billion-year-old planet' },
  { name: 'Eiffel Tower', sizeLabel: '330 m', icon: '🗼', color: '#94a3b8', description: '330 meters of wrought iron, built in 1889. The tallest artificial structure on Earth for 41 years. A species that has existed for 0.002% of Earth\'s history reshaping the surface through reason, mathematics, and engineering.', context: 'Tallest structure on Earth for 41 years after construction' },
  { name: 'Mount Everest', sizeLabel: '8,849 m', icon: '⛰️', color: '#94a3b8', description: 'The highest point on Earth\'s surface — still rising ~5 mm per year as the Indian and Eurasian tectonic plates continue colliding. Formed over 50 million years of slow, relentless geological process, no supernatural cause required.', context: 'Rising ~5 mm/year due to tectonic forces — has been for 50 million years' },
  { name: 'Earth', sizeLabel: '12,742 km diameter', icon: '🌍', color: '#22c55e', description: 'A rocky, water-covered planet 4.54 billion years old — one of ~40 billion Earth-sized planets in the habitable zones of Milky Way stars alone. The only confirmed address of life in the universe. Fragile, unremarkable in cosmic terms, and irreplaceable.', context: 'One of ~40 billion Earth-like planets in the Milky Way\'s habitable zones' },
  { name: 'Earth–Moon Distance', sizeLabel: '384,400 km', icon: '🌕', color: '#94a3b8', description: 'Humans first crossed this distance in 1969 — just 66 years after the Wright Brothers\' first flight. Not prayer, not faith, but physics, mathematics, and engineering. The same intellectual tools that built the rocket also debunked the geocentric universe.', context: 'Humans crossed this distance in 1969 — 66 years after the first airplane' },
  { name: 'The Sun', sizeLabel: '1.39 million km diameter', icon: '☀️', color: '#f97316', description: 'A middle-aged yellow dwarf star fusing 620 million tonnes of hydrogen into helium every second. Contains 99.86% of the solar system\'s mass. Has 5 billion years of fuel left. All life on Earth ultimately runs on nuclear fusion happening 150 million km away.', context: 'All life on Earth runs on nuclear fusion — no mysticism required' },
  { name: 'Earth–Sun Distance (1 AU)', sizeLabel: '149.6 million km', icon: '🌞', color: '#fbbf24', description: 'One Astronomical Unit — the baseline of all cosmic distance measurement. Light takes 8 minutes 20 seconds to cross it. When you look at the Sun, you see it as it was 8 minutes ago. When you look at Andromeda, you see it as it was 2.5 million years ago.', context: 'Light: 8 min 20 sec. The baseline of cosmic distance measurement.' },
  { name: 'Solar System (Oort Cloud)', sizeLabel: '~1.5 light-years', icon: '🚀', color: '#f97316', description: 'The full extent of our solar system including the hypothetical Oort Cloud of comets. Voyager 1, launched in 1977 and traveling at 61,000 km/h, took 45 years to cross the heliopause. Our nearest stellar neighbor is still 4.37 light-years beyond that.', context: 'Voyager 1: 45 years to cross — still not at the nearest star' },
  { name: 'Nearest Star (Alpha Centauri)', sizeLabel: '4.37 light-years', icon: '⭐', color: '#fbbf24', description: 'A triple-star system containing Proxima Centauri, which hosts the potentially habitable planet Proxima b. At current spacecraft speeds: 75,000 years to arrive. At the speed of light: 4 years. A reminder of how vast and empty the universe truly is.', context: '75,000 years at current speeds; 4 years at the speed of light' },
  { name: 'Milky Way Galaxy', sizeLabel: '~100,000 light-years', icon: '🌌', color: '#a855f7', description: 'Our galaxy: a barred spiral containing 200–400 billion stars and their planetary systems. Our Solar System orbits the galactic center at 220 km/s, completing one orbit every 225 million years — so Earth is roughly 20 galactic orbits old.', context: '200–400 billion stars — likely far more planets; one of 2 trillion galaxies' },
  { name: 'Local Group of Galaxies', sizeLabel: '~10 million light-years', icon: '🌀', color: '#a855f7', description: 'Our gravitationally bound cluster of ~80 galaxies, dominated by the Milky Way and Andromeda. In ~4.5 billion years, Andromeda will collide and merge with the Milky Way — though the stars are so far apart that almost none will physically strike each other.', context: 'Andromeda will merge with the Milky Way in 4.5 billion years' },
  { name: 'Observable Universe', sizeLabel: '93 billion light-years diameter', icon: '🔭', color: '#00d4ff', description: 'Everything we can ever observe — a sphere 93 billion light-years across (space has expanded since the Big Bang) containing ~2 trillion galaxies and ~10²⁴ stars. Beyond our observational horizon lies more universe — possibly infinite. We have seen perhaps an infinitesimal fraction of what exists.', context: '~2 trillion galaxies, ~10²⁴ stars — possibly a tiny fraction of the whole' },
];

let scaleIdx = 12;

function initScale() {
  const panel = document.getElementById('scale-panel');
  if (panel.dataset.init) return;
  panel.dataset.init = '1';

  document.getElementById('scale-slider')?.addEventListener('input', e => {
    scaleIdx = parseInt(e.target.value);
    renderScaleLevel();
  });
  document.getElementById('scale-prev')?.addEventListener('click', () => {
    if (scaleIdx > 0) { scaleIdx--; document.getElementById('scale-slider').value = scaleIdx; renderScaleLevel(); }
  });
  document.getElementById('scale-next')?.addEventListener('click', () => {
    if (scaleIdx < UNIVERSE_SCALES.length - 1) { scaleIdx++; document.getElementById('scale-slider').value = scaleIdx; renderScaleLevel(); }
  });
  renderScaleLevel();
}

function renderScaleLevel() {
  const s = UNIVERSE_SCALES[scaleIdx];
  const iconEl  = document.getElementById('scale-icon');
  const infoEl  = document.querySelector('.scale-info');

  if (iconEl) {
    iconEl.classList.add('changing');
    setTimeout(() => { iconEl.textContent = s.icon; iconEl.classList.remove('changing'); }, 160);
  }
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('scale-name', s.name);
  set('scale-size', s.sizeLabel);
  set('scale-desc', s.description);
  set('scale-context', s.context);
  set('scale-step', scaleIdx + 1);

  const fillEl = document.getElementById('scale-progress');
  if (fillEl) fillEl.style.width = `${(scaleIdx / (UNIVERSE_SCALES.length - 1)) * 100}%`;

  const prevBtn = document.getElementById('scale-prev');
  const nextBtn = document.getElementById('scale-next');
  if (prevBtn) prevBtn.disabled = scaleIdx === 0;
  if (nextBtn) nextBtn.disabled = scaleIdx === UNIVERSE_SCALES.length - 1;

  if (infoEl) {
    infoEl.style.setProperty('--sc-color', s.color);
    infoEl.style.borderColor = s.color + '55';
  }

  const expEl = document.getElementById('scale-exp');
  if (expEl) {
    const humanIdx = 12;
    const diff = scaleIdx - humanIdx;
    if (diff === 0) expEl.innerHTML = '<strong>Human scale</strong>';
    else expEl.innerHTML = `<strong>${Math.abs(diff)} scale levels</strong> ${diff < 0 ? 'smaller' : 'larger'} than a human`;
  }
}

// ── Media Tab ──────────────────────────────────────────────────────────────
let mediaData = null;
let mediaType = 'podcasts';

async function initMedia() {
  const panel = document.getElementById('media-panel');
  if (panel && !panel.dataset.init) {
    panel.dataset.init = '1';
    panel.querySelectorAll('.media-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.media-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mediaType = btn.dataset.type;
        renderMediaGrid();
      });
    });
  }
  if (mediaData) { renderMediaGrid(); return; }
  const el = document.getElementById('media-grid');
  if (!el) return;
  el.innerHTML = Array(4).fill('<div class="skeleton" style="height:160px;border-radius:18px"></div>').join('');
  try {
    const r = await fetch('/api/media');
    mediaData = await r.json();
    renderMediaGrid();
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load media picks.</div>';
  }
}

function renderMediaGrid() {
  const el = document.getElementById('media-grid');
  if (!el || !mediaData) return;
  const items = mediaData[mediaType] || [];
  const typeLabel = { podcasts: 'Podcast', youtube: 'YouTube Channel', documentaries: 'Documentary' }[mediaType];
  el.innerHTML = items.map(item => {
    const host  = item.host || item.creator || '';
    const year  = item.year ? ` · ${item.year}` : '';
    const tags  = (item.tags || []).map(t => `<span class="media-tag">${escHtml(t)}</span>`).join('');
    return `<div class="media-card">
      <div class="media-card-top">
        <div class="media-card-icon">${item.icon}</div>
        <div class="media-card-meta">
          <div class="media-card-type">${typeLabel}</div>
          <div class="media-card-name">${escHtml(item.name)}</div>
          <div class="media-card-host">${escHtml(host)}${year}</div>
        </div>
      </div>
      <div class="media-card-desc">${escHtml(item.description)}</div>
      <div class="media-card-tags">${tags}</div>
    </div>`;
  }).join('');
}

// ── Random Quote Button ────────────────────────────────────────────────────
const STATIC_QUOTES = [
  { text: 'I regard the brain as a computer which will stop working when its components fail. There is no heaven or afterlife for broken-down computers.', author: 'Stephen Hawking' },
  { text: 'Forget Jesus. The stars died so that you could be here today.', author: 'Lawrence Krauss' },
  { text: 'If we are honest — and scientists have to be — we must admit that religion is a jumble of false assertions, with no basis in reality.', author: 'Paul Dirac' },
  { text: 'I would rather have questions that can\'t be answered than answers that can\'t be questioned.', author: 'Richard Feynman' },
  { text: 'The cosmos is all that is, or ever was, or ever will be.', author: 'Carl Sagan' },
  { text: 'That which can be asserted without evidence can be dismissed without evidence.', author: 'Christopher Hitchens' },
  { text: 'We are a way for the cosmos to know itself.', author: 'Carl Sagan' },
  { text: 'The word God is for me nothing more than the expression and product of human weaknesses.', author: 'Albert Einstein, 1954' },
  { text: 'We are all atheists about most of the gods humanity has ever believed in. Some of us just go one god further.', author: 'Richard Dawkins' },
  { text: 'Nothing in biology makes sense except in the light of evolution.', author: 'Theodosius Dobzhansky' },
  { text: 'The universe is under no obligation to make sense to you.', author: 'Neil deGrasse Tyson' },
  { text: 'Science is not only compatible with spirituality; it is a profound source of spirituality.', author: 'Carl Sagan' },
  { text: 'We have fossils. We win.', author: 'Richard Dawkins' },
  { text: 'The more I study science, the more I believe in God — this quote was NEVER said by Einstein. His actual view: God is a human weakness.', author: 'Fact-check note' },
  { text: 'Religion is an insult to human dignity. For good people to do evil things, that takes religion.', author: 'Steven Weinberg, Nobel Laureate' },
  { text: 'I cannot imagine a God who rewards and punishes the objects of his creation.', author: 'Albert Einstein' },
  { text: 'Doubt is not the opposite of faith. Credulity is.', author: 'Paul Tillich' },
  { text: 'The fact that a believer is happier than a skeptic is no more to the point than the fact that a drunk is happier than a sober man.', author: 'George Bernard Shaw' },
  { text: 'Man is descended from a hairy-tailed quadruped, probably arboreal in habits. If Darwin had known what we know now, he would have been even more confident.', author: 'Richard Dawkins' },
  { text: 'Where knowledge ends, religion begins.', author: 'Benjamin Disraeli' },
];

let currentQuoteIdx = -1;

function showRandomQuote() {
  const toast = document.getElementById('quote-toast');
  if (!toast) return;

  let pool = [...STATIC_QUOTES];
  if (ftData) pool.push(...ftData.map(s => ({ text: s.quote, author: s.name })));

  let idx;
  do { idx = Math.floor(Math.random() * pool.length); } while (idx === currentQuoteIdx && pool.length > 1);
  currentQuoteIdx = idx;
  const q = pool[idx];

  const qEl = document.getElementById('qt-quote-text');
  const aEl = document.getElementById('qt-author-text');
  if (qEl) qEl.textContent = `"${q.text}"`;
  if (aEl) aEl.textContent = `— ${q.author}`;

  toast.classList.add('open');
}

function closeQuoteToast() {
  document.getElementById('quote-toast')?.classList.remove('open');
}

function shareCurrentQuote() {
  const qText = document.getElementById('qt-quote-text')?.textContent || '';
  const aText = document.getElementById('qt-author-text')?.textContent || '';
  copyToClipboard(`${qText}\n${aText}`, document.querySelector('.qt-share'));
}

// ── Share / Copy utilities ─────────────────────────────────────────────────
function copyQuote(btn) {
  const card   = btn.closest('.mq-card');
  if (!card) return;
  const quote  = card.querySelector('.mq-quote')?.textContent?.trim() || '';
  const author = card.querySelector('.mq-author')?.textContent?.trim() || '';
  copyToClipboard(`"${quote}"\n— ${author}`, btn);
}

function copyToClipboard(text, btn) {
  const finish = () => {
    showCopyToast();
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2200);
    }
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
  } else {
    fallbackCopy(text, finish);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:-9999px';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); } catch (_) {}
  document.body.removeChild(ta);
  if (cb) cb();
}

function showCopyToast() {
  const el = document.createElement('div');
  el.className = 'copy-toast';
  el.textContent = '✓ Copied to clipboard';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

// ── Hero Search ────────────────────────────────────────────────────────────
let heroSearchData = null;

async function initHeroSearch() {
  const input   = document.getElementById('hero-search');
  const results = document.getElementById('hero-search-results');
  if (!input || !results || input.dataset.wired) return;
  input.dataset.wired = '1';

  async function ensureData() {
    if (heroSearchData) return;
    const [topicsR, sciR] = await Promise.all([
      fetch('/api/topics').then(r => r.json()).catch(() => []),
      fetch('/api/scientists').then(r => r.json()).catch(() => []),
    ]);
    heroSearchData = [
      ...topicsR.map(t => ({ type: 'topic',     icon: t.icon || '🔬',  name: t.title, sub: t.subtitle || t.category, slug: t.slug })),
      ...sciR.map(s    => ({ type: 'scientist',  icon: s.emoji || '🧑‍🔬', name: s.name,  sub: s.field,                  id:   s.id   })),
    ];
  }

  input.addEventListener('focus', ensureData);
  input.addEventListener('input', async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.classList.remove('open'); return; }
    await ensureData();
    const matches = heroSearchData.filter(item =>
      item.name.toLowerCase().includes(q) || (item.sub || '').toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) { results.classList.remove('open'); return; }
    results.innerHTML = matches.map(item => `
      <div class="hsr-item" data-type="${item.type}" data-slug="${escAttr(item.slug || item.id || '')}">
        <div class="hsr-icon">${item.icon}</div>
        <div><div class="hsr-name">${escHtml(item.name)}</div><div class="hsr-sub">${escHtml(item.sub || '')}</div></div>
        <div class="hsr-type">${item.type}</div>
      </div>`).join('');
    results.classList.add('open');
    results.querySelectorAll('.hsr-item').forEach(el => {
      el.addEventListener('click', () => {
        results.classList.remove('open'); input.value = '';
        if (el.dataset.type === 'topic') openTopic(el.dataset.slug);
        else switchTab('freethinkers');
      });
    });
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !results.contains(e.target)) results.classList.remove('open');
  });
}

// ── Universe Composition Bars ──────────────────────────────────────────────
function initCompositionBars() {
  const el = document.getElementById('composition-section');
  if (!el || el.dataset.init) return;
  el.dataset.init = '1';

  const bars = [
    { label: 'Dark Energy',     pct: 68.3, color: '#a855f7', note: 'Accelerating the expansion of the universe' },
    { label: 'Dark Matter',     pct: 26.8, color: '#00d4ff', note: 'Invisible — inferred from gravity alone' },
    { label: 'Ordinary Matter', pct: 4.9,  color: '#f97316', note: 'All atoms, stars, planets, life — everything you\'ve ever seen' },
    { label: 'Stars & Gas',     pct: 0.5,  color: '#fbbf24', note: 'Of that 4.9%, only ~0.5% is in luminous stars' },
  ];

  el.innerHTML = `
    <div class="comp-title">What the Universe Is Actually Made Of</div>
    <div class="comp-bars">
      ${bars.map(b => `
        <div class="comp-bar-row">
          <div class="comp-bar-label" style="color:${b.color}">${b.label}</div>
          <div class="comp-bar-track"><div class="comp-bar-fill" style="background:${b.color}" data-pct="${b.pct}"></div></div>
          <div class="comp-bar-pct">${b.pct}%</div>
          <div class="comp-bar-note">${b.note}</div>
        </div>`).join('')}
    </div>
    <p class="comp-note">Source: Planck Collaboration 2018. Everything humanity has ever directly observed — atoms, stars, galaxies — is less than 5% of the universe. The other 95% is dark matter and dark energy: real, confirmed by multiple independent measurements, and completely unexplained. Science is honest about this. Religion isn't honest about anything it doesn't know.</p>`;

  requestAnimationFrame(() => {
    el.querySelectorAll('.comp-bar-fill').forEach(bar => { bar.style.width = bar.dataset.pct + '%'; });
  });
}

// ── Modal Reading Progress Bar ─────────────────────────────────────────────
function initModalProgress() {
  const overlay = document.getElementById('modal-overlay');
  const bar     = document.getElementById('modal-scroll-progress');
  if (!overlay || !bar) return;

  bar.style.width = '0%';

  function onScroll() {
    const sh = overlay.scrollHeight - overlay.clientHeight;
    bar.style.width = (sh > 0 ? (overlay.scrollTop / sh) * 100 : 0) + '%';
  }

  overlay._progressHandler && overlay.removeEventListener('scroll', overlay._progressHandler);
  overlay._progressHandler = onScroll;
  overlay.addEventListener('scroll', onScroll);
}

// ── Articles Tab ───────────────────────────────────────────────────────────
let articlesLoaded = false;

async function initArticles() {
  if (articlesLoaded) return;
  articlesLoaded = true;
  const el = document.getElementById('articles-grid');
  if (!el) return;
  el.innerHTML = Array(4).fill('<div class="skeleton" style="height:260px;border-radius:20px"></div>').join('');
  try {
    const r = await fetch('/api/articles');
    const data = await r.json();
    el.innerHTML = data.map(a => `
      <div class="art-card" style="--art-color:${escAttr(a.color)}" onclick="openArticle('${escAttr(a.id)}')">
        <div class="art-card-top">
          <div class="art-icon">${a.icon}</div>
          <div class="art-read-time">⏱ ${a.read_time} min read</div>
        </div>
        <div class="art-cat">${CAT_LABELS[a.category] || a.category}</div>
        <div class="art-title">${escHtml(a.title)}</div>
        <div class="art-subtitle">${escHtml(a.subtitle)}</div>
        <div class="art-intro">${escHtml(a.intro.slice(0, 160))}…</div>
        <div class="art-cta">Read article →</div>
      </div>`).join('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load articles.</div>';
  }
}

async function openArticle(id) {
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-inner');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(initModalProgress, 80);
  body.innerHTML = `<div class="modal-hero" style="padding:60px"><div class="skeleton" style="height:200px;border-radius:12px"></div></div>`;
  try {
    const r = await fetch('/api/article/' + id);
    const a = await r.json();
    body.innerHTML = renderArticleModal(a);
  } catch (_) {
    body.innerHTML = `<div style="padding:40px;color:var(--tx2)">Failed to load article.</div>`;
  }
}

function renderArticleModal(a) {
  const color = CAT_COLORS[a.category] || '#94a3b8';
  const sectionsHTML = (a.sections || []).map(s => `
    <div class="art-section">
      <div class="art-section-heading">${escHtml(s.heading)}</div>
      <div class="art-section-body">${escHtml(s.body)}</div>
    </div>`).join('');

  const takeawaysHTML = (a.key_takeaways || []).map(t => `
    <div class="fact-item">
      <span class="fact-bullet">◆</span>
      <span>${escHtml(t)}</span>
    </div>`).join('');

  const quoteHTML = a.quote ? `
    <div class="art-quote">
      <div class="art-quote-mark">"</div>
      <blockquote class="art-quote-text">${escHtml(a.quote.text)}</blockquote>
      <div class="art-quote-author">— ${escHtml(a.quote.author)}</div>
    </div>` : '';

  return `
    <div class="modal-hero" style="--modal-color:${color}">
      <span class="modal-icon">${a.icon || '📰'}</span>
      <div class="modal-cat-badge">${CAT_LABELS[a.category] || a.category} · ⏱ ${a.read_time} min read</div>
      <div class="modal-title">${escHtml(a.title)}</div>
      <div class="modal-subtitle">${escHtml(a.subtitle || '')}</div>
    </div>
    <div class="modal-body" style="--modal-color:${color}">
      <div class="modal-section">
        <div class="art-intro-full">${escHtml(a.intro)}</div>
      </div>
      ${sectionsHTML}
      ${takeawaysHTML ? `
      <div class="modal-section">
        <div class="modal-section-title">Key Takeaways</div>
        <div class="facts-list">${takeawaysHTML}</div>
      </div>` : ''}
      ${quoteHTML}
    </div>`;
}

// ── Fallacy Spotter ────────────────────────────────────────────────────────
let fallaciesLoaded = false;

async function initFallacies() {
  if (fallaciesLoaded) return;
  fallaciesLoaded = true;
  const el = document.getElementById('fallacies-grid');
  if (!el) return;
  el.innerHTML = Array(4).fill('<div class="skeleton" style="height:320px;border-radius:20px"></div>').join('');
  try {
    const r = await fetch('/api/fallacies');
    const data = await r.json();
    el.innerHTML = data.map(f => `
      <div class="fallacy-card" style="--fc-color:${escAttr(f.color)}">
        <div class="fallacy-top">
          <div class="fallacy-icon">${f.icon}</div>
          <div>
            <div class="fallacy-name">${escHtml(f.name)}</div>
            <div class="fallacy-aka">${escHtml(f.also_known_as || '')}</div>
          </div>
        </div>
        <div class="fallacy-def">${escHtml(f.definition)}</div>
        <div class="fallacy-why">${escHtml(f.why_wrong)}</div>
        <div class="fallacy-section-label">Classic example</div>
        <div class="fallacy-example">${escHtml(f.example)}</div>
        <div class="fallacy-section-label">How to respond</div>
        <div class="fallacy-rebuttal">${escHtml(f.rebuttal)}</div>
      </div>`).join('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load fallacies.</div>';
  }
}

// ── vs Scripture Tab ────────────────────────────────────────────────────────
let vsscriptLoaded = false;
let vsscriptData = null;

let vsscriptFilter = 'all';

async function initVsScript() {
  const panel = document.getElementById('vsscript-panel');
  if (panel && !panel.dataset.init) {
    panel.dataset.init = '1';
    panel.querySelectorAll('.vsscript-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.vsscript-sub-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.vstype;
        const filterBar = document.getElementById('vsscript-filter-bar');
        if (filterBar) filterBar.style.display = type === 'scripture' ? 'flex' : 'none';
        renderVsScriptContent(type);
      });
    });
    const filterBar = document.getElementById('vsscript-filter-bar');
    if (filterBar) {
      filterBar.style.display = 'flex';
      filterBar.querySelectorAll('.vsscript-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterBar.querySelectorAll('.vsscript-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          vsscriptFilter = btn.dataset.vsfilter;
          renderVsScriptContent('scripture');
        });
      });
    }
  }
  if (vsscriptLoaded) { renderVsScriptContent('scripture'); return; }
  vsscriptLoaded = true;
  const el = document.getElementById('vsscript-content');
  if (!el) return;
  el.innerHTML = Array(4).fill('<div class="skeleton" style="height:100px;border-radius:18px;margin-bottom:16px"></div>').join('');
  try {
    const [scrR, dvaR] = await Promise.all([
      fetch('/api/scripture_vs_science').then(r => r.json()),
      fetch('/api/designed_vs_actual').then(r => r.json()),
    ]);
    vsscriptData = { scripture: scrR, design: dvaR };
    renderVsScriptContent('scripture');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load data.</div>';
  }
}

function renderVsScriptContent(type) {
  const el = document.getElementById('vsscript-content');
  if (!el || !vsscriptData) return;
  if (type === 'scripture') {
    const rows = vsscriptFilter === 'all'
      ? vsscriptData.scripture
      : vsscriptData.scripture.filter(s => (s.scripture || 'Bible') === vsscriptFilter);
    el.innerHTML = `<div class="vsscript-list">${rows.map(s => {
      const isQuran = s.scripture === 'Quran';
      const badgeColor = isQuran ? '#1e8a4c' : '#7c3aed';
      const badgeLabel = isQuran ? '☪️ Quran' : '✝️ Bible';
      // First sentence of the claim for the compact header
      const claimShort = s.claim.split('.')[0].replace(/^Quran \S+ — /, '').replace(/^Genesis \S+ — /, '').replace(/^[A-Za-z]+ \S+ — /, '');
      return `<div class="vsscript-row">
        <div class="vsscript-row-header">
          <div class="vsscript-icon">${s.icon}</div>
          <div class="vsscript-header-text">
            <div class="vsscript-header-top">
              <span class="vsscript-scripture-badge" style="background:${badgeColor}">${badgeLabel}</span>
              <span class="vsscript-error-badge-sm">${escHtml(s.error)}</span>
            </div>
            <div class="vsscript-claim-short">${escHtml(claimShort)}</div>
          </div>
          <div class="vsscript-chevron">▾</div>
        </div>
        <div class="vsscript-row-body">
          <div class="vsscript-body-section">
            <div class="vsscript-body-label">📖 Religious Claim</div>
            <div class="vsscript-body-text">${escHtml(s.claim)}</div>
          </div>
          <div class="vsscript-body-section vsscript-science-section">
            <div class="vsscript-body-label">🔬 What Science Found</div>
            <div class="vsscript-body-text">${escHtml(s.what_science_says)}</div>
            ${s.sources ? `<div class="vsscript-sources">Sources: ${escHtml(s.sources)}</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('')}</div>`;
    el.querySelectorAll('.vsscript-row').forEach(row => {
      row.addEventListener('click', () => row.classList.toggle('open'));
    });
  } else {
    el.innerHTML = `<div class="dva-list">${vsscriptData.design.map(d => `
      <div class="dva-row">
        <div class="dva-aspect">${escHtml(d.aspect)}</div>
        <div class="dva-cols">
          <div class="dva-designed">
            <div class="dva-col-label">If Designed for Us</div>
            <div class="dva-col-text">${escHtml(d.designed)}</div>
          </div>
          <div class="dva-actual">
            <div class="dva-col-label">What We Actually Find</div>
            <div class="dva-col-text">${escHtml(d.actual)}</div>
          </div>
        </div>
        <div class="dva-verdict">⚡ ${escHtml(d.verdict)}</div>
      </div>`).join('')}</div>`;
  }
}

// ── Philosophy Tree ─────────────────────────────────────────────────────────
let argsLoaded = false;

async function initArgs() {
  if (argsLoaded) return;
  argsLoaded = true;
  const el = document.getElementById('args-list');
  if (!el) return;
  el.innerHTML = Array(3).fill('<div class="skeleton" style="height:76px;border-radius:20px"></div>').join('');
  try {
    const r = await fetch('/api/philosophy_tree');
    const data = await r.json();
    el.innerHTML = data.map(a => `
      <div class="arg-card" style="--arg-color:${escAttr(a.color)}">
        <div class="arg-header" onclick="this.closest('.arg-card').classList.toggle('open')">
          <div class="arg-icon">${a.icon}</div>
          <div class="arg-header-right">
            <div class="arg-name">${escHtml(a.name)}</div>
            <div class="arg-premise">${escHtml(a.premise)}</div>
          </div>
          <div class="arg-chevron">▾</div>
        </div>
        <div class="arg-body">
          <div class="arg-best">
            <div class="arg-best-label">Strongest Version of the Argument</div>
            <div class="arg-best-text">${escHtml(a.best_version)}</div>
          </div>
          <div class="arg-rebuttals-label">Complete Refutations</div>
          <div class="args-rebuttals">
            ${(a.rebuttals || []).map(rb => `
              <div class="arg-rebuttal">
                <div class="arg-rebuttal-title">✗ ${escHtml(rb.title)}</div>
                <div class="arg-rebuttal-body">${escHtml(rb.body)}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`).join('');
  } catch (_) {
    el.innerHTML = '<div class="empty-state">Could not load arguments.</div>';
  }
}

// ── Debate Mode ─────────────────────────────────────────────────────────────
let debateMode = 'atheist';
let debateHistory = [];

function setDebateMode(mode) {
  debateMode = mode;
  document.querySelectorAll('.debate-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.dmode === mode));
  debateHistory = [];
  const el = document.getElementById('debate-messages');
  if (el) el.innerHTML = `<div class="debate-empty"><div class="debate-empty-icon">⚔️</div>Choose an argument above or type your opening statement.</div>`;
}

const DEBATE_STARTERS = {
  'cosmological': 'Everything that begins to exist has a cause. The universe began to exist. Therefore, the universe has a cause — and that cause must be God.',
  'fine-tuning':  'The physical constants of the universe are so precisely calibrated for life that the probability of this occurring by chance is essentially zero. This demands a designer.',
  'morality':     'Without God, there is no objective morality — only subjective personal preference. But we all act as though some things are genuinely wrong. Objective morality requires a moral lawgiver: God.',
  'consciousness':'Science has no explanation for subjective consciousness — the "hard problem." The existence of inner experience is best explained by God or an immaterial soul.',
  'evil':         'If God is all-powerful and all-knowing, He could create free beings who always freely choose good. He chose not to. This means either He is not all-good, not all-powerful, or does not exist.',
  'experience':   'I have had a direct personal experience of God — a profound sense of presence and communication. This is the most direct evidence available. You cannot dismiss what I have personally experienced.',
};

async function startDebate(topic) {
  const opening = DEBATE_STARTERS[topic];
  if (!opening) return;
  debateHistory = [];
  const el = document.getElementById('debate-messages');
  if (el) el.innerHTML = '';
  if (debateMode === 'atheist') {
    appendDebateMsg('ai', opening);
    debateHistory.push({ role: 'assistant', content: opening });
  } else {
    appendDebateMsg('user', opening);
    debateHistory.push({ role: 'user', content: opening });
    await sendDebateToAI();
  }
}

async function sendDebateMessage() {
  const input = document.getElementById('debate-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendDebateMsg('user', text);
  debateHistory.push({ role: 'user', content: text });
  await sendDebateToAI();
}

async function sendDebateToAI() {
  const systemCtx = debateMode === 'atheist'
    ? 'You are a skilled religious apologist making the strongest possible case for theism (Kalam, fine-tuning, moral argument, Plantinga-style). You are confident, sophisticated, and press back on every concession. 2-3 paragraphs max.'
    : 'You are an expert atheist scientist-philosopher. You identify the logical fallacy, cite specific scientific evidence, and propose the naturalistic explanation. Cite scientists, experiments, numbers. Devastating but precise. 2-3 paragraphs max.';

  const typingEl = appendDebateMsg('ai', '…', true);
  try {
    // Gemini requires messages to strictly alternate user/model and start with user.
    // Pass systemCtx as 'system' field so we don't need to prepend fake messages.
    const apiMsgs = [...debateHistory];
    if (!apiMsgs.length || apiMsgs[0].role !== 'user') {
      apiMsgs.unshift({ role: 'user', content: 'The debate begins.' });
    }

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: systemCtx, messages: apiMsgs }),
    });
    if (!res.ok) throw new Error('API error');
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let full = '';
    typingEl.classList.remove('typing');
    const bubble = typingEl.querySelector('.debate-bubble');
    bubble.innerHTML = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      dec.decode(value).split('\n').forEach(line => {
        if (!line.startsWith('data: ')) return;
        const d = line.slice(6).trim();
        if (d === '[DONE]') return;
        try {
          const { delta } = JSON.parse(d);
          if (delta) { full += delta; bubble.innerHTML = renderMarkdown(full); }
        } catch (_) {}
      });
      const msgBox = document.getElementById('debate-messages');
      if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;
    }
    debateHistory.push({ role: 'assistant', content: full });
  } catch (_) {
    const bubble = typingEl.querySelector('.debate-bubble');
    if (bubble) bubble.textContent = 'Could not reach AI. Check your API key in .env.';
    typingEl.classList.remove('typing');
  }
}

function appendDebateMsg(role, text, typing = false) {
  const el = document.getElementById('debate-messages');
  if (!el) return null;
  const emptyEl = el.querySelector('.debate-empty');
  if (emptyEl) emptyEl.remove();
  const div = document.createElement('div');
  div.className = `debate-msg ${role}${typing ? ' typing' : ''}`;
  const avatar = role === 'ai' ? (debateMode === 'atheist' ? '✝️' : '⚛️') : '🧑';
  div.innerHTML = `<div class="debate-avatar">${avatar}</div><div class="debate-bubble">${escHtml(text)}</div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  return div;
}

function initDebatePanel() {
  const panel = document.getElementById('debate-panel');
  if (!panel || panel.dataset.init) return;
  panel.dataset.init = '1';
  const el = document.getElementById('debate-messages');
  if (el && !el.children.length) {
    el.innerHTML = `<div class="debate-empty"><div class="debate-empty-icon">⚔️</div>Choose an argument above or type your opening statement.</div>`;
  }
  const input = document.getElementById('debate-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDebateMessage(); }
    });
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Tab nav wiring
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Modal close
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.getElementById('modal-close')?.addEventListener('click', closeModal);

  // Quiz modal close
  document.getElementById('quiz-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('quiz-overlay')) closeQuiz();
  });
  document.getElementById('quiz-close')?.addEventListener('click', closeQuiz);

  // Chat input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
  }
  document.getElementById('chat-send')?.addEventListener('click', sendMessage);

  // Phrase rotators (hero + footer synced)
  initPhraseRotators();

  // Boot into home
  switchTab('home');
});
