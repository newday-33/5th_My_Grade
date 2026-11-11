/* =========================================================
 * 5학년 · What grade are you in? / Where is the ___? · 듣고 따라 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 내 학교 만들기: 내 학년 + 장소 3개(장소 + 층) → 학교 안내도
 * - 연습: 장소별 대화를 줄마다 말하기 + 역할극(A/B) 채점
 * - 따라 말하기 채점: Web Speech API (SpeechRecognition)
 * - 그림: images/ 폴더의 Canva 그림 (없으면 이모지)
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) {
    status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
  }
}
pickVoice();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

function speak(text, rate, onStart, onEnd) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

/* ---------- 문장 만들기 ---------- */
const Q_GRADE = "What grade are you in?";
const Q_GRADE_KO = "너는 몇 학년이니?";
const gradeEn = g => `I'm in the ${g.en} grade.`;
const gradeKo = g => `나는 ${g.ko}이야.`;
const placeEn = p => `Where is the ${p.en}?`;
const placeKo = p => `${koSubj(p.ko)} 어디에 있니?`;
const floorEn = f => `It's on the ${f.en} floor.`;
const floorKo = f => `${f.ko}에 있어.`;

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const plain = rawWord.replace(/[,!?]+$/, "").replace(/\.$/, "");
  const meaning = WORD_MEANINGS[key] || WORD_MEANINGS[plain.toLowerCase()] || WORD_MEANINGS[key.replace(/\.$/, "")] || "(뜻 정보 없음)";
  popup.dataset.word = plain;
  popup.querySelector(".wp-word").textContent = plain;
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  const top = r.bottom + 8 + window.scrollY;
  popup.style.left = left + "px";
  popup.style.top = top + "px";

  speak(plain, 0.8);
}

function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => {
      e.stopPropagation();
      showWordPopup(span, w);
    });
    frag.appendChild(span);
  });
  return frag;
}

/* ---------- 그림 (Canva 이미지 → 없으면 이모지) ---------- */
function makeVisual(item, cls) {
  const emoji = () => {
    const em = document.createElement("div");
    em.className = "emoji" + (cls ? " " + cls : "");
    em.textContent = item.emoji;
    return em;
  };
  if (!item.img) return emoji();
  const img = document.createElement("img");
  img.className = "photo" + (cls ? " " + cls : "");
  img.loading = "lazy";
  img.alt = item.en;
  img.src = item.img;
  img.addEventListener("error", () => img.replaceWith(emoji()));
  return img;
}

/* ---------- 카드 만들기 ---------- */
function makeCard(item, opts) {
  opts = opts || {};
  const div = document.createElement("div");
  div.className = "card" + (opts.tone != null ? " tone-" + opts.tone : "");

  function speakSentence() {
    speak(item.en, null,
      () => div.classList.add("speaking"),
      () => div.classList.remove("speaking"));
  }

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  if (opts.tag) tag.textContent = opts.tag;
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all";
  listenAll.textContent = "듣기 ▶";
  listenAll.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  top.append(tag, listenAll);

  const visual = makeVisual(item);

  const box = document.createElement("div");
  box.className = "sentence-box";
  const txt = document.createElement("div");
  txt.className = "sentence-text";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(item.en));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = item.ko;
  txt.append(en, ko);
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.setAttribute("aria-label", "문장 듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  box.append(txt, speakBtn);

  div.append(top, visual, box);
  return div;
}

function renderGrid(id, list) {
  const grid = document.getElementById(id);
  grid.innerHTML = "";
  list.forEach((item, i) => grid.appendChild(makeCard(item, { tone: (item.tone != null ? item.tone : i) % 6, tag: item.tag })));
}

function makeChip(text, cls, isOn, onClick) {
  const c = document.createElement("button");
  c.className = "chip " + cls + (isOn ? " on" : "");
  c.textContent = text;
  c.addEventListener("click", onClick);
  return c;
}
function setBlank(id, en) {
  const el = document.getElementById(id);
  el.classList.toggle("filled", !!en);
  if (en) { el.innerHTML = ""; el.appendChild(buildWords(en)); }
  else el.textContent = "________";
}

/* ===========================================================
 * 🎓 학년 묻고 답하기
 * =========================================================== */
let currentLevel = "beginner";
let currentCategory = "all";

function renderGradeQuestion() {
  const box = document.getElementById("grade-question");
  box.innerHTML = "";
  const text = document.createElement("div");
  text.className = "q-text";
  const en = document.createElement("div"); en.className = "q-en"; en.appendChild(buildWords(Q_GRADE));
  const ko = document.createElement("div"); ko.className = "q-ko"; ko.textContent = Q_GRADE_KO;
  text.append(en, ko);
  const btn = document.createElement("button");
  btn.className = "speak-btn"; btn.textContent = "🔊"; btn.setAttribute("aria-label", "질문 듣기");
  btn.addEventListener("click", () => speak(Q_GRADE));
  box.append(text, btn);
}

function renderGrades() {
  const view = [];
  GRADE_LEVELS[currentLevel].forEach((item, i) => {
    if (currentCategory === "all" || GRADE_CATEGORIES[i] === currentCategory) {
      const g = GRADES[i];
      view.push(Object.assign({}, item, { emoji: g.emoji, img: g.img, tag: g.ko, tone: i }));
    }
  });
  renderGrid("grade-grid", view);
}

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    synth.cancel(); hidePopup(); renderGrades();
  });
});
document.querySelectorAll("#grade-cat .cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#grade-cat .cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    synth.cancel(); hidePopup(); renderGrades();
  });
});

/* ---------- 빈칸 채우기 공통 ---------- */
let lastFillSpoken = "";
function fillActions(wrap, en) {
  wrap.innerHTML = "";
  if (!en) return;
  const listenBtn = document.createElement("button");
  listenBtn.className = "btn primary";
  listenBtn.textContent = "🔊 문장 듣기";
  listenBtn.addEventListener("click", () => speak(en));
  wrap.append(listenBtn);
  if (en !== lastFillSpoken) { lastFillSpoken = en; speak(en); }
}

/* ---------- 빈칸 채우기: I'm in the ___ grade. ---------- */
let fillGrade = null;
function renderGradeFill() {
  const row = document.getElementById("grade-chips");
  row.innerHTML = "";
  GRADES.forEach(g => {
    row.appendChild(makeChip(`${g.emoji} ${g.en}`, "act", fillGrade === g, () => { fillGrade = g; renderGradeFill(); }));
  });
  setBlank("grade-blank", fillGrade && fillGrade.en);
  document.getElementById("grade-ko").textContent = `나는 ${fillGrade ? fillGrade.ko : "________"}이야.`;
  fillActions(document.getElementById("grade-actions"), fillGrade && `${Q_GRADE} ${gradeEn(fillGrade)}`);
}

/* ===========================================================
 * 🏫 장소 묻기 · 🔢 층 말하기
 * =========================================================== */
function renderPlaces() {
  renderGrid("place-grid", PLACES.map((p, i) => ({ en: placeEn(p), ko: placeKo(p), emoji: p.emoji, img: p.img, tag: p.ko, tone: i })));
}
function renderFloors() {
  renderGrid("floor-grid", FLOORS.map((f, i) => ({ en: floorEn(f), ko: floorKo(f), emoji: f.emoji, img: f.img, tag: f.ko, tone: i })));
}

let askPlace = null, askFloor = null;
function renderAskFill() {
  const pRow = document.getElementById("ask-place-chips");
  const fRow = document.getElementById("ask-floor-chips");
  pRow.innerHTML = ""; fRow.innerHTML = "";
  PLACES.forEach(p => pRow.appendChild(makeChip(`${p.emoji} ${p.en}`, "place", askPlace === p, () => { askPlace = p; renderAskFill(); })));
  FLOORS.forEach(f => fRow.appendChild(makeChip(`${f.emoji} ${f.en}`, "with", askFloor === f, () => { askFloor = f; renderAskFill(); })));
  setBlank("ask-place-blank", askPlace && askPlace.en);
  setBlank("ask-floor-blank", askFloor && askFloor.en);
  document.getElementById("ask-ko").textContent =
    `${askPlace ? koSubj(askPlace.ko) : "________"} 어디에 있니? ― ${askFloor ? askFloor.ko : "________"}에 있어.`;
  fillActions(document.getElementById("ask-actions"), askPlace && askFloor && `${placeEn(askPlace)} ${floorEn(askFloor)}`);
}

/* ===========================================================
 * 🎒 내 학교 만들기 (내 학년 + 장소 3개 × 층)
 * =========================================================== */
const SET_COUNT = 3;
let mySets = [];      // [{ place: id, floor: n }]
let myGrade = null;   // 1~6
let curSet = 0;
let stats = {};       // 문장별 정확도 기록

try {
  const saved = JSON.parse(localStorage.getItem("grade_sets") || "null");
  if (saved && Array.isArray(saved.sets)) {
    mySets = saved.sets.slice(0, SET_COUNT);
    if (saved.grade) myGrade = saved.grade;
  }
} catch (e) {}
while (mySets.length < SET_COUNT) mySets.push({ place: null, floor: null });
try { stats = JSON.parse(localStorage.getItem("grade_stats") || "{}") || {}; } catch (e) {}

function persist() {
  try {
    localStorage.setItem("grade_sets", JSON.stringify({ sets: mySets, grade: myGrade }));
    localStorage.setItem("grade_stats", JSON.stringify(stats));
  } catch (e) {}
}
const findPlace = id => PLACES.find(x => x.id === id) || null;
const findFloor = n => FLOORS.find(x => x.n === n) || null;
const findGrade = n => GRADES.find(x => x.n === n) || null;
function setComplete(s) { return !!(findPlace(s.place) && findFloor(s.floor)); }
function completeCount() { return mySets.filter(setComplete).length; }
function setPlayable(s) { return !!findGrade(myGrade) && setComplete(s); }

/* 세트 → 대화 줄 */
function setLines(s) {
  const g = findGrade(myGrade), p = findPlace(s.place), f = findFloor(s.floor);
  return [
    { who: "A", en: Q_GRADE, ko: Q_GRADE_KO },
    { who: "B", en: gradeEn(g), ko: gradeKo(g) },
    { who: "A", en: placeEn(p), ko: placeKo(p) },
    { who: "B", en: floorEn(f), ko: floorKo(f) },
  ];
}

function updateSetBadge() {
  const c = document.getElementById("set-count");
  if (c) c.textContent = `${completeCount()}/${SET_COUNT}`;
  document.querySelectorAll("#set-tabs .set-tab").forEach((b, i) => {
    b.classList.toggle("active", i === curSet);
    b.classList.toggle("done", setComplete(mySets[i]));
    const p = findPlace(mySets[i].place);
    b.textContent = `장소 ${i + 1} ${p ? p.emoji : ""}${setComplete(mySets[i]) ? " ✓" : ""}`;
  });
}

/* 학교 안내도 (6층 → 1층) */
function renderSchoolMap() {
  const box = document.getElementById("school-floors");
  box.innerHTML = "";
  FLOORS.slice().reverse().forEach(f => {
    const row = document.createElement("div");
    row.className = "school-floor";
    const cur = mySets[curSet];
    if (cur.floor === f.n) row.classList.add("current");
    const lab = document.createElement("div"); lab.className = "floor-label"; lab.textContent = f.ko;
    const rooms = document.createElement("div"); rooms.className = "floor-rooms";
    mySets.forEach((s, i) => {
      const p = findPlace(s.place);
      if (s.floor === f.n && p) {
        const r = document.createElement("button");
        r.className = "room" + (i === curSet ? " current" : "");
        r.title = `${p.en} (${p.ko})`;
        r.textContent = `${p.emoji} ${p.en}`;
        r.addEventListener("click", () => { curSet = i; renderBuilder(); updateSetPreview(); speak(`${placeEn(p)} ${floorEn(f)}`); });
        rooms.appendChild(r);
      }
    });
    row.append(lab, rooms);
    box.appendChild(row);
  });
}

function renderBuilder() {
  const s = mySets[curSet];
  const gradeRow = document.getElementById("build-grade");
  const placeRow = document.getElementById("build-place");
  const floorRow = document.getElementById("build-floor");
  gradeRow.innerHTML = ""; placeRow.innerHTML = ""; floorRow.innerHTML = "";

  GRADES.forEach(g => {
    gradeRow.appendChild(makeChip(`${g.emoji} ${g.en} (${g.ko})`, "act", myGrade === g.n, () => {
      myGrade = g.n; persist(); renderBuilder(); updateSetPreview(); speak(gradeEn(g));
    }));
  });
  const usedElsewhere = new Set(mySets.filter((x, i) => i !== curSet).map(x => x.place).filter(Boolean));
  PLACES.forEach(p => {
    const chip = makeChip(`${p.emoji} ${p.en}`, "place", s.place === p.id, () => {
      s.place = p.id; persist(); renderBuilder(); updateSetPreview(true);
    });
    if (usedElsewhere.has(p.id)) { chip.classList.add("used"); chip.title = "다른 장소 칸에서 이미 골랐어요"; }
    placeRow.appendChild(chip);
  });
  FLOORS.forEach(f => {
    floorRow.appendChild(makeChip(`${f.emoji} ${f.en} (${f.ko})`, "with", s.floor === f.n, () => {
      s.floor = f.n; persist(); renderBuilder(); updateSetPreview(true);
    }));
  });
  updateSetBadge();
  renderSchoolMap();
}

let lastSetSpoken = "";
function updateSetPreview(autoSpeak) {
  const s = mySets[curSet];
  const g = findGrade(myGrade), p = findPlace(s.place), f = findFloor(s.floor);
  setBlank("set-grade", g && g.en);
  document.getElementById("set-grade-ko").textContent = `나는 ${g ? g.ko : "________"}이야.`;
  setBlank("set-place", p && p.en);
  document.getElementById("set-place-ko").textContent = `${p ? koSubj(p.ko) : "________"} 어디에 있니?`;
  setBlank("set-floor", f && f.en);
  document.getElementById("set-floor-ko").textContent = `${f ? f.ko : "________"}에 있어.`;

  const status = document.getElementById("set-status");
  const ok = setPlayable(s);
  status.className = "dlg-status" + (ok ? " ok" : "");
  if (!g) status.textContent = "🎓 먼저 위에서 내 학년을 골라요 👆";
  else if (!p) status.textContent = `장소 ${curSet + 1} · 1️⃣ 학교 장소를 골라 보세요 👇`;
  else if (!f) status.textContent = `장소 ${curSet + 1} · 2️⃣ 몇 층에 있는지 골라요 👇`;
  else status.textContent = `✅ 장소 ${curSet + 1} 완성! ${completeCount() < SET_COUNT ? "다음 장소도 만들어 보세요." : "세 장소 모두 완성! 📝 워크시트에 적고 🎤 연습으로 가요."}`;
  renderSheetSummary();
  document.getElementById("set-listen").disabled = !ok;
  updateSetBadge();
  if (ok && autoSpeak) {
    const en = setLines(s).slice(2).map(l => l.en).join(" ");
    if (en !== lastSetSpoken) { lastSetSpoken = en; speak(en); }
  } else if (!ok) lastSetSpoken = "";
}

document.querySelectorAll("#set-tabs .set-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    curSet = +btn.dataset.set; synth.cancel(); lastSetSpoken = "";
    renderBuilder(); updateSetPreview();
  });
});
document.getElementById("set-speak-q1").addEventListener("click", () => speak(Q_GRADE));
document.getElementById("set-speak-a1").addEventListener("click", () => {
  const g = findGrade(myGrade); if (g) speak(gradeEn(g));
});
document.getElementById("set-speak-q2").addEventListener("click", () => {
  const p = findPlace(mySets[curSet].place); if (p) speak(placeEn(p));
});
document.getElementById("set-speak-a2").addEventListener("click", () => {
  const f = findFloor(mySets[curSet].floor); if (f) speak(floorEn(f));
});
document.getElementById("set-listen").addEventListener("click", () => {
  const s = mySets[curSet];
  if (setPlayable(s)) speak(setLines(s).map(l => l.en).join(" "));
});
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
document.getElementById("set-random").addEventListener("click", () => {
  const s = mySets[curSet];
  const used = new Set(mySets.filter((x, i) => i !== curSet).map(x => x.place));
  const pool = PLACES.filter(p => !used.has(p.id));
  s.place = pick(pool.length ? pool : PLACES).id;
  s.floor = pick(FLOORS).n;
  if (!myGrade) myGrade = pick(GRADES).n;
  persist(); renderBuilder(); updateSetPreview(true);
});
document.getElementById("set-clear").addEventListener("click", () => {
  mySets[curSet] = { place: null, floor: null };
  synth.cancel(); persist(); renderBuilder(); updateSetPreview();
});


/* ---- 음성 인식 (정확도 측정) ---- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
const rec = srSupported ? new SR() : null;
if (rec) { rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; }
let recBusy = false;

const ORDINAL_DIGITS = { "1st": "first", "2nd": "second", "3rd": "third", "4th": "fourth", "5th": "fifth", "6th": "sixth" };
function normalize(s) {
  return s.toLowerCase()
    .replace(/’/g, "'")
    .replace(/\b([1-6](?:st|nd|rd|th))\b/g, m => ORDINAL_DIGITS[m] || m)
    .replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return Math.abs(a.length - b.length) <= 1 && levenshtein(a, b) <= 1;
}
const STOPWORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "is", "are", "i", "i'm", "it's", "its", "it"]);
function scoreMatch(target, heard) {
  const t = normalize(target).split(" ").filter(Boolean);
  const h = normalize(heard).split(" ").filter(Boolean);
  let content = t.filter(w => !STOPWORDS.has(w));
  if (!content.length) content = t;
  let hit = 0;
  content.forEach(w => { if (h.some(x => wordsClose(x, w))) hit++; });
  let score = hit / content.length;
  if (score >= 0.5) score = Math.min(1, score + 0.12);
  return score;
}
function practiceAttempt(target, cb) {
  if (!rec || recBusy) { cb.onend && cb.onend(); return; }
  recBusy = true;
  let score = 0, heard = "", errCode = null;
  rec.onresult = e => {
    const alts = e.results[0];
    for (let i = 0; i < alts.length; i++) {
      const s = scoreMatch(target, alts[i].transcript);
      if (s > score) { score = s; heard = alts[i].transcript; }
    }
  };
  rec.onerror = ev => { errCode = ev.error; };
  rec.onend = () => {
    recBusy = false;
    if (errCode && score === 0) cb.onerror && cb.onerror(errCode);
    else cb.onresult && cb.onresult(Math.round(score * 100), heard);
    cb.onend && cb.onend();
  };
  try { rec.start(); } catch (e) { recBusy = false; cb.onend && cb.onend(); }
}

/* ---- 말한 뒤 콜백 (음성이 없어도 넘어가도록 안전장치) ---- */
function speakThen(text, cb) {
  let done = false;
  const finish = () => { if (!done) { done = true; cb(); } };
  const timer = setTimeout(finish, Math.min(9000, 1500 + text.length * 90));
  speak(text, null, null, () => { clearTimeout(timer); finish(); });
}

function statsText(en, last) {
  const s = stats[en] || { attempts: 0, best: 0 };
  return `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${s.best ? s.best + "%" : "--"}</b>` +
    ` · <b>${s.attempts}</b>회`;
}
function recordScore(en, score) {
  const s = stats[en] || { attempts: 0, best: 0 };
  s.attempts++; s.best = Math.max(s.best, score); stats[en] = s; persist();
}
function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function feedbackHtml(score, heard) {
  const h = `<span class="heard">내 발음: ${heard ? escapeHtml(heard) : "(못 들었어요)"}</span>`;
  if (score >= 75) return ["good", `⭐ 훌륭해요! ${score}% ${h}`];
  if (score >= 45) return ["good", `👍 좋아요! 한 번 더! ${score}% ${h}`];
  return ["bad", `🔁 다시 또박또박! ${score}% ${h}`];
}

/* 한 문장 연습 줄: [🔊] 문장/뜻 [🎙️ 말하기] 점수 → 피드백 */
function makeSpeakRow(en, ko, who) {
  const row = document.createElement("div");
  row.className = "prow" + (who ? " who-" + who.toLowerCase() : "");

  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn small";
  speakBtn.setAttribute("aria-label", "듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", () => speak(en));

  const txt = document.createElement("div");
  txt.className = "prow-text";
  if (who) { const w = document.createElement("span"); w.className = "prow-who"; w.textContent = who; txt.appendChild(w); }
  const enEl = document.createElement("div"); enEl.className = "en"; enEl.appendChild(buildWords(en));
  const koEl = document.createElement("div"); koEl.className = "ko"; koEl.textContent = ko;
  txt.append(enEl, koEl);

  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const score = document.createElement("div");
  score.className = "pstats";
  score.innerHTML = statsText(en, null);
  const fb = document.createElement("div");
  fb.className = "mic-feedback";

  if (!srSupported) { mic.disabled = true; mic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }

  function attempt(after) {
    if (recBusy || !srSupported) { after && after(); return; }
    mic.classList.add("recording");
    row.classList.add("active");
    fb.className = "mic-feedback"; fb.textContent = "🔴 듣고 있어요... 또박또박 말해보세요!";
    practiceAttempt(en, {
      onresult: (s, heard) => {
        recordScore(en, s);
        score.innerHTML = statsText(en, s);
        const [cls, html] = feedbackHtml(s, heard);
        fb.className = "mic-feedback " + cls; fb.innerHTML = html;
      },
      onerror: err => {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요.";
      },
      onend: () => { mic.classList.remove("recording"); row.classList.remove("active"); after && after(); }
    });
  }
  mic.addEventListener("click", () => attempt());

  const main = document.createElement("div");
  main.className = "prow-main";
  main.append(speakBtn, txt, mic, score);
  row.append(main, fb);
  row._attempt = attempt;
  row._who = who;
  row._en = en;
  return row;
}


/* ===========================================================
 * 📝 워크시트에 적기
 * =========================================================== */
function sheetRow(label, en, ko) {
  const row = document.createElement("div");
  row.className = "sheet-row" + (en ? "" : " empty");
  const lab = document.createElement("div"); lab.className = "sheet-label"; lab.textContent = label;
  const val = document.createElement("div"); val.className = "sheet-val";
  if (en) {
    const e = document.createElement("div"); e.className = "en"; e.appendChild(buildWords(en));
    const k = document.createElement("div"); k.className = "ko"; k.textContent = ko;
    val.append(e, k);
  } else val.textContent = "아직 고르지 않았어요";
  const btn = document.createElement("button");
  btn.className = "speak-btn small"; btn.textContent = "🔊"; btn.disabled = !en;
  btn.addEventListener("click", () => en && speak(en));
  row.append(lab, val, btn);
  return row;
}
function renderSheetSummary() {
  const box = document.getElementById("sheet-summary");
  if (!box) return;
  box.innerHTML = "";
  const g = findGrade(myGrade);
  box.appendChild(sheetRow("학년 묻기", Q_GRADE, Q_GRADE_KO));
  box.appendChild(sheetRow("내 학년", g && gradeEn(g), g && gradeKo(g)));
  mySets.forEach((s, i) => {
    const p = findPlace(s.place), f = findFloor(s.floor);
    box.appendChild(sheetRow(`장소 ${i + 1} 묻기`, p && placeEn(p), p && placeKo(p)));
    box.appendChild(sheetRow(`장소 ${i + 1} 대답`, p && f && floorEn(f), p && f && floorKo(f)));
  });
}

/* ===========================================================
 * 👫 짝 활동 카드
 * =========================================================== */
function renderPairCards() {
  const box = document.getElementById("pair-cards");
  box.innerHTML = "";
  const g = findGrade(myGrade);
  const done = mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s));
  if (!done.length || !g) {
    const p = document.createElement("p"); p.className = "practice-empty";
    p.innerHTML = "아직 내 학교가 완성되지 않았어요! <b>🎒 내 학교 만들기</b>에서 내 학년과 장소·층을 먼저 골라요.";
    box.appendChild(p); return;
  }
  done.forEach(([s, i]) => {
    const p = findPlace(s.place), f = findFloor(s.floor);
    const card = document.createElement("div");
    card.className = "pair-card tone-" + (i % 6);
    const head = document.createElement("div"); head.className = "pair-head";
    head.innerHTML = `<span class="card-tag tag-combo">장소 ${i + 1}</span>`;
    head.appendChild(makeVisual(p, "pair-visual"));

    const line = (cls, who, en) => {
      const d = document.createElement("div"); d.className = "pair-line " + cls;
      const w = document.createElement("div"); w.className = "pair-who"; w.textContent = who;
      const e = document.createElement("div"); e.className = "pair-en"; e.appendChild(buildWords(en));
      d.append(w, e); return d;
    };
    const tools = document.createElement("div"); tools.className = "ptools";
    const b1 = document.createElement("button"); b1.className = "btn small primary"; b1.textContent = "🔊 질문 듣기";
    b1.addEventListener("click", () => speak(`${Q_GRADE} ${placeEn(p)}`));
    const b2 = document.createElement("button"); b2.className = "btn small"; b2.textContent = "🔊 대답 듣기";
    b2.addEventListener("click", () => speak(`${gradeEn(g)} ${floorEn(f)}`));
    tools.append(b1, b2);
    card.append(head,
      line("me", "🙋 친구에게 묻기", Q_GRADE),
      line("friend", "🙆 내 대답", gradeEn(g)),
      line("me", "🙋 친구에게 묻기", placeEn(p)),
      line("friend", "🙆 내 대답 (내 학교 안내도)", floorEn(f)),
      tools);
    box.appendChild(card);
  });
  const note = document.createElement("p"); note.className = "hint pair-note";
  note.innerHTML = `💬 친구는 <b>I'm in the ___ grade.</b> · <b>It's on the ___ floor.</b> 로 대답해요. 친구의 학년과 층을 잘 듣고 워크시트에 적어요!`;
  box.appendChild(note);
}

/* ===========================================================
 * 🎤 컴퓨터와 미리 연습하기 (장소별 대화: 줄마다 말하기 + 역할극)
 * =========================================================== */
function makeSetCard(s, idx) {
  const card = document.createElement("div");
  card.className = "pcard pcard-dialog";
  const p = findPlace(s.place);

  const top = document.createElement("div");
  top.className = "card-top";
  const left = document.createElement("div"); left.className = "ptag-left";
  const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = `🎒 장소 ${idx + 1}`;
  const title = document.createElement("span"); title.className = "pset-title"; title.textContent = `${p.emoji} ${p.en}`;
  left.append(tag, title);
  top.append(left);
  card.appendChild(top);

  const body = document.createElement("div");
  const tools = document.createElement("div"); tools.className = "ptools";
  const roleNote = document.createElement("div"); roleNote.className = "role-note";
  card.append(body, tools, roleNote);

  const rows = setLines(s).map(l => makeSpeakRow(l.en, l.ko, l.who));
  rows.forEach(r => body.appendChild(r));
  let playing = false;

  const allBtn = document.createElement("button");
  allBtn.className = "btn small"; allBtn.textContent = "🔊 전체 듣기";
  allBtn.addEventListener("click", () => speak(rows.map(r => r._en).join(" ")));
  const roleA = document.createElement("button");
  roleA.className = "btn small primary"; roleA.textContent = "🎭 내가 A (묻기)";
  const roleB = document.createElement("button");
  roleB.className = "btn small primary"; roleB.textContent = "🎭 내가 B (대답하기)";
  roleA.addEventListener("click", () => rolePlay("A"));
  roleB.addEventListener("click", () => rolePlay("B"));
  tools.append(allBtn, roleA, roleB);

  function rolePlay(me) {
    const btns = [roleA, roleB];
    if (playing || recBusy) return;
    if (!srSupported) { roleNote.textContent = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; return; }
    playing = true; btns.forEach(b => b.disabled = true);
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; btns.forEach(b => b.disabled = false);
        roleNote.textContent = "🎉 역할극 끝! 잘했어요. 역할을 바꿔서도 해 볼까요?";
        return;
      }
      const r = rows[i]; i++;
      r.classList.add("turn");
      if (r._who === me) {
        roleNote.textContent = `🎙️ 내 차례! "${r._en}" 라고 말해보세요.`;
        r._attempt(() => setTimeout(step, 500));
      } else {
        roleNote.textContent = `👂 컴퓨터(${r._who})가 말해요. 잘 들어보세요.`;
        speakThen(r._en, () => setTimeout(step, 400));
      }
    };
    step();
  }
  return card;
}

function renderPractice() {
  renderPairCards();
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  list.innerHTML = "";
  const done = findGrade(myGrade) ? mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s)) : [];
  if (!done.length) { empty.style.display = "block"; return; }
  empty.style.display = "none";
  done.forEach(([s, i]) => list.appendChild(makeSetCard(s, i)));
  if (done.length < SET_COUNT) {
    const note = document.createElement("p");
    note.className = "practice-empty";
    note.innerHTML = `아직 <b>${SET_COUNT - done.length}개</b> 장소가 비어 있어요. <b>🎒 내 학교 만들기</b>에서 마저 만들어 보세요.`;
    list.appendChild(note);
  }
}


/* ---------- 초기 렌더 ---------- */
renderGradeQuestion();
renderGrades();
renderGradeFill();
renderPlaces();
renderFloors();
renderAskFill();
renderBuilder();
updateSetPreview();

/* ---------- 탭 전환 ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    synth.cancel();
    hidePopup();
    if (btn.dataset.tab === "practice") renderPractice();
    if (btn.dataset.tab === "build") { lastSetSpoken = ""; renderBuilder(); updateSetPreview(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
