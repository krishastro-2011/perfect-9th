/* ============================================================
   GCSE Music Theory Quest — utils.js
   Storage, dates, XP/level math, note/pitch helpers.
   ============================================================ */

const STORAGE_KEY = 'gmq_state_v1';

/* ---------- Persistence ---------- */

function defaultState() {
  return {
    xp: 0,
    level: 1,
    streakCurrent: 0,
    streakBest: 0,
    lastActiveDate: null,       // 'YYYY-MM-DD' — for daily streak
    correctStreak: 0,
    correctStreakBest: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    badges: [],                  // array of badge ids
    examBoard: 'general',        // general | aqa | eduqas
    settings: {
      sound: true,
      ttsNarration: false,   // experimental device-voice fallback for the welcome intro; off by default
      darkMode: false,
      reducedMotion: false,
      difficulty: 'mixed'        // easy | medium | hard | gcse | challenge | mixed
    },
    topicStats: {},               // { topicId: { attempts, correct, learned: bool } }
    mistakes: [],                 // [{qid, question, yourAnswer, correctAnswer, explanation, topic, ts}]
    flashcardStatus: {},          // { cardId: 'known' | 'difficult' }
    dailyChallenge: { date: null, completed: false, score: null },
    xpLog: {},                    // { 'YYYY-MM-DD': xpEarnedThatDay }
    seenQuestionIds: [],          // recently served, to reduce immediate repeats
    mockExamHistory: [],          // [{date, score, total, pct, breakdown}]
    recentTopics: [],             // most recently opened lesson topic ids (newest first)
    trainerStats: { asked: 0, correct: 0 }   // Notation Trainer totals
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // the Eduqas board used to be stored under the key 'wjec' — migrate old saves
    if (parsed && parsed.examBoard === 'wjec') parsed.examBoard = 'eduqas';
    // merge with defaults so new fields survive upgrades
    return deepMerge(defaultState(), parsed);
  } catch (e) {
    console.warn('Could not load state, resetting.', e);
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Could not save state', e);
    return false;
  }
}

function deepMerge(base, extra) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  if (!extra || typeof extra !== 'object') return out;
  for (const k of Object.keys(base)) {
    if (extra[k] === undefined) continue;
    if (typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k]) && typeof extra[k] === 'object') {
      out[k] = deepMerge(base[k], extra[k]);
    } else {
      out[k] = extra[k];
    }
  }
  // include any extra keys not in base (forward compat)
  for (const k of Object.keys(extra)) {
    if (!(k in base)) out[k] = extra[k];
  }
  return out;
}

/* ---------- Dates ---------- */

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

function formatDateShort(dstr) {
  const d = new Date(dstr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

/* ---------- XP / Levels ---------- */

const LEVELS = [
  { level: 1, name: 'Beginner', xpNeeded: 0 },
  { level: 2, name: 'Note Reader', xpNeeded: 150 },
  { level: 3, name: 'Rhythm Apprentice', xpNeeded: 400 },
  { level: 4, name: 'Harmonic Explorer', xpNeeded: 750 },
  { level: 5, name: 'Theory Student', xpNeeded: 1200 },
  { level: 6, name: 'Music Analyst', xpNeeded: 1800 },
  { level: 7, name: 'GCSE Ready', xpNeeded: 2600 },
  { level: 8, name: 'Theory Master', xpNeeded: 3600 }
];

function levelForXp(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpNeeded) current = l;
  }
  return current;
}

function nextLevelInfo(xp) {
  const current = levelForXp(xp);
  const idx = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[idx + 1] || null;
  if (!next) return { current, next: null, pct: 100, remaining: 0 };
  const span = next.xpNeeded - current.xpNeeded;
  const into = xp - current.xpNeeded;
  const pct = Math.min(100, Math.round((into / span) * 100));
  return { current, next, pct, remaining: next.xpNeeded - xp };
}

/* ---------- Mastery ---------- */

function masteryLevel(stat) {
  if (!stat || stat.attempts === 0) return { key: 'not-started', label: 'Not started', icon: '🔴' };
  const acc = stat.correct / stat.attempts;
  if (stat.attempts < 3) return { key: 'learning', label: 'Learning', icon: '🟠' };
  if (acc < 0.5) return { key: 'learning', label: 'Learning', icon: '🟠' };
  if (acc < 0.7) return { key: 'developing', label: 'Developing', icon: '🟡' };
  if (acc < 0.9) return { key: 'secure', label: 'Secure', icon: '🟢' };
  return { key: 'mastered', label: 'Mastered', icon: '🔵' };
}

/* ---------- Misc helpers ---------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c === undefined || c === null || c === false) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function difficultyStars(n) {
  return '⭐'.repeat(n) + '<span class="star-dim">' + '⭐'.repeat(5 - n) + '</span>';
}

const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'GCSE Exam', 5: 'Challenge' };
