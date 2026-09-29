/* ============================================================
   Perfect 9th — welcome-intro.js
   A one-time cinematic "system initiation" sequence shown the first
   time a browser ever completes an account (signup, or the
   legacy-account upgrade). Never shown again afterwards (see
   WELCOME_INTRO_FLAG), though it can be replayed from Settings, and
   reset for local testing via window.resetPerfect9Intro().

   Structure of this file:
     1. small cancellable async/animation helpers (wiWait, wiAnim, …)
     2. narration helper (wiSpeak/wiBeat) bridging to js/narration.js
     3. the ambient/constructing SVG backdrop + the opening boot light
     4. the avatar-creation scene
     5. the username scene
     6. the closing "transform into the homepage" sequence
     7. the two full scripts (wiRunFullSequence / wiRunReducedSequence)
     8. the public WelcomeIntro.play() entry point

   Design notes:
   - Built entirely with the Web Animations API + a few CSS keyframes
     (see the "Welcome Intro" sections of styles.css) — no animation
     library added.
   - Reuses existing building blocks: noteIcon() from notation.js for
     the flying music glyphs, avatarSvg()/buildAvatarPicker() from
     auth.js for identity, AudioLab for quiet ambient sound design,
     and js/narration.js for the real recorded narration.
   - Timing is driven by the real narration audio wherever it exists
     (Narrator.speak()'s whenEnded resolves on the actual 'ended'
     event), with a minimum on-screen hold as the floor for when
     sound is off or a clip is missing. Nothing here waits on a
     guessed duration.
   - Everything here lives under the .wi-* CSS namespace and is
     appended to <body> as a single overlay; nothing about the rest
     of the app is touched, and the overlay removes itself completely
     (DOM + listeners + timers + animations + narration) when it ends.
   ============================================================ */

const WELCOME_INTRO_FLAG = 'gmq_seen_welcome_intro_v1';

function hasSeenWelcomeIntro() {
  try { return localStorage.getItem(WELCOME_INTRO_FLAG) === '1'; } catch (e) { return true; }
}
function markWelcomeIntroSeen() {
  try { localStorage.setItem(WELCOME_INTRO_FLAG, '1'); } catch (e) { /* ignore */ }
}
/** Developer/testing helper: clears the "seen" flag so the next successful
    login/signup shows the intro again. Not used anywhere in the app itself —
    run it from the browser console. */
if (typeof window !== 'undefined') {
  window.resetPerfect9Intro = function resetPerfect9Intro() {
    try { localStorage.removeItem(WELCOME_INTRO_FLAG); } catch (e) { /* ignore */ }
    console.info('Perfect 9th: welcome intro will play again on the next successful login or signup.');
  };
}

/* ---------- small async/animation helpers (all cancellable) ---------- */

const WI_EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const WI_EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';

/** Every ms value in this file passes through here. Real users always get
    scale 1 (full, deliberate pacing, real audio). Setting
    window.__wiTestFast = true before the page loads compresses every
    fallback timing by 10× AND skips waiting on real audio playback —
    used only by this project's own automated tests, never by real users
    and never set by the shipped site itself. */
function ms(value, ctx) { return Math.round(value * (ctx.scale || 1)); }

function wiWait(value, ctx) {
  const duration = ms(value, ctx);
  return new Promise(resolve => {
    if (ctx.cancelled) return resolve();
    const id = setTimeout(() => { ctx.timeouts.delete(id); resolve(); }, duration);
    ctx.timeouts.add(id);
  });
}

/** Animate with the Web Animations API; tracked so Skip can cancel it instantly.
    `duration`/`delay` in options are scaled the same way wiWait() is. */
function wiAnim(node, keyframes, options, ctx) {
  if (ctx.cancelled || !node.animate) return Promise.resolve();
  const scaledOptions = { ...options };
  if (scaledOptions.duration) scaledOptions.duration = ms(scaledOptions.duration, ctx);
  if (scaledOptions.delay) scaledOptions.delay = ms(scaledOptions.delay, ctx);
  const anim = node.animate(keyframes, { fill: 'both', easing: WI_EASE_OUT, ...scaledOptions });
  ctx.animations.add(anim);
  return anim.finished.catch(() => {}).finally(() => ctx.animations.delete(anim));
}

/** Add a line of text to the stage with an entrance animation; returns the element. */
function wiShowLine(stage, text, opts, ctx) {
  if (ctx.cancelled) return Promise.resolve(null);
  const node = el('p', { class: 'wi-line ' + (opts.cls || 'wi-body') }, text);
  stage.appendChild(node);
  const inKeyframes = opts.inKeyframes || [
    { opacity: 0, filter: 'blur(16px)', transform: 'translateY(22px) scale(0.96)' },
    { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0) scale(1)' }
  ];
  return wiAnim(node, inKeyframes, { duration: opts.inDuration || 700, easing: WI_EASE_OUT }, ctx).then(() => node);
}

/** Animate a line away and remove it. */
function wiHideLine(node, opts, ctx) {
  if (!node) return Promise.resolve();
  if (ctx.cancelled) { node.remove(); return Promise.resolve(); }
  const outKeyframes = (opts && opts.outKeyframes) || [
    { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0) scale(1)' },
    { opacity: 0, filter: 'blur(12px)', transform: 'translateY(-16px) scale(1.02)' }
  ];
  return wiAnim(node, outKeyframes, { duration: (opts && opts.outDuration) || 550, easing: WI_EASE_IN_OUT }, ctx).then(() => node.remove());
}

function wiPlaySound(fn) {
  try { if (typeof AudioLab !== 'undefined' && AudioLab.isEnabled()) fn(); } catch (e) { /* never let a sound glitch break the intro */ }
}

/* ---------- narration bridge ---------- */

/** Starts the real recorded line for `id` (if sound is on and the file
    exists) and returns { whenEnded }, a promise that resolves on the
    actual 'ended' event — never a guessed duration. In the test-only fast
    mode, real audio is skipped entirely so automated tests run at
    synthetic speed instead of real narration speed. */
function wiSpeak(id, ctx) {
  if (ctx.cancelled || typeof Narrator === 'undefined' || (ctx.scale && ctx.scale !== 1)) return { whenEnded: Promise.resolve() };
  try { return Narrator.speak(id); } catch (e) { return { whenEnded: Promise.resolve() }; }
}

/** Show a line, hold for at least `hold` ms AND (if it's narrated and
    playing) until the real audio actually finishes — whichever is longer —
    then a short breathing pause, then hide it. */
async function wiBeat(stage, text, { cls, hold = 1600, inDuration, outDuration, inKeyframes, outKeyframes, narrate } = {}, ctx) {
  if (ctx.cancelled) return;
  const spoken = narrate ? wiSpeak(narrate, ctx) : null;
  const node = await wiShowLine(stage, text, { cls, inDuration, inKeyframes }, ctx);
  await Promise.all([wiWait(hold, ctx), spoken ? spoken.whenEnded : Promise.resolve()]);
  await wiWait(280, ctx);
  await wiHideLine(node, { outDuration }, ctx);
}

/* ---------- a small system-style label (distinct from spoken narration) ---------- */

async function wiSystemLabel(stage, text, { hold = 1300 } = {}, ctx) {
  if (ctx.cancelled) return;
  const node = el('p', { class: 'wi-system-label' }, text);
  stage.appendChild(node);
  await wiAnim(node, [
    { opacity: 0, letterSpacing: '0.5em' },
    { opacity: 1, letterSpacing: '0.28em' }
  ], { duration: 900, easing: WI_EASE_OUT }, ctx);
  await wiWait(hold, ctx);
  await wiAnim(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }, ctx);
  node.remove();
}

/* ---------- the opening boot light (PS5-style system startup) ---------- */

/** A single point of light in the centre of total darkness, slowly
    expanding into a faint blue/white glow — the very first thing the
    person sees, before "SYSTEM INITIALISING" or any ambient elements. */
async function wiBootLight(root, ctx) {
  const light = el('div', { class: 'wi-boot-light', 'aria-hidden': 'true' });
  root.appendChild(light);
  await wiWait(500, ctx); // pure black first — nothing happens on purpose
  await wiAnim(light, [
    { opacity: 0, transform: 'scale(0.04)' },
    { opacity: 0.9, transform: 'scale(1)', offset: 0.75 },
    { opacity: 0.55, transform: 'scale(1.08)' }
  ], { duration: 2400, easing: WI_EASE_OUT }, ctx);
  return light;
}

/* ---------- per-line visual reactions ----------
   Each of these is a small, deliberate response to what the narrator has just
   said — not decoration. They're fire-and-forget (never awaited) so they run
   alongside the line they belong to. */

/** "You've arrived" — the central light swells outward. */
function wiReactArrived(bootLight, ctx) {
  wiAnim(bootLight, [{ opacity: 0.16, transform: 'scale(1.08)' }, { opacity: 0.34, transform: 'scale(1.4)' }, { opacity: 0.2, transform: 'scale(1.3)' }], { duration: 2400 }, ctx);
}
/** "Wondering why you're here" — the environment starts faintly forming: a stave draws itself. */
function wiReactForming(bg, ctx) {
  bg.staffLines.forEach((line, i) => wiAnim(line, [{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(0.55)', opacity: 0.07 }], { duration: 2200, delay: i * 120 }, ctx));
}
/** "Here for the Grade 9" — the signal line becomes a little more energetic. */
function wiReactEnergetic(bg, amount, ctx) {
  wiAnim(bg.wave, [{ opacity: 0.14, transform: 'scaleY(1)' }, { opacity: 0.16 + amount * 0.12, transform: `scaleY(${1 + amount * 2.2})` }], { duration: 1600 }, ctx);
}
/** "Fair enough" — a tiny flicker of acknowledgement across the dust. */
function wiReactBlink(bg, ctx) {
  bg.particles.forEach((p, i) => wiAnim(p, [{ opacity: 0.35 }, { opacity: 0.8 }, { opacity: 0.35 }], { duration: 700, delay: i * 40 }, ctx));
}
/** "Let's make Grade 9 look less terrifying" — the interface begins to build around the centre. */
function wiReactBuilding(bg, ctx) {
  bg.staffLines.forEach((line, i) => wiAnim(line, [{ transform: 'scaleX(0.55)', opacity: 0.07 }, { transform: 'scaleX(0.9)', opacity: 0.13 }], { duration: 2600, delay: i * 100 }, ctx));
}

/* ---------- ambient / constructing background ---------- */

/** A handful of small SVG elements: a faint particle field that "energizes" into
    staff lines, flying notation glyphs and a waveform sweep, then settles into
    a quiet backdrop for the title. Kept deliberately small (a couple of dozen
    nodes at most) so it stays light on low-powered laptops. */
function wiBuildBackground(root, reduced) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'wi-bg-svg');
  svg.setAttribute('viewBox', '0 0 1000 600');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  root.appendChild(svg);
  const mk = (tag, attrs) => { const n = document.createElementNS(svgNS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); svg.appendChild(n); return n; };

  const particles = [];
  if (!reduced) {
    for (let i = 0; i < 10; i++) {
      const cx = 80 + Math.random() * 840, cy = 80 + Math.random() * 440;
      const p = mk('circle', { cx, cy, r: 1.4 + Math.random() * 1.6, class: 'wi-particle', style: `--wi-delay:${(Math.random() * 6).toFixed(2)}s; --wi-dur:${(7 + Math.random() * 5).toFixed(2)}s; opacity:0` });
      particles.push(p);
    }
  }

  const wavePts = [];
  for (let x = 0; x <= 1000; x += 20) wavePts.push(`${x},${300 + Math.sin(x / 55) * 5}`);
  const wave = mk('polyline', { points: wavePts.join(' '), class: 'wi-wave-ambient', style: 'opacity:0' });

  const staffLines = [];
  for (let i = 0; i < 5; i++) {
    const y = 260 + i * 20;
    staffLines.push(mk('line', { x1: 60, x2: 940, y1: y, y2: y, class: 'wi-staff-line' }));
  }

  const burstPts = [];
  for (let x = 0; x <= 1000; x += 12) {
    const amp = 34 * Math.sin(x / 30) * Math.exp(-Math.pow((x - 500) / 420, 2));
    burstPts.push(`${x},${300 + amp}`);
  }
  const burstWave = mk('polyline', { points: burstPts.join(' '), class: 'wi-wave-burst' });
  const burstLen = 1400;
  burstWave.style.strokeDasharray = String(burstLen);
  burstWave.style.strokeDashoffset = String(burstLen);

  return { svg, particles, wave, staffLines, burstWave };
}

/** Brings the ambient particles + waveform in gently — called once the boot
    light has grown, so the screen fills in gradually rather than all at once. */
async function wiRevealAmbient(bg, ctx) {
  const jobs = [wiAnim(bg.wave, [{ opacity: 0 }, { opacity: 0.14 }], { duration: 1400 }, ctx)];
  bg.particles.forEach((p, i) => jobs.push(wiAnim(p, [{ opacity: 0 }, { opacity: 0.35 }], { duration: 900, delay: i * 70 }, ctx)));
  await Promise.all(jobs);
  bg.particles.forEach(p => { p.style.opacity = ''; p.classList.add('wi-particle-live'); }); // hand off to the CSS drift loop
}

/** The stave lines snap out, notation glyphs fly in and settle, the drawn
    waveform sweeps across — then everything quietens into a faint backdrop. */
async function wiEnergizeBackground(bg, glyphLayer, ctx) {
  wiPlaySound(() => AudioLab.playSequence(['C5', 'E5', 'G5', 'C6'], 0.09, { duration: 0.17, gain: 0.05, type: 'triangle' }));

  const lineJobs = bg.staffLines.map((line, i) => wiAnim(line, [
    { transform: 'scaleX(0)', opacity: 0 },
    { transform: 'scaleX(1)', opacity: 0.5, offset: 0.6 },
    { transform: 'scaleX(1)', opacity: 0.22 }
  ], { duration: 750, delay: i * 45, easing: WI_EASE_OUT }, ctx));

  const waveJob = wiAnim(bg.burstWave, [{ strokeDashoffset: 1400, opacity: 0.9 }, { strokeDashoffset: 0, opacity: 0.55 }], { duration: 850, easing: WI_EASE_OUT }, ctx);

  const kinds = ['treble-clef', 'crotchet', 'quaver', 'minim', 'semiquaver', 'crotchet', 'bass-clef', 'quaver'];
  const glyphJobs = kinds.map((kind, i) => {
    const wrap = el('span', { class: 'wi-glyph' });
    wrap.appendChild(noteIcon(kind));
    glyphLayer.appendChild(wrap);
    const xPct = 12 + (i / (kinds.length - 1)) * 76;
    const fromX = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 60);
    const fromY = -80 - Math.random() * 60;
    wrap.style.left = xPct + '%';
    wrap.style.top = '46%';
    return wiAnim(wrap, [
      { opacity: 0, transform: `translate(${fromX}px, ${fromY}px) rotate(${(Math.random() * 40 - 20).toFixed(0)}deg) scale(0.6)` },
      { opacity: 1, transform: 'translate(0, 0) rotate(0deg) scale(1)', offset: 0.7 },
      { opacity: 0.35, transform: 'translate(0, 0) rotate(0deg) scale(0.92)' }
    ], { duration: 950, delay: 140 + i * 60, easing: WI_EASE_OUT }, ctx);
  });

  await Promise.all([...lineJobs, waveJob, ...glyphJobs]);
  await wiWait(250, ctx);
  await Promise.all([
    wiAnim(bg.burstWave, [{ opacity: 0.55 }, { opacity: 0.1 }], { duration: 750 }, ctx),
    ...bg.staffLines.map(l => wiAnim(l, [{ opacity: 0.22 }, { opacity: 0.08 }], { duration: 750 }, ctx))
  ]);
}

/* ---------- avatar creation scene ---------- */

/** "Choose your identity" — a full customisation step, not a buried settings
    toggle. Pre-fills with the account's existing avatar (or a deterministic
    default) so replaying the intro, or an interrupted first run, never
    forces anyone to redo work; only an actual change is saved. */
async function wiAvatarScene(stage, ctx) {
  const account = getAuthAccount() || {};
  const startingConfig = account.avatar ? { ...defaultAvatarConfig(account.username), ...account.avatar } : defaultAvatarConfig(account.username || 'guest');

  await wiSystemLabel(stage, 'CREATE YOUR AVATAR', { hold: ctx.reduced ? 500 : 900 }, ctx);
  if (ctx.cancelled) return startingConfig;

  const { node: pickerNode, getConfig } = buildAvatarPicker(startingConfig);
  const continueBtn = el('button', { type: 'button', class: 'wi-ghost-btn wi-continue-btn' }, 'Confirm identity →');
  const wrap = el('div', { class: 'wi-avatar-scene' }, [pickerNode, continueBtn]);
  stage.appendChild(wrap);

  let resolveConfirm;
  const confirmPromise = new Promise(resolve => { resolveConfirm = resolve; });
  const finish = () => resolveConfirm(getConfig());
  continueBtn.addEventListener('click', () => { wiPlaySound(() => AudioLab.playClick(true)); finish(); });
  ctx.onSkip.push(finish);

  const inKf = ctx.reduced
    ? [{ opacity: 0 }, { opacity: 1 }]
    : [{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(18px) scale(0.97)' }, { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0) scale(1)' }];
  await wiAnim(wrap, inKf, { duration: ctx.reduced ? 260 : 650 }, ctx);

  const finalConfig = await confirmPromise;
  if (JSON.stringify(finalConfig) !== JSON.stringify(account.avatar || {})) {
    try { saveAuthAccount({ ...getAuthAccount(), avatar: finalConfig }); } catch (e) { /* keep going regardless */ }
  }
  if (!ctx.cancelled) await wiHideLine(wrap, { outDuration: ctx.reduced ? 200 : 500 }, ctx); else wrap.remove();
  return finalConfig;
}

/* ---------- the username moment ---------- */

/** Confirms (or lets the user tweak) the username already collected at
    signup. A visible avatar chip sits beside the input and gives a small,
    cheap "reacting" pulse as the person types. */
async function wiUsernameScene(stage, ctx) {
  const account = getAuthAccount() || {};
  const startingName = account.username || 'Musician';
  const avatarConfig = account.avatar || defaultAvatarConfig(startingName);
  const q = ctx.reduced ? { inDuration: 260, outDuration: 200, hold: 500 } : { inDuration: 600, outDuration: 450, hold: 1300 };

  await wiBeat(stage, 'Now tell us what to call you.', { cls: 'wi-body', hold: q.hold, inDuration: q.inDuration, outDuration: q.outDuration, narrate: 'now_tell_us' }, ctx);

  if (ctx.cancelled) return startingName;

  const chip = el('div', { class: 'wi-name-avatar-chip' }, [avatarSvg(avatarConfig, 48)]);
  const input = el('input', {
    class: 'wi-input', type: 'text', value: startingName, maxlength: '20', autocomplete: 'off',
    spellcheck: 'false', 'aria-label': 'Your username', inputmode: 'text'
  });
  const hint = el('span', { class: 'wi-input-hint' }, 'press Enter ↵');
  const wrap = el('div', { class: 'wi-input-wrap wi-input-wrap-withchip' }, [chip, input]);
  stage.appendChild(wrap);

  const namePromise = new Promise(resolve => {
    if (ctx.cancelled) return resolve(startingName);
    const finish = () => {
      const typed = input.value.trim();
      const valid = typed && !validateUsername(typed);
      resolve(valid ? typed : startingName);
    };
    input.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); finish(); } });
    let pulseTimer = null;
    input.addEventListener('input', () => {
      chip.classList.remove('wi-pulse'); void chip.offsetWidth; chip.classList.add('wi-pulse');
      clearTimeout(pulseTimer); pulseTimer = setTimeout(() => chip.classList.remove('wi-pulse'), 400);
    });
    ctx.onSkip.push(finish);
  });

  const wrapInKf = ctx.reduced
    ? [{ opacity: 0 }, { opacity: 1 }]
    : [{ opacity: 0, filter: 'blur(10px)', transform: 'translateY(16px) scale(0.97)' }, { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0) scale(1)' }];
  await wiAnim(wrap, wrapInKf, { duration: ctx.reduced ? 260 : 600 }, ctx);
  wrap.appendChild(hint);
  wiAnim(hint, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: ctx.reduced ? 300 : 650 }, ctx);

  input.focus(); input.select();

  const finalName = await namePromise;

  if (finalName !== startingName) {
    try { saveAuthAccount({ ...getAuthAccount(), username: finalName }); } catch (e) { /* keep going regardless */ }
  }
  if (!ctx.cancelled) await wiHideLine(wrap, { outDuration: q.outDuration }, ctx); else wrap.remove();
  return finalName;
}

/* ---------- closing: transform into the homepage ---------- */

/** The opening's mirror image: the central light blooms outward, the stave
    sweeps through once more and the notation lifts away — the environment
    "expanding" as the system is entered. */
async function wiFinalBurst(bootLight, bg, glyphLayer, ctx) {
  wiPlaySound(() => AudioLab.playSequence(['E5', 'G5', 'C6', 'E6'], 0.07, { duration: 0.13, gain: 0.045, type: 'triangle' }));
  const jobs = [
    wiAnim(bootLight, [{ opacity: 0.16, transform: 'scale(1.3)' }, { opacity: 0.5, transform: 'scale(2.2)', offset: 0.5 }, { opacity: 0.12, transform: 'scale(3)' }], { duration: 1500 }, ctx),
    ...bg.staffLines.map((line, i) => wiAnim(line, [
      { transform: 'scaleX(0.9)', opacity: 0.13 }, { transform: 'scaleX(1)', opacity: 0.45, offset: 0.45 }, { transform: 'scaleX(1)', opacity: 0.08 }
    ], { duration: 1200, delay: i * 40 }, ctx)),
    wiAnim(bg.burstWave, [{ opacity: 0.1 }, { opacity: 0.6, offset: 0.45 }, { opacity: 0 }], { duration: 1200 }, ctx),
    ...Array.from(glyphLayer.children).map((g, i) => wiAnim(g, [
      { opacity: 0.35, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: `translateY(${-46 - i * 5}px) scale(0.7)` }
    ], { duration: 900, delay: i * 40 }, ctx))
  ];
  await Promise.all(jobs);
}

/** The real homepage is rendered NOW (underneath this overlay — see
    enterHomepage in WelcomeIntro.play), a light "dashboard" skeleton
    assembles in the site's own colours over the cinematic environment, and
    the avatar just created flies to where it will actually live in the
    header. Then the cinematic layer dissolves (in WelcomeIntro.play's
    finish) to reveal the real, already-rendered, matching homepage. This is
    the one moment this file reaches outside its own overlay — and it only
    ever *reads* the real header's position; if anything isn't where it's
    expected, the avatar flight is simply skipped, never an error. */
async function wiTransformIntoHomepage(root, avatarConfig, onDone, ctx) {
  if (typeof onDone === 'function') onDone();
  if (ctx.reduced) { await wiWait(300, ctx); return; }

  // let the real homepage finish its own layout before measuring anything in it
  await Promise.race([new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))), wiWait(150, ctx)]);

  const skeleton = el('div', { class: 'wi-dash-skeleton', 'aria-hidden': 'true' }, [
    el('div', { class: 'wi-dash-nav' }),
    el('div', { class: 'wi-dash-cards' }, [el('div', { class: 'wi-dash-card' }), el('div', { class: 'wi-dash-card' }), el('div', { class: 'wi-dash-card' })])
  ]);
  root.appendChild(skeleton);
  const navEl = skeleton.querySelector('.wi-dash-nav');
  const cardEls = Array.from(skeleton.querySelectorAll('.wi-dash-card'));

  const flying = el('div', { class: 'wi-flying-avatar' }, [avatarSvg(avatarConfig, 72)]);
  root.appendChild(flying);

  await Promise.all([
    wiAnim(navEl, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 0.95, transform: 'translateY(0)' }], { duration: 650 }, ctx),
    ...cardEls.map((c, i) => wiAnim(c, [{ opacity: 0, transform: 'translateY(22px) scale(0.96)' }, { opacity: 0.9, transform: 'translateY(0) scale(1)' }], { duration: 650, delay: 150 + i * 110 }, ctx)),
    wiAnim(flying, [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600, delay: 100 }, ctx)
  ]);
  await wiWait(300, ctx);

  // fly the avatar to wherever it actually lives in the real header (read-only lookup)
  let target = null;
  try { const real = document.querySelector('.header-user svg.avatar') || document.querySelector('.header-user'); if (real) target = real.getBoundingClientRect(); } catch (e) { /* ignore */ }
  if (target && target.width) {
    const from = flying.getBoundingClientRect();
    const dx = (target.left + target.width / 2) - (from.left + from.width / 2);
    const dy = (target.top + target.height / 2) - (from.top + from.height / 2);
    const endScale = Math.max(0.2, target.width / from.width);
    await wiAnim(flying, [
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(${endScale})` }
    ], { duration: 800, easing: WI_EASE_IN_OUT }, ctx);
  }
}

/* ---------- the two scripts ---------- */

async function wiRunFullSequence(root, stage, bg, glyphLayer, ctx, onDone) {
  /* ---- Opening: PS5-style system boot, mirrored by the closing ---- */
  wiPlaySound(() => AudioLab.playNote('C2', { duration: 4, gain: 0.05, type: 'sine' })); // a very low, quiet system hum
  const bootLight = await wiBootLight(root, ctx);
  const ambientIn = wiRevealAmbient(bg, ctx); // the dust and signal line fade in while the label appears
  wiAnim(bootLight, [{ opacity: 0.55 }, { opacity: 0.16 }], { duration: 1600 }, ctx); // settles into a faint, steady glow
  await wiSystemLabel(stage, 'SYSTEM INITIALISING', { hold: 1100 }, ctx);
  await ambientIn;

  await wiBeat(stage, 'Welcome.', { cls: 'wi-hero', hold: 1400, inDuration: 1000, narrate: 'welcome' }, ctx);
  wiReactArrived(bootLight, ctx);
  await wiBeat(stage, 'You\u2019ve arrived at The Perfect 9th.', { cls: 'wi-body', hold: 1200, inDuration: 750, narrate: 'arrived' }, ctx);
  wiReactForming(bg, ctx);
  await wiBeat(stage, 'You\u2019re probably wondering why you\u2019re here.', { cls: 'wi-body', hold: 1200, inDuration: 750, narrate: 'wondering' }, ctx);
  await wiBeat(stage, 'The answer is fairly obvious.', { cls: 'wi-body', hold: 1200, inDuration: 700, narrate: 'obvious' }, ctx);
  wiReactEnergetic(bg, 1, ctx);
  await wiBeat(stage, 'You\u2019re here for the Grade 9.', { cls: 'wi-body', hold: 1200, inDuration: 700, narrate: 'grade9' }, ctx);
  wiReactBlink(bg, ctx);
  await wiBeat(stage, 'Fair enough.', { cls: 'wi-body', hold: 1000, inDuration: 650, narrate: 'fair' }, ctx);

  /* ---- The joke: dry, brief, and never allowed to break the tone ---- */
  const quoteSpoken = wiSpeak('quote', ctx);
  wiReactBuilding(bg, ctx);
  const quote = await wiShowLine(stage, '\u201cLet\u2019s make Grade 9 look less terrifying.\u201d', { cls: 'wi-quote', inDuration: 800 }, ctx);
  await Promise.all([wiWait(1200, ctx), quoteSpoken.whenEnded]);
  await wiWait(1200, ctx); // the awkward stop — nothing happens on purpose
  const admissionSpoken = wiSpeak('joke1', ctx);
  const admission = await wiShowLine(stage, 'Ambitious.', { cls: 'wi-small', inDuration: 400 }, ctx);
  await Promise.all([wiWait(600, ctx), admissionSpoken.whenEnded]);
  await wiWait(700, ctx);
  await Promise.all([wiHideLine(quote, { outDuration: 450 }, ctx), wiHideLine(admission, { outDuration: 450 }, ctx)]);
  wiReactEnergetic(bg, 2, ctx); // after the joke, the system becomes noticeably more energetic
  await wiBeat(stage, 'Moving on.', { cls: 'wi-small', hold: 600, inDuration: 400, outDuration: 400, narrate: 'joke2' }, ctx);

  /* ---- The pivot — from here the whole piece visibly accelerates ---- */
  const beginSpoken = wiSpeak('begin', ctx);
  const beginNode = await wiShowLine(stage, 'Let\u2019s begin.', { cls: 'wi-body-strong', inDuration: 600 }, ctx);
  await Promise.all([wiWait(600, ctx), beginSpoken.whenEnded]);
  await wiWait(200, ctx);
  const fadeBegin = wiHideLine(beginNode, { outDuration: 380 }, ctx);

  await Promise.all([fadeBegin, wiEnergizeBackground(bg, glyphLayer, ctx)]);

  /* ---- Title reveal — the first big moment; held the longest of all ---- */
  wiPlaySound(() => AudioLab.playChord(['C4', 'E4', 'G4', 'C5'], { duration: 2.0, gain: 0.04, type: 'sine' }));
  wiPlaySound(() => AudioLab.playNote('C2', { duration: 1.6, gain: 0.07, type: 'sine' })); // one soft, low impact under the reveal
  const titleSpoken = wiSpeak('title', ctx);
  const title = el('h1', { class: 'wi-title' }, 'The Perfect 9th');
  const titleWrap = el('div', { class: 'wi-title-wrap' }, [title]); // static glow lives on the wrapper so the blur animation can't erase it
  stage.appendChild(titleWrap);
  const reveal = wiAnim(title, [
    { opacity: 0, letterSpacing: '0.35em', filter: 'blur(18px)', transform: 'scale(1.06)', clipPath: 'inset(0 45% 0 45%)' },
    { opacity: 1, letterSpacing: '0.01em', filter: 'blur(0px)', transform: 'scale(1)', clipPath: 'inset(0 0% 0 0%)' }
  ], { duration: 1000, easing: WI_EASE_OUT }, ctx);
  await reveal;
  // a single slow light sweep across the lettering once it has resolved — a brushed-metal glint, then nothing
  wiAnim(title, [{ backgroundPosition: '150% 0, 0 0' }, { backgroundPosition: '-50% 0, 0 0' }], { duration: 2200, easing: WI_EASE_IN_OUT }, ctx);
  await Promise.all([wiWait(600, ctx), titleSpoken.whenEnded]);
  await wiWait(400, ctx);
  const sub1Spoken = wiSpeak('subtitle', ctx);
  const sub1 = await wiShowLine(stage, 'Your shortcut to Grade 9.', { cls: 'wi-subtitle', inDuration: 550 }, ctx);
  await Promise.all([wiWait(600, ctx), sub1Spoken.whenEnded]);
  await wiWait(300, ctx);
  const sub2Spoken = wiSpeak('subtitle2', ctx);
  const sub2 = await wiShowLine(stage, 'Music GCSE. Sorted.', { cls: 'wi-small', inDuration: 500 }, ctx);
  await Promise.all([wiWait(600, ctx), sub2Spoken.whenEnded]);
  await wiWait(1600, ctx); // let the title actually be appreciated
  await Promise.all([wiHideLine(titleWrap, { outDuration: 550 }, ctx), wiHideLine(sub1, { outDuration: 550 }, ctx), wiHideLine(sub2, { outDuration: 550 }, ctx)]);

  /* ---- Account setup ---- */
  // no recording exists yet for "Before we begin…" (see assets/audio/intro/README.md), so this
  // one line is carried by its on-screen hold alone until intro-14-beforewebegin.mp3 is added
  await wiBeat(stage, 'Before we begin\u2026', { cls: 'wi-small', hold: 1400, narrate: 'before_we_begin' }, ctx);
  await wiBeat(stage, 'Let\u2019s get you set up.', { cls: 'wi-body', hold: 1000, narrate: 'lets_get_set_up' }, ctx);
  await wiBeat(stage, 'First things first.', { cls: 'wi-small', hold: 900, narrate: 'first_things_first' }, ctx);
  await wiBeat(stage, 'Choose your identity.', { cls: 'wi-body', hold: 1000, narrate: 'choose_identity' }, ctx);

  const avatarConfig = await wiAvatarScene(stage, ctx);
  const finalName = await wiUsernameScene(stage, ctx);

  // "Nice to meet you." is spoken; the name itself is only ever shown, never voiced
  await wiBeat(stage, `Nice to meet you, ${finalName}.`, { cls: 'wi-body-strong', hold: 1200, narrate: 'nice_to_meet' }, ctx);

  /* ---- Closing: mirrors the opening, then physically becomes the homepage ---- */
  wiPlaySound(() => AudioLab.playNote('G2', { duration: 2.4, gain: 0.05, type: 'sine' }));
  const enteringSpoken = wiSpeak('entering', ctx);
  const enteringNode = await wiShowLine(stage, 'Entering the system.', { cls: 'wi-body-strong', inDuration: 500 }, ctx);
  const burst = wiFinalBurst(bootLight, bg, glyphLayer, ctx); // the light blooms outward and the stave sweeps through again
  await Promise.all([wiWait(500, ctx), enteringSpoken.whenEnded]);
  await wiWait(200, ctx);
  await Promise.all([wiHideLine(enteringNode, { outDuration: 300 }, ctx), burst]);
  await wiSystemLabel(stage, 'ACCESS GRANTED', { hold: 600 }, ctx);

  // "Let's get started." plays *while* the homepage assembles behind and around it
  const startedSpoken = wiSpeak('lets_get_started', ctx);
  const startedNode = wiShowLine(stage, 'Let\u2019s get started.', { cls: 'wi-body', inDuration: 500 }, ctx);
  await wiTransformIntoHomepage(root, avatarConfig, onDone, ctx);
  await startedNode;
  await Promise.all([wiWait(400, ctx), startedSpoken.whenEnded]);
  await wiWait(300, ctx);
}

/** Shortened, motion-safe path for prefers-reduced-motion: the same words,
    the same order, the same account-creation flow (avatar + username) —
    but short, simple crossfades only, no parallax, no flying glyphs, no
    looping background motion, and no construction bursts. Real narration
    audio (when sound is on) still plays and still governs timing. */
async function wiRunReducedSequence(root, stage, ctx, onDone) {
  const fade = { inKeyframes: [{ opacity: 0 }, { opacity: 1 }], outKeyframes: [{ opacity: 1 }, { opacity: 0 }], inDuration: 240, outDuration: 180 };
  await wiSystemLabel(stage, 'SYSTEM INITIALISING', { hold: 500 }, ctx);

  await wiBeat(stage, 'Welcome.', { cls: 'wi-hero', hold: 600, ...fade, narrate: 'welcome' }, ctx);
  await wiBeat(stage, 'You\u2019ve arrived at The Perfect 9th.', { cls: 'wi-body', hold: 500, ...fade, narrate: 'arrived' }, ctx);
  await wiBeat(stage, 'You\u2019re probably wondering why you\u2019re here.', { cls: 'wi-body', hold: 500, ...fade, narrate: 'wondering' }, ctx);
  await wiBeat(stage, 'The answer is fairly obvious.', { cls: 'wi-body', hold: 450, ...fade, narrate: 'obvious' }, ctx);
  await wiBeat(stage, 'You\u2019re here for the Grade 9.', { cls: 'wi-body', hold: 450, ...fade, narrate: 'grade9' }, ctx);
  await wiBeat(stage, 'Fair enough.', { cls: 'wi-body', hold: 350, ...fade, narrate: 'fair' }, ctx);

  const quote = await wiShowLine(stage, '\u201cLet\u2019s make Grade 9 look less terrifying.\u201d', { cls: 'wi-quote', ...fade }, ctx);
  await wiWait(650, ctx);
  const admission = await wiShowLine(stage, 'Ambitious.', { cls: 'wi-small', ...fade }, ctx);
  await wiWait(450, ctx);
  await Promise.all([wiHideLine(quote, fade, ctx), wiHideLine(admission, fade, ctx)]);
  await wiBeat(stage, 'Moving on.', { cls: 'wi-small', hold: 300, ...fade, narrate: 'joke2' }, ctx);
  await wiBeat(stage, 'Let\u2019s begin.', { cls: 'wi-body-strong', hold: 300, ...fade, narrate: 'begin' }, ctx);

  const title = await wiShowLine(stage, 'The Perfect 9th', { cls: 'wi-title wi-title-reduced', ...fade, inDuration: 300 }, ctx);
  await wiSpeak('title', ctx).whenEnded;
  await wiWait(400, ctx);
  const sub1 = await wiShowLine(stage, 'Your shortcut to Grade 9.', { cls: 'wi-subtitle', ...fade }, ctx);
  await wiWait(400, ctx);
  await Promise.all([wiHideLine(title, fade, ctx), wiHideLine(sub1, fade, ctx)]);

  await wiBeat(stage, 'Let\u2019s get you set up.', { cls: 'wi-body', hold: 350, ...fade, narrate: 'lets_get_set_up' }, ctx);
  await wiBeat(stage, 'Choose your identity.', { cls: 'wi-body', hold: 350, ...fade, narrate: 'choose_identity' }, ctx);

  const avatarConfig = await wiAvatarScene(stage, ctx);
  const finalName = await wiUsernameScene(stage, ctx);

  await wiBeat(stage, `Nice to meet you, ${finalName}.`, { cls: 'wi-body-strong', hold: 500, ...fade }, ctx);
  await wiSystemLabel(stage, 'ACCESS GRANTED', { hold: 400 }, ctx);
  await wiTransformIntoHomepage(root, avatarConfig, onDone, ctx);
  await wiBeat(stage, 'Let\u2019s get started.', { cls: 'wi-body', hold: 300, ...fade, narrate: 'lets_get_started' }, ctx);
}

/* ---------- public entry point ---------- */

const WelcomeIntro = {
  /** opts: { onDone(), replay:boolean } */
  play(opts = {}) {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scale = (typeof window !== 'undefined' && window.__wiTestFast) ? 0.1 : 1;
    const ctx = { cancelled: false, timeouts: new Set(), animations: new Set(), onSkip: [], reduced, scale };

    const root = el('div', { class: 'wi-root', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Welcome to Perfect 9th' });
    const bgLayer = el('div', { class: 'wi-bg', 'aria-hidden': 'true' });
    const glyphLayer = el('div', { class: 'wi-glyph-layer', 'aria-hidden': 'true' });
    const grain = el('div', { class: 'wi-grain', 'aria-hidden': 'true' });
    const stage = el('div', { class: 'wi-stage', 'aria-live': 'polite', 'aria-atomic': 'true' });

    const soundOn = () => (typeof AudioLab !== 'undefined' && AudioLab.isEnabled());
    const muteBtn = el('button', {
      type: 'button', class: 'wi-mute', 'aria-label': soundOn() ? 'Mute sound' : 'Unmute sound',
      onclick: () => {
        try {
          const next = !AudioLab.isEnabled();
          AudioLab.setEnabled(next);
          if (!next && typeof Narrator !== 'undefined') Narrator.stop();
          if (typeof STATE !== 'undefined' && STATE.settings) { STATE.settings.sound = next; if (typeof persist === 'function') persist(); }
          muteBtn.textContent = next ? '🔊' : '🔈';
          muteBtn.setAttribute('aria-label', next ? 'Mute sound' : 'Unmute sound');
        } catch (e) { /* ignore */ }
      }
    }, soundOn() ? '🔊' : '🔈');

    const skipBtn = el('button', { type: 'button', class: 'wi-skip', onclick: () => finish(true) }, 'Skip intro →');

    root.appendChild(bgLayer);
    root.appendChild(glyphLayer);
    root.appendChild(grain);
    root.appendChild(stage);
    root.appendChild(muteBtn);
    root.appendChild(skipBtn);
    document.body.appendChild(root);

    const bg = wiBuildBackground(bgLayer, reduced);

    // keep keyboard focus inside the intro while it's showing
    const onFocusIn = ev => { if (!root.contains(ev.target)) skipBtn.focus(); };
    document.addEventListener('focusin', onFocusIn);
    const onKeydown = ev => { if (ev.key === 'Escape') finish(true); };
    document.addEventListener('keydown', onKeydown);
    skipBtn.focus();

    let finished = false;
    let homepageEntered = false;
    // Entering the app rebuilds document.body from scratch (buildShell clears it), which
    // would delete this overlay along with everything else. So: lift the overlay out, let
    // the app build itself, and put the overlay straight back on top — all in one
    // synchronous step, so nothing is ever painted in between and the real homepage
    // ends up fully rendered *underneath* the still-running cinematic layer.
    const enterHomepage = () => {
      if (homepageEntered) return;
      homepageEntered = true;
      if (typeof opts.onDone !== 'function') return;
      if (root.parentNode) root.parentNode.removeChild(root);
      try { opts.onDone(); } finally { document.body.appendChild(root); }
    };

    function finish(skipped) {
      if (finished) return;
      finished = true;
      ctx.cancelled = true;
      ctx.timeouts.forEach(id => clearTimeout(id)); ctx.timeouts.clear();
      ctx.animations.forEach(a => { try { a.finish(); } catch (e) { /* ignore */ } }); ctx.animations.clear();
      ctx.onSkip.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
      if (typeof Narrator !== 'undefined') Narrator.stop();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKeydown);
      // if skip happened before the closing sequence ever reached this point,
      // the real homepage still needs to be entered now
      enterHomepage();
      // the real homepage is already rendered underneath; the cinematic layer lifts away from it
      const dissolve = reduced
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ opacity: 1, filter: 'blur(0px) brightness(1)', transform: 'scale(1)' },
           { opacity: 0, filter: 'blur(14px) brightness(1.2)', transform: 'scale(1.03)' }];
      root.animate(dissolve, { duration: skipped ? 650 : (reduced ? 500 : 1100), easing: WI_EASE_IN_OUT, fill: 'forwards' })
        .finished.catch(() => {}).finally(() => root.remove());
    }

    const sequence = reduced ? wiRunReducedSequence(root, stage, ctx, enterHomepage) : wiRunFullSequence(root, stage, bg, glyphLayer, ctx, enterHomepage);
    sequence.then(() => { if (!finished) finish(); }).catch(() => { if (!finished) finish(); });
  }
};
