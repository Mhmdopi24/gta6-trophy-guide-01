// Leonida Legend: an offline GTA VI trophy checklist, roadmap and guide.
// Loads only its own trophy data file; progress lives in localStorage.
const KEY = 'gta6-trophy-guide-progress-v1';
const params = new URLSearchParams(location.search);
const DEMO = params.get('demo') === '1';
const DEMO_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const STAGES = {
  1: ['Stage 1 — Story first', 'Play the story in order: the four chapters, the final mission, the named missions, and the five character-final strands. These unlock through play, so they come first.'],
  2: ['Stage 2 — Strangers & side threads', 'Stranger mission strands and Bret\u2019s hunt. Finish each strand you start; eight completed stranger strands earn a Silver.'],
  3: ['Stage 3 — Collectibles', 'Meditation spots, card sets, WAiNK locations, vehicles, the 52 areas of Leonida, and all 8 garages. Do the missable meditation spots as you go.'],
  4: ['Stage 4 — Activities & combat', 'Races, shooting range, fishing, arcade, challenges, robberies, partner trophies, money goals and the one-off moments. The long grind lives here.'],
  5: ['Stage 5 — Platinum cleanup', 'Check the in-game completion tracker, finish whatever categories are short, and take 100% completion — the Platinum pops with it.'],
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let lastRoute = null;
const demoEarned = DEMO ? new Set(DEMO_IDS) : new Set();
const isEarned = (t) => earned.has(t.id) || demoEarned.has(t.id);

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const searchEl = $('search');
const kindEl = $('kind');
const gradeEl = $('grade');
const statusEl = $('status');
const spoilerEl = $('spoiler');
const missableEl = $('missable-only');

if (params.get('spoiler') === '1') spoilerEl.checked = true;

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function targetText(t) {
  if (t.psn_count === null || t.psn_count === undefined) return '—';
  return String(t.psn_count);
}

function spoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !isEarned(t);
}

function trophyName(t) {
  return spoilerHidden(t) ? 'Hidden story trophy' : t.name;
}

function trophyDesc(t) {
  return spoilerHidden(t) ? 'Turn the spoiler setting off, or earn this trophy, to reveal it.' : t.description;
}

function tagsHtml(t) {
  const bits = [];
  bits.push('<span class="badge kind">' + t.kind + '</span>');
  if (t.hidden) bits.push('<span class="badge hidden">Hidden</span>');
  if (t.missable) bits.push('<span class="badge missable">Missable</span>');
  bits.push('<span class="badge kind">Stage ' + t.roadmap_stage + '</span>');
  return bits.join('');
}

function renderProgress() {
  const n = trophies.filter(isEarned).length;
  const per = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && isEarned(t)).length;
    return gradeLabel({ grade: g }) + ' ' + got + '/' + total;
  }).join(' · ');
  const counted = trophies.filter((t) => t.psn_count !== null && t.psn_count !== undefined);
  const countedGot = counted.filter(isEarned).length;
  $('progress').textContent = n + ' of ' + trophies.length + ' earned' + (DEMO ? ' — DEMO' : '');
  $('progress-detail').textContent = per + ' · Trophies with a PSN target: ' + countedGot + '/' + counted.length + ' earned';
}

function renderNextUp() {
  const next = [...trophies]
    .filter((t) => !isEarned(t))
    .sort((a, b) => a.roadmap_stage - b.roadmap_stage || a.id - b.id)[0];
  const el = $('nextup');
  if (!next) {
    el.innerHTML = '<strong>Platinum earned.</strong> Every trophy is ticked — Leonida Legend.';
    return;
  }
  el.innerHTML = 'Next up: <strong>' + trophyName(next) + '</strong> (' + gradeLabel(next) + ', Stage ' + next.roadmap_stage + ') — ' + trophyDesc(next);
}

function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  const route = currentRoute();
  return trophies.filter((t) => {
    if (route === 'missables' && !t.missable) return false;
    if (missableEl.checked && !t.missable) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (statusEl.value === 'earned' && !isEarned(t)) return false;
    if (statusEl.value === 'unearned' && isEarned(t)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderRows() {
  const list = filtered();
  rowsEl.replaceChildren();
  for (const t of list) {
    const tr = document.createElement('tr');
    if (isEarned(t)) tr.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', (e) => {
      e.stopPropagation();
      if (box.checked) earned.add(t.id);
      else { earned.delete(t.id); demoEarned.delete(t.id); }
      save();
      renderAll();
    });
    const tdBox = document.createElement('td');
    tdBox.append(box);
    tr.append(tdBox);

    const tdName = document.createElement('td');
    tdName.className = 'name';
    const strong = document.createElement('div');
    strong.textContent = (t.id) + '. ' + trophyName(t);
    const desc = document.createElement('span');
    desc.className = 'desc';
    desc.textContent = trophyDesc(t);
    const tags = document.createElement('span');
    tags.className = 'tags';
    tags.innerHTML = tagsHtml(t);
    tdName.append(strong, desc, tags);
    tr.append(tdName);

    const tdGrade = document.createElement('td');
    tdGrade.innerHTML = '<span class="grade-dot ' + t.grade + '"></span>' + gradeLabel(t);
    tr.append(tdGrade);

    const tdTarget = document.createElement('td');
    tdTarget.textContent = targetText(t);
    tr.append(tdTarget);

    const tdGuide = document.createElement('td');
    tdGuide.textContent = spoilerHidden(t) ? 'Hidden until earned.' : t.guide;
    tr.append(tdGuide);

    tr.addEventListener('click', () => { location.hash = '#/trophy/' + t.id; });
    rowsEl.append(tr);
  }
  $('count').textContent = list.length + ' of ' + trophies.length + ' trophies shown';
}

function renderDetail(id) {
  const el = $('detail');
  const t = byId.get(id);
  if (!t) { el.hidden = true; el.replaceChildren(); return; }
  el.hidden = false;
  el.replaceChildren();
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'close';
  close.textContent = 'Close';
  close.addEventListener('click', () => { location.hash = '#/'; });
  el.append(close);
  const h = document.createElement('h2');
  h.textContent = t.id + '. ' + t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = t.description;
  const flags = document.createElement('div');
  flags.className = 'flags';
  flags.innerHTML = '<span class="badge ' + t.grade + '">' + gradeLabel(t) + '</span>' + tagsHtml(t);
  const guideH = document.createElement('h3');
  guideH.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const meta = document.createElement('p');
  meta.textContent = 'Roadmap: ' + STAGES[t.roadmap_stage][0] + '. PSN target: ' + targetText(t) + '.';
  const srcH = document.createElement('h3');
  srcH.textContent = 'Sources';
  const ul = document.createElement('ul');
  for (const key of t.sources) {
    const s = doc.sources[key];
    if (!s) continue;
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a, document.createTextNode(' — ' + s.note));
    } else {
      li.textContent = s.name + ' — ' + s.note;
    }
    ul.append(li);
  }
  const cols = document.createElement('div');
  cols.className = 'cols';
  const colGuide = document.createElement('div');
  colGuide.append(guideH, guide, meta);
  const colSrc = document.createElement('div');
  colSrc.append(srcH, ul);
  cols.append(colGuide, colSrc);
  el.append(h, desc, flags, cols);
}

function renderRoadmap() {
  const el = $('roadmap');
  el.hidden = false;
  el.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = 'Roadmap to Platinum';
  const intro = document.createElement('p');
  intro.textContent = 'Five stages, in order. Story first, then strangers, then collectibles, then the long activity grind, then 100% completion cleanup. Tick trophies off in the checklist as you go.';
  el.append(h, intro);
  for (const stage of [1, 2, 3, 4, 5]) {
    const box = document.createElement('div');
    box.className = 'stage';
    const sh = document.createElement('h3');
    sh.textContent = STAGES[stage][0];
    const sp = document.createElement('p');
    sp.textContent = STAGES[stage][1];
    const ol = document.createElement('ol');
    for (const t of trophies.filter((x) => x.roadmap_stage === stage)) {
      const li = document.createElement('li');
      li.textContent = (isEarned(t) ? '✓ ' : '') + t.name + ' (' + gradeLabel(t) + ')' + (t.psn_count !== null && t.psn_count !== undefined ? ' — target ' + t.psn_count : '') + (t.missable ? ' — MISSABLE' : '');
      ol.append(li);
    }
    box.append(sh, sp, ol);
    el.append(box);
  }
}

function renderMissables() {
  const el = $('missables');
  el.hidden = false;
  el.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = 'Missable trophies';
  const note = document.createElement('p');
  note.className = 'miss-note';
  note.textContent = 'On current information only one trophy can be missed. Everything else unlocks through normal play or can be done at any time — but keep a manual save at the start of every chapter anyway, until mission replay is confirmed in-game.';
  el.append(h, note);
  for (const t of trophies.filter((x) => x.missable)) {
    const box = document.createElement('div');
    box.className = 'stage';
    const sh = document.createElement('h3');
    sh.textContent = t.name + ' (' + gradeLabel(t) + ') — MISSABLE';
    const p = document.createElement('p');
    p.textContent = t.guide;
    box.append(sh, p);
    el.append(box);
  }
  const done = document.createElement('p');
  done.textContent = 'All other 54 trophies: not missable on current information. Story trophies unlock as you play the chapters and missions; activity and collectible trophies stay available in the open world.';
  el.append(done);
}

function currentRoute() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/trophy/')) return 'trophy';
  if (hash === '#/roadmap') return 'roadmap';
  if (hash === '#/missables') return 'missables';
  return 'checklist';
}

function renderRoute() {
  const route = currentRoute();
  if (route !== lastRoute) {
    if (route === 'missables') missableEl.checked = true;
    else if (lastRoute === 'missables') missableEl.checked = false;
    lastRoute = route;
  }
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route || (route === 'trophy' && a.dataset.route === 'checklist'));
  });
  $('roadmap').hidden = route !== 'roadmap';
  $('missables').hidden = route !== 'missables';
  if (route === 'roadmap') renderRoadmap();
  if (route === 'missables') renderMissables();
  if (route === 'trophy') {
    const id = Number(location.hash.split('/')[2]);
    renderDetail(id);
  } else {
    $('detail').hidden = true;
    $('detail').replaceChildren();
  }
  renderRows();
}

function renderAll() {
  renderProgress();
  renderNextUp();
  renderRoute();
}

$('export').addEventListener('click', () => {
  const data = JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    save();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
for (const el of [searchEl, kindEl, gradeEl, statusEl, spoilerEl, missableEl]) {
  el.addEventListener('input', renderAll);
  el.addEventListener('change', renderAll);
}
window.addEventListener('hashchange', renderAll);

renderAll();
