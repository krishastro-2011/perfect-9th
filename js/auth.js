/* ============================================================
   Perfect 9th — auth.js
   A LOCAL account for this browser: email + username + password.

   - The password is never stored. We keep a random salt and a
     salted hash (PBKDF2-SHA256 where the browser supports it, otherwise
     an iterated SHA-256 fallback implemented below).
   - Nothing is sent anywhere. This is a privacy gate that keeps the
     studio tidy on a shared device; it is NOT protection against someone
     who has full access to the browser's storage.
   - Older versions stored {email, password} in plain text. Those accounts
     are upgraded automatically the first time their owner logs in.
   ============================================================ */

const AUTH_STORAGE_KEY = 'gmq_auth_v1';      // same key as before so existing accounts are found
const AUTH_SESSION_KEY = 'gmq_session_v1';   // per-tab flag so a page refresh does not log you out
const PBKDF2_ITERATIONS = 150000;
const FALLBACK_ITERATIONS = 20000;

const MUSIC_QUOTES = [
  { text: 'Music is the shorthand of emotion.', author: 'Leo Tolstoy' },
  { text: 'Without music, life would be a mistake.', author: 'Friedrich Nietzsche' },
  { text: 'Where words fail, music speaks.', author: 'Hans Christian Andersen' },
  { text: 'Where words leave off, music begins.', author: 'Heinrich Heine' },
  { text: 'Music expresses that which cannot be put into words and that which cannot remain silent.', author: 'Victor Hugo' },
  { text: 'To stop the flow of music would be like the stopping of time itself.', author: 'Aaron Copland' }
];
let lastQuoteIndex = -1;
let authMode = null;          // 'login' | 'signup' | 'reset' | 'legacy' | 'username' — chosen from the stored account

function getMusicQuote() {
  let index = Math.floor(Math.random() * MUSIC_QUOTES.length);
  if (MUSIC_QUOTES.length > 1 && index === lastQuoteIndex) index = (index + 1) % MUSIC_QUOTES.length;
  lastQuoteIndex = index;
  return MUSIC_QUOTES[index];
}

/* ---------- storage ---------- */

function getAuthAccount() {
  try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)); } catch (e) { return null; }
}
function saveAuthAccount(account) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
}
function isLegacyAccount(a) { return !!(a && a.password && !a.hash); }
function currentUsername() { const a = getAuthAccount(); return a && a.username ? a.username : ''; }
function hasSession() { try { return sessionStorage.getItem(AUTH_SESSION_KEY) === '1'; } catch (e) { return false; } }
function startSession() { try { sessionStorage.setItem(AUTH_SESSION_KEY, '1'); } catch (e) { /* ignore */ } }
function logout() { try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch (e) { /* ignore */ } authMode = null; showAuthScreen(); }

function maskEmail(email) {
  const [user, domain] = String(email || '').split('@');
  if (!domain) return '';
  const shown = user.length <= 2 ? user[0] || '' : user.slice(0, 2);
  return shown + '•'.repeat(Math.max(2, Math.min(6, user.length - shown.length))) + '@' + domain;
}

/* ---------- validation ---------- */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Please enter a valid email address, like you@example.com.';
}
function validateUsername(name) {
  if (name.length < 3 || name.length > 20) return 'Your username must be 3–20 characters long.';
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(name)) return 'Usernames can use letters, numbers, dots, dashes and underscores, and must start with a letter or number.';
  return '';
}
function validatePassword(pw, username, email) {
  if (pw.length < 8) return 'Your password must be at least 8 characters.';
  if (/^\d+$/.test(pw)) return 'Please add some letters to your password — numbers only is too easy to guess.';
  if (username && pw.toLowerCase() === username.toLowerCase()) return 'Your password should not be the same as your username.';
  if (email && pw.toLowerCase() === email.toLowerCase()) return 'Your password should not be the same as your email.';
  return '';
}

/* ---------- hashing ---------- */

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

/** Pure-JS SHA-256 (Uint8Array -> Uint8Array). Used only when Web Crypto is unavailable. */
function sha256Bytes(data) {
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const len = data.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(data);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor((len * 8) / 0x100000000));
  dv.setUint32(padded.length - 4, (len * 8) >>> 0);
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setUint32(i * 4, H[i]);
  return out;
}

function bytesToB64(bytes) { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s); }
function b64ToBytes(b64) { const s = atob(b64); const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; }
function utf8Bytes(str) { return new TextEncoder().encode(str); }

function randomBytes(n) {
  const out = new Uint8Array(n);
  if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(out);
  else for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  return out;
}

function webCryptoAvailable() { return !!(window.crypto && window.crypto.subtle && window.crypto.subtle.importKey); }

async function derivePasswordHash(password, saltBytes, algo, iterations) {
  if (algo === 'pbkdf2-sha256') {
    const key = await window.crypto.subtle.importKey('raw', utf8Bytes(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' }, key, 256);
    return bytesToB64(new Uint8Array(bits));
  }
  // fallback: iterated salted SHA-256
  const pw = utf8Bytes(password);
  let h = sha256Bytes(Uint8Array.from([...saltBytes, ...pw]));
  for (let i = 1; i < iterations; i++) h = sha256Bytes(Uint8Array.from([...h, ...saltBytes]));
  return bytesToB64(h);
}

async function makeCredential(password) {
  const salt = randomBytes(16);
  const algo = webCryptoAvailable() ? 'pbkdf2-sha256' : 'sha256-iter';
  const iter = algo === 'pbkdf2-sha256' ? PBKDF2_ITERATIONS : FALLBACK_ITERATIONS;
  return { salt: bytesToB64(salt), hash: await derivePasswordHash(password, salt, algo, iter), algo, iter };
}

async function verifyPassword(account, password) {
  if (!account) return false;
  if (isLegacyAccount(account)) return account.password === password;
  if (account.algo === 'pbkdf2-sha256' && !webCryptoAvailable()) return false;
  const hash = await derivePasswordHash(password, b64ToBytes(account.salt), account.algo, account.iter);
  if (hash.length !== account.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ account.hash.charCodeAt(i);
  return diff === 0;
}

/* ---------- account operations (also used by Settings) ---------- */

async function createAccount(email, username, password) {
  const cred = await makeCredential(password);
  const account = { v: 2, email: email.toLowerCase(), username, ...cred, createdAt: new Date().toISOString() };
  saveAuthAccount(account);
  return account;
}
async function setAccountPassword(newPassword) {
  const a = getAuthAccount();
  const cred = await makeCredential(newPassword);
  const upgraded = { v: 2, email: a.email, username: a.username || '', ...cred, createdAt: a.createdAt || new Date().toISOString() };
  saveAuthAccount(upgraded);
  return upgraded;
}

/* ---------- friendly avatar ----------
   Every visual choice (skin, hair style/colour, outfit, accessory) is an
   explicit, storable index rather than something silently derived — so an
   avatar built during onboarding renders identically everywhere, forever,
   until the person deliberately changes it. A plain username STRING is
   still accepted everywhere for backwards compatibility (existing accounts
   from before avatar customisation existed): in that case a deterministic
   config is derived from the name, exactly as the avatar always used to
   look, so nobody's avatar silently changes underneath them. */

function hashString(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/** Always-non-negative modulo — plain % can go negative in JS when the shifted
    hash's top bit lands the value in signed-32-bit range, and a negative array
    index silently renders as `undefined` (an invalid SVG path). */
function posMod(n, m) { return ((n % m) + m) % m; }

const AVATAR_SKINS = ['#f6d5b8', '#e9b98f', '#c98f63', '#a86a45', '#7b4a2d', '#f2c9a5'];
const AVATAR_HAIR_COLORS = ['#2b1d14', '#4a2c17', '#1c1c1c', '#8a5a2b', '#c7873a', '#5b3a5e', '#e2b155', '#7ecba0'];
// three silhouettes: 0 the original wavy bob, 1 a short crop, 2 long flowing hair
const AVATAR_HAIR_STYLES = [
  'M19 26 C19 14 27 11 32 11 C38 11 45 14 45 26 C41 20 36 19 32 19 C27 19 23 20 19 26 Z',
  'M20 24 C20 15 26 12 32 12 C38 12 44 15 44 24 C44 18 38 16 32 16 C26 16 20 18 20 24 Z',
  'M20 24 C20 15 26 12 32 12 C38 12 44 15 44 24 C44 18 38 16 32 16 C26 16 20 18 20 24 Z ' +
  'M19 23 C14 26 13 37 16 47 C19 45 20 34 21 26 Z ' +
  'M45 23 C50 26 51 37 48 47 C45 45 44 34 43 26 Z'
];
const AVATAR_SHIRTS = ['#2f6b57', '#c2553a', '#3e5c9a', '#8a5aa8', '#d09a2e', '#1f7a8c'];
// musical-themed accessories: none, the original headphones, a note pin, a headband
const AVATAR_ACCESSORIES = ['none', 'headphones', 'note-pin', 'headband'];

/** A stable, deterministic config for any name — the avatar's look before (or absent)
    any deliberate customisation, and the fallback for accounts predating this feature. */
function defaultAvatarConfig(seed) {
  const h = hashString(String(seed || 'guest').toLowerCase());
  return {
    skin: posMod(h, AVATAR_SKINS.length),
    hairStyle: posMod(h >>> 2, AVATAR_HAIR_STYLES.length),
    hairColor: posMod(h >>> 4, AVATAR_HAIR_COLORS.length),
    shirt: posMod(h >>> 7, AVATAR_SHIRTS.length),
    accessory: 1, // headphones — matches every avatar drawn before this feature existed
    seed: String(seed || 'guest')
  };
}

/** The account's saved avatar, or a sensible deterministic default if it never customised one. */
function getAccountAvatarConfig() {
  const account = getAuthAccount() || {};
  return account.avatar ? { ...defaultAvatarConfig(account.username), ...account.avatar } : defaultAvatarConfig(account.username);
}

/** subject: a username string (legacy path, deterministic look) OR a config object
    (as produced by defaultAvatarConfig / the avatar picker). Missing fields in a
    partial config fall back to that seed's deterministic default. */
function avatarSvg(subject, size = 56) {
  const isConfig = subject && typeof subject === 'object';
  const seed = isConfig ? (subject.seed || 'guest') : subject;
  const cfg = isConfig ? { ...defaultAvatarConfig(seed), ...subject } : defaultAvatarConfig(seed);
  const skin = AVATAR_SKINS[posMod(cfg.skin, AVATAR_SKINS.length)];
  const hair = AVATAR_HAIR_COLORS[posMod(cfg.hairColor, AVATAR_HAIR_COLORS.length)];
  const shirt = AVATAR_SHIRTS[posMod(cfg.shirt, AVATAR_SHIRTS.length)];
  const hairPath = AVATAR_HAIR_STYLES[posMod(cfg.hairStyle, AVATAR_HAIR_STYLES.length)];
  const accessory = AVATAR_ACCESSORIES.includes(cfg.accessory) ? cfg.accessory : 'headphones';
  const h = hashString(String(seed || 'guest').toLowerCase());
  const bg = `hsl(${h % 360} 55% 88%)`;
  const s = svgEl('svg', { class: 'avatar', viewBox: '0 0 64 64', width: size, height: size, role: 'img', 'aria-label': 'Avatar for ' + (seed || 'you') });
  const add = (tag, attrs) => s.appendChild(svgEl(tag, attrs));
  add('circle', { cx: 32, cy: 32, r: 32, fill: bg });
  add('path', { d: 'M8 64 C8 48 20 44 32 44 C44 44 56 48 56 64 Z', fill: shirt });
  add('rect', { x: 27, y: 38, width: 10, height: 9, rx: 3, fill: skin });
  add('circle', { cx: 32, cy: 27, r: 13, fill: skin });
  add('path', { d: hairPath, fill: hair });
  add('circle', { cx: 27.5, cy: 28, r: 1.7, fill: '#2b2b2b' });
  add('circle', { cx: 36.5, cy: 28, r: 1.7, fill: '#2b2b2b' });
  add('path', { d: 'M27 33.5 Q32 38 37 33.5', fill: 'none', stroke: '#8a3b2c', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
  if (accessory === 'headphones') {
    add('path', { d: 'M17.5 28 C17 12 47 12 46.5 28', fill: 'none', stroke: '#2b2b2b', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    add('rect', { x: 14.5, y: 25, width: 5.5, height: 10, rx: 2.6, fill: '#2b2b2b' });
    add('rect', { x: 44, y: 25, width: 5.5, height: 10, rx: 2.6, fill: '#2b2b2b' });
  } else if (accessory === 'headband') {
    add('rect', { x: 18.5, y: 21.5, width: 27, height: 4, rx: 2, fill: 'var(--wi-accent, #e2b155)' });
  } else if (accessory === 'note-pin') {
    add('circle', { cx: 45, cy: 42, r: 7.5, fill: '#fffaf0', stroke: '#2b2b2b', 'stroke-width': 1 });
    add('circle', { cx: 43, cy: 44.5, r: 2, fill: '#2b2b2b' });
    add('rect', { x: 44.6, y: 37.5, width: 1.3, height: 8, fill: '#2b2b2b' });
    add('path', { d: 'M44.6 37.5 L48 38.6 L48 40.6 L44.6 39.5 Z', fill: '#2b2b2b' });
  }
  return s;
}

/** A live-preview picker for customising the avatar: skin, hair style/colour, outfit
    and a musical-themed accessory. cfg is mutated in place and re-read by getConfig(),
    so the caller can freely snapshot it at any time (e.g. when the user confirms). */
function buildAvatarPicker(initialConfig) {
  const cfg = { ...initialConfig };
  const preview = el('div', { class: 'wi-avatar-preview' });
  const redraw = () => { preview.innerHTML = ''; const svg = avatarSvg(cfg, 120); svg.classList.add('wi-avatar-swap'); preview.appendChild(svg); };
  redraw();

  const row = (label, key, options, swatchFn) => {
    const isAccessory = key === 'accessory';
    const swatches = options.map((opt, i) => {
      const b = el('button', {
        type: 'button', class: 'wi-swatch', 'aria-label': `${label} ${i + 1}`, 'aria-pressed': String(cfg[key] === (isAccessory ? opt : i)),
        style: swatchFn ? swatchFn(opt) : '',
        onclick: () => { cfg[key] = isAccessory ? opt : i; redraw(); swatches.forEach((btn, j) => btn.setAttribute('aria-pressed', String(j === i))); }
      });
      if (isAccessory) b.textContent = ({ none: '—', headphones: '🎧', 'note-pin': '♪', headband: '▬' })[opt];
      return b;
    });
    return el('div', { class: 'wi-picker-row' }, [el('span', { class: 'wi-picker-label' }, label), el('div', { class: 'wi-swatch-row' }, swatches)]);
  };

  const randomBtn = el('button', {
    type: 'button', class: 'wi-ghost-btn', onclick: () => {
      cfg.skin = Math.floor(Math.random() * AVATAR_SKINS.length);
      cfg.hairStyle = Math.floor(Math.random() * AVATAR_HAIR_STYLES.length);
      cfg.hairColor = Math.floor(Math.random() * AVATAR_HAIR_COLORS.length);
      cfg.shirt = Math.floor(Math.random() * AVATAR_SHIRTS.length);
      cfg.accessory = AVATAR_ACCESSORIES[Math.floor(Math.random() * AVATAR_ACCESSORIES.length)];
      redraw();
      syncAll();
    }
  }, '🎲 Randomise');

  const rows = [
    row('Skin tone', 'skin', AVATAR_SKINS, c => `background:${c}`),
    row('Hair colour', 'hairColor', AVATAR_HAIR_COLORS, c => `background:${c}`),
    row('Hair style', 'hairStyle', AVATAR_HAIR_STYLES, () => '⟳'),
    row('Outfit', 'shirt', AVATAR_SHIRTS, c => `background:${c}`),
    row('Accessory', 'accessory', AVATAR_ACCESSORIES, () => '')
  ];
  function syncAll() {
    rows.forEach((r, ri) => {
      const key = ['skin', 'hairColor', 'hairStyle', 'shirt', 'accessory'][ri];
      Array.from(r.querySelectorAll('.wi-swatch')).forEach((btn, i) => btn.setAttribute('aria-pressed', String(cfg[key] === i || cfg[key] === AVATAR_ACCESSORIES[i])));
    });
  }
  const node = el('div', { class: 'wi-avatar-picker' }, [preview, el('div', { class: 'wi-picker-rows' }, rows), randomBtn]);
  return { node, getConfig: () => ({ ...cfg }) };
}

/* ---------- screens ---------- */

function passwordField(id, label, autocomplete, placeholder) {
  const input = el('input', { id, name: id, type: 'password', autocomplete, placeholder: placeholder || '', required: true });
  const toggle = el('button', { class: 'auth-reveal', type: 'button', 'aria-label': 'Show password', 'aria-pressed': 'false', onclick: () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  } }, 'Show');
  return { input, nodes: [el('label', { class: 'auth-label', for: id }, label), el('div', { class: 'auth-password-wrap' }, [input, toggle])] };
}

function textField(id, label, type, autocomplete, placeholder, extra = {}) {
  const input = el('input', { id, name: id, type, autocomplete, placeholder: placeholder || '', required: true, ...extra });
  return { input, nodes: [el('label', { class: 'auth-label', for: id }, label), input] };
}

function showAuthScreen(message = '', kind = '') {
  const account = getAuthAccount();
  if (!authMode) authMode = !account ? 'signup' : isLegacyAccount(account) ? 'legacy' : (account.username ? 'login' : 'username');
  const quote = getMusicQuote();
  document.body.innerHTML = '';
  document.body.className = 'auth-page';

  const msg = el('p', { class: 'auth-message' + (message ? ' ' + kind : ''), role: 'alert', 'aria-live': 'polite' }, message || '');
  if (!message) msg.style.display = 'none';
  const say = (text, k = 'error') => { msg.textContent = text; msg.className = 'auth-message ' + k; msg.style.display = text ? '' : 'none'; };
  const submitBtn = label => el('button', { class: 'auth-submit', type: 'submit' }, label);
  const busy = (btn, on, label) => { btn.disabled = on; btn.textContent = on ? 'One moment…' : label; };
  const link = (label, fn) => el('button', { class: 'auth-link', type: 'button', onclick: fn }, label);
  const go = (mode, m = '', k = '') => { authMode = mode; showAuthScreen(m, k); };

  let kicker, heading, intro, fields = [], submitLabel, onSubmit, footer = [], header = null, firstInput = null;

  if (authMode === 'signup') {
    kicker = 'Your theory journey starts here'; heading = 'Find your rhythm.';
    intro = 'Create a private account for this browser so your progress, streaks and mistakes are kept safe.';
    const email = textField('auth-email', 'Email address', 'email', 'email', 'you@example.com');
    const user = textField('auth-username', 'Username', 'text', 'username', 'What should we call you?', { maxlength: '20', minlength: '3' });
    const pw = passwordField('auth-password', 'Password', 'new-password', 'At least 8 characters');
    const pw2 = passwordField('auth-password2', 'Confirm password', 'new-password', 'Type it again');
    fields = [...email.nodes, ...user.nodes, el('p', { class: 'auth-hint' }, '3–20 letters, numbers, dots, dashes or underscores.'), ...pw.nodes, ...pw2.nodes];
    firstInput = email.input;
    submitLabel = 'Create my account';
    onSubmit = async (btn) => {
      const e = email.input.value.trim().toLowerCase(), u = user.input.value.trim(), p = pw.input.value;
      const err = validateEmail(e) || validateUsername(u) || validatePassword(p, u, e) || (p !== pw2.input.value ? 'The two passwords do not match.' : '');
      if (err) return say(err);
      busy(btn, true, submitLabel);
      try { await createAccount(e, u, p); startSession(); enterApp(); } catch (ex) { console.error(ex); busy(btn, false, submitLabel); say('Sorry, the account could not be saved in this browser.'); }
    };
  } else if (authMode === 'login') {
    kicker = 'Welcome back, musician'; heading = 'Make a little noise.';
    intro = 'Enter your password to pick up where you left off.';
    header = el('div', { class: 'auth-greeting' }, [
      avatarSvg(getAccountAvatarConfig(), 64),
      el('div', {}, [el('div', { class: 'auth-greeting-hi' }, `Hi, ${account.username}!`), el('div', { class: 'auth-greeting-email' }, maskEmail(account.email))])
    ]);
    const hiddenUser = el('input', { type: 'text', name: 'username', autocomplete: 'username', value: account.username, class: 'visually-hidden', tabindex: '-1', 'aria-hidden': 'true' });
    const pw = passwordField('auth-password', 'Password', 'current-password', 'Your password');
    fields = [hiddenUser, ...pw.nodes];
    firstInput = pw.input;
    submitLabel = 'Enter the studio';
    onSubmit = async (btn) => {
      if (!pw.input.value) return say('Enter your password to continue.');
      busy(btn, true, submitLabel);
      let ok = false;
      try { ok = await verifyPassword(account, pw.input.value); } catch (ex) { console.error(ex); }
      if (!ok) { busy(btn, false, submitLabel); pw.input.select(); return say('That password does not match. Try again, or use “Forgot password?”.'); }
      startSession(); enterApp();
    };
    footer = [el('p', { class: 'auth-switch' }, [link('Forgot password?', () => go('reset'))])];
  } else if (authMode === 'legacy') {
    kicker = 'Welcome back, musician'; heading = 'Let’s finish your account.';
    intro = 'We’ve upgraded accounts to include a username and a securely stored password. Log in one last time the old way and we’ll take care of the rest.';
    const email = textField('auth-email', 'Email address', 'email', 'email', 'you@example.com');
    const pw = passwordField('auth-password', 'Password', 'current-password', 'Your password');
    fields = [...email.nodes, ...pw.nodes];
    firstInput = email.input;
    submitLabel = 'Continue';
    onSubmit = async (btn) => {
      const e = email.input.value.trim().toLowerCase();
      if (!e || !pw.input.value) return say('Enter both your email and password.');
      if (e !== String(account.email).toLowerCase() || !(await verifyPassword(account, pw.input.value))) return say('That email and password do not match.');
      authPendingPassword = pw.input.value;
      go('username');
    };
  } else if (authMode === 'username') {
    kicker = 'One last thing'; heading = 'Choose a username.';
    intro = 'This is what we’ll call you around the studio. You’ll only be asked once.';
    const user = textField('auth-username', 'Username', 'text', 'username', 'What should we call you?', { maxlength: '20', minlength: '3' });
    fields = [...user.nodes, el('p', { class: 'auth-hint' }, '3–20 letters, numbers, dots, dashes or underscores.')];
    firstInput = user.input;
    submitLabel = 'Save and continue';
    onSubmit = async (btn) => {
      const u = user.input.value.trim();
      const err = validateUsername(u);
      if (err) return say(err);
      const cur = getAuthAccount();
      if (isLegacyAccount(cur) && !authPendingPassword) return go('legacy');
      busy(btn, true, submitLabel);
      try {
        if (isLegacyAccount(cur)) await createAccount(cur.email, u, authPendingPassword);
        else saveAuthAccount({ ...cur, username: u });
        authPendingPassword = null; startSession(); enterApp();
      } catch (ex) { console.error(ex); busy(btn, false, submitLabel); say('Sorry, the account could not be saved in this browser.'); }
    };
  } else if (authMode === 'reset') {
    kicker = 'No problem'; heading = 'Reset your password.';
    intro = 'This account lives only on this device, so confirm the email and username you signed up with and choose a new password. Your progress is kept.';
    const email = textField('auth-email', 'Email address', 'email', 'email', 'you@example.com');
    const user = textField('auth-username', 'Username', 'text', 'username', 'Your username');
    const pw = passwordField('auth-password', 'New password', 'new-password', 'At least 8 characters');
    const pw2 = passwordField('auth-password2', 'Confirm new password', 'new-password', 'Type it again');
    fields = [...email.nodes, ...user.nodes, ...pw.nodes, ...pw2.nodes];
    firstInput = email.input;
    submitLabel = 'Save new password';
    onSubmit = async (btn) => {
      const e = email.input.value.trim().toLowerCase(), u = user.input.value.trim().toLowerCase(), p = pw.input.value;
      const emailOk = e === String(account.email).toLowerCase();
      const userOk = !account.username || u === String(account.username).toLowerCase();
      if (!emailOk || !userOk) return say('That email and username do not match the account on this device.');
      const err = validatePassword(p, account.username, account.email) || (p !== pw2.input.value ? 'The two passwords do not match.' : '');
      if (err) return say(err);
      busy(btn, true, submitLabel);
      try { await setAccountPassword(p); startSession(); enterApp(); } catch (ex) { console.error(ex); busy(btn, false, submitLabel); say('Sorry, the password could not be saved.'); }
    };
    footer = [el('p', { class: 'auth-switch' }, [link('← Back to log in', () => go('login'))])];
  }

  const form = el('form', { class: 'auth-form', novalidate: 'novalidate' }, [...fields, msg, submitBtn(submitLabel)]);
  form.addEventListener('submit', ev => { ev.preventDefault(); const btn = form.querySelector('.auth-submit'); if (!btn.disabled) onSubmit(btn); });

  const visual = el('div', { class: 'auth-visual' }, [
    el('div', { class: 'sound-orbit orbit-one' }), el('div', { class: 'sound-orbit orbit-two' }), el('div', { class: 'sound-orbit orbit-three' }),
    el('div', { class: 'auth-note note-one' }, '♪'), el('div', { class: 'auth-note note-two' }, '♫'), el('div', { class: 'auth-note note-three' }, '♩'),
    el('div', { class: 'quote-block' }, [el('span', { class: 'quote-mark' }, '“'), el('blockquote', {}, quote.text), el('cite', {}, `— ${quote.author}`)])
  ]);

  const card = el('section', { class: 'auth-card' }, [
    el('div', { class: 'auth-brand' }, [el('span', { class: 'auth-brand-icon' }, '🎼'), el('span', {}, 'Perfect 9th')]),
    header,
    el('p', { class: 'auth-kicker' }, kicker),
    el('h1', {}, heading),
    el('p', { class: 'auth-intro' }, intro),
    form,
    ...footer,
    el('p', { class: 'auth-note-small' }, 'Your account stays on this device. Nothing is sent to a server.')
  ]);

  document.body.appendChild(visual);
  document.body.appendChild(card);
  if (firstInput) setTimeout(() => { try { firstInput.focus(); } catch (e) { /* ignore */ } }, 30);
}
let authPendingPassword = null;

/* Single choke point after any successful sign-up/login/reset: shows the
   one-time cinematic welcome intro if this browser has never seen it, then
   proceeds into the app exactly as before. Does not change the auth/account
   logic itself — just decides what happens on the way into initApp(). */
function enterApp() {
  if (typeof WelcomeIntro !== 'undefined' && !hasSeenWelcomeIntro()) {
    WelcomeIntro.play({ onDone: () => { markWelcomeIntroSeen(); initApp(); } });
  } else {
    initApp();
  }
}

