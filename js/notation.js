/* ============================================================
   Perfect 9th — notation.js
   A small SVG engraving engine: staves (treble / bass / alto),
   key signatures, time signatures, notes, chords, rests, beams,
   ties, slurs, articulation, and a one-line rhythm staff.

   Everything is drawn with vector paths from notation-glyphs.js, so
   the result is identical on every device (no music font needed).

   Pitch strings:  'C4', 'F#5', 'Bb3', 'Fn4' (explicit natural).
   A pitch string always means the ACTUAL sounding pitch. When a
   key signature is supplied, the renderer decides which accidental
   signs are really needed (e.g. 'F#4' in G major shows no sign).
   ============================================================ */

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ACC_OFFSET = { '': 0, n: 0, '#': 1, b: -1, '##': 2, bb: -2 };

function parsePitch(pitch) {
  const m = /^([A-G])(##|bb|#|b|n)?(-?\d+)$/.exec(String(pitch));
  if (!m) throw new Error('Bad pitch: ' + pitch);
  return { letter: m[1], acc: m[2] || '', octave: parseInt(m[3], 10) };
}

// diatonic "step number" — used purely for vertical placement on a staff
function diatonicStep(pitch) {
  const p = parsePitch(pitch);
  return p.octave * 7 + NOTE_LETTERS.indexOf(p.letter);
}
function accidentalOf(pitch) { return parsePitch(pitch).acc; }
function letterOf(pitch) { return parsePitch(pitch).letter; }
function pitchToMidi(pitch) {
  const p = parsePitch(pitch);
  return (p.octave + 1) * 12 + LETTER_SEMITONE[p.letter] + ACC_OFFSET[p.acc];
}
function prettyAcc(acc) {
  return ({ '#': '♯', b: '♭', '##': '𝄪', bb: '♭♭', n: '♮', '': '' })[acc] || '';
}
// note NAME without octave: 'F#' -> 'F♯', 'Bb' -> 'B♭'
function prettyName(name) { return String(name).charAt(0) + String(name).slice(1).replace(/##/g, '𝄪').replace(/#/g, '♯').replace(/b/g, '♭'); }
// 'F#4' -> 'F♯' (or 'F♯4' with octave)
function prettyPitch(pitch, withOctave) {
  const p = parsePitch(pitch);
  return p.letter + prettyAcc(p.acc === 'n' ? '' : p.acc) + (withOctave ? p.octave : '');
}

// Reference: bottom line of treble = E4, bass = G2, alto = F3.
const CLEF_REF = {
  treble: { refPitch: 'E4', refStep: diatonicStep('E4') },
  bass: { refPitch: 'G2', refStep: diatonicStep('G2') },
  alto: { refPitch: 'F3', refStep: diatonicStep('F3') }
};

const STEP = 6;       // px per diatonic step (half a staff space)
const LINE_GAP = 12;  // px between staff lines (one staff space = 2 steps)
const GS = LINE_GAP / SMUFL_UNITS_PER_SPACE;   // glyph scale: font units -> px
const STEM_W = 1.44;

function yForPitch(pitch, clef, bottomLineY) {
  const ref = CLEF_REF[clef];
  const step = diatonicStep(pitch) - ref.refStep;
  return bottomLineY - step * STEP;
}

function svgEl(name, attrs = {}) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

/* ---------- key signatures ---------- */

// Staff position of each accidental in a key signature, as steps above the
// BOTTOM staff line, in order of sharps (F C G D A E B) and flats (B E A D G C F).
const KEYSIG_STEPS = {
  treble: { sharp: [8, 5, 9, 6, 3, 7, 4], flat: [4, 7, 3, 6, 2, 5, 1] },
  bass:   { sharp: [6, 3, 7, 4, 1, 5, 2], flat: [2, 5, 1, 4, 0, 3, 6] },
  alto:   { sharp: [7, 4, 8, 5, 2, 6, 3], flat: [3, 6, 2, 5, 1, 4, 0] }
};
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// number of sharps (+) or flats (−) for each key
const MAJOR_KEY_ACCIDENTALS = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
const MINOR_KEY_ACCIDENTALS = { A: 0, E: 1, B: 2, 'F#': 3, 'C#': 4, 'G#': 5, 'D#': 6, 'A#': 7, D: -1, G: -2, C: -3, F: -4, Bb: -5, Eb: -6, Ab: -7 };

/** keySigFor('D') -> {type:'sharp', count:2}; keySigFor('A', 'minor') -> {type:'sharp', count:0} */
function keySigFor(tonic, mode = 'major') {
  const table = mode === 'minor' ? MINOR_KEY_ACCIDENTALS : MAJOR_KEY_ACCIDENTALS;
  const n = table[tonic];
  if (n === undefined) throw new Error('Unknown key: ' + tonic + ' ' + mode);
  return { type: n < 0 ? 'flat' : 'sharp', count: Math.abs(n) };
}

function normaliseKeySig(ks) {
  if (!ks) return null;
  if (typeof ks === 'string') return keySigFor(ks);
  if (ks.tonic) return keySigFor(ks.tonic, ks.mode || 'major');
  return ks.count > 0 ? { type: ks.type, count: Math.min(7, ks.count) } : null;
}

// letter -> alteration (+1/-1) implied by a key signature
function keySigAlterations(ks) {
  const map = {};
  if (!ks) return map;
  const order = ks.type === 'sharp' ? SHARP_ORDER : FLAT_ORDER;
  for (let i = 0; i < ks.count; i++) map[order[i]] = ks.type === 'sharp' ? 1 : -1;
  return map;
}

/* ---------- durations ---------- */

const DURATIONS = {
  semibreve:  { head: 'noteheadWhole', stem: false, flags: 0, beats: 4 },
  minim:      { head: 'noteheadHalf',  stem: true,  flags: 0, beats: 2 },
  crotchet:   { head: 'noteheadBlack', stem: true,  flags: 0, beats: 1 },
  quaver:     { head: 'noteheadBlack', stem: true,  flags: 1, beats: 0.5 },
  semiquaver: { head: 'noteheadBlack', stem: true,  flags: 2, beats: 0.25 }
};
const REST_GLYPH = { semibreve: 'restWhole', minim: 'restHalf', crotchet: 'restQuarter', quaver: 'rest8th', semiquaver: 'rest16th' };

/* ---------- glyph helpers ---------- */

function glyphWidth(name) { return SMUFL_GLYPHS[name].w * GS; }

function glyphPath(name, x, y, cls) {
  return svgEl('path', {
    d: SMUFL_GLYPHS[name].d,
    transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${GS})`,
    class: 'music-glyph' + (cls ? ' ' + cls : '')
  });
}

/* ============================================================
   drawStaff
   opts: {
     clef: 'treble' | 'bass' | 'alto' | 'rhythm' (one-line staff, no clef),
     width, caption,
     keySignature: {type:'sharp'|'flat', count} | 'D' | {tonic:'Bb', mode:'major'},
     timeSignature: '3/4' | '6/8' | 'C' | 'cut',
     notes: ['C4', {pitch:'E4', duration:'minim', dots:1, label:'…',
                    articulation:'staccato', tie:true},
             {chord:['C4','E4','G4'], duration:'crotchet'},
             {rest:true, duration:'crotchet'}, {barline:'single'|'double'|'final'}],
     chordNotes: ['C4','E4','G4']         // shorthand for a single chord
     beams: [[0,3]], slurs: [[0,2]], tuplets: [{from:0,to:2,num:3}],
     highlightIndex, endBarline
   }
   returns an <svg> element.
   ============================================================ */
function drawStaff(opts = {}) {
  const o = Object.assign({
    clef: 'treble', width: 360, notes: [], keySignature: null, timeSignature: null,
    highlightIndex: null, chordNotes: null, caption: null, beams: [], slurs: [], tuplets: [],
    endBarline: null, showClef: true, chordDuration: 'crotchet'
  }, opts);
  Object.keys(opts).forEach(k => { if (opts[k] === undefined) delete o[k]; });
  const clef = o.clef;
  const isRhythm = clef === 'rhythm';
  const ref = isRhythm ? null : CLEF_REF[clef];
  if (!isRhythm && !ref) throw new Error('Unknown clef: ' + clef);
  const ks = isRhythm ? null : normaliseKeySig(o.keySignature);

  const svg = svgEl('svg', { class: 'staff-svg', role: 'img', 'aria-label': o.caption || 'music staff' });
  const TOP = 0, BOTTOM = 4 * LINE_GAP;     // staff line y-coordinates
  const yStep = s => BOTTOM - s * STEP;    // y for a step above the bottom line
  // vertical extent of barlines: full staff, or just around the single line of a rhythm staff
  const ST = isRhythm ? yStep(4) - LINE_GAP : TOP;
  const SB = isRhythm ? yStep(4) + LINE_GAP : BOTTOM;
  let minY = ST, maxY = SB, minX = 0;
  const track = (y0, y1) => { if (y0 < minY) minY = y0; if (y1 > maxY) maxY = y1; };
  const trackGlyph = (name, x, y) => { const g = SMUFL_GLYPHS[name]; track(y + g.y0 * GS, y + g.y1 * GS); };
  const put = (node) => { body.appendChild(node); return node; };
  const body = svgEl('g', {});

  /* ---- normalise items ---- */
  let rawItems;
  if (o.chordNotes && o.chordNotes.length) rawItems = [{ chord: o.chordNotes.slice(), duration: o.chordDuration }];
  else rawItems = (o.notes || []).map(n => (typeof n === 'string' ? { pitch: n } : n));
  const items = rawItems.map(n => {
    if (n.barline) return { kind: 'bar', style: n.barline === true ? 'single' : n.barline, weight: 0.55 };
    if (n.rest) return { kind: 'rest', duration: n.duration || 'crotchet', label: n.label, weight: 1 };
    const pitches = n.chord ? n.chord.slice() : [n.pitch];
    return {
      kind: 'note', pitches, duration: n.duration || 'crotchet', dots: n.dots || (n.dotted ? 1 : 0),
      label: n.label, articulation: n.articulation, tie: !!n.tie, stemDir: n.stemDir, weight: 1
    };
  });

  /* ---- horizontal layout ---- */
  const CLEF_X = 24;
  let cursor = CLEF_X;
  const clefName = clef === 'treble' ? 'gClef' : clef === 'bass' ? 'fClef' : 'cClef';
  if (!isRhythm && o.showClef) cursor += glyphWidth(clefName) + 8;
  else cursor = 26;

  const ksStartX = cursor;
  let ksWidth = 0;
  if (ks) {
    const gname = ks.type === 'sharp' ? 'accidentalSharp' : 'accidentalFlat';
    ksWidth = ks.count * (glyphWidth(gname) + 2.5) + 6;
    cursor += ksWidth;
  }
  const tsStartX = cursor;
  let tsWidth = 0, tsParts = null;
  if (o.timeSignature && !isRhythm || (isRhythm && o.timeSignature)) {
    if (o.timeSignature === 'C' || o.timeSignature === 'cut') {
      tsParts = { common: o.timeSignature === 'C' ? 'timeSigCommon' : 'timeSigCutCommon' };
      tsWidth = glyphWidth(tsParts.common) + 10;
    } else {
      const [n, d] = String(o.timeSignature).split('/');
      const widthOf = s => s.split('').reduce((a, ch) => a + glyphWidth('timeSig' + ch), 0);
      tsParts = { n, d, w: Math.max(widthOf(n), widthOf(d)) };
      tsWidth = tsParts.w + 10;
    }
    cursor += tsWidth;
  }
  const startX = cursor + (items.length ? 16 : 0);
  const MIN_PER_WEIGHT = 34;
  const totalWeight = items.reduce((a, it) => a + it.weight + (it.kind === 'note' && it.dots ? 0.3 : 0), 0) || 1;
  const endReserve = o.endBarline ? 16 : 0;
  const finalW = Math.max(o.width, startX + totalWeight * MIN_PER_WEIGHT + 26 + endReserve);
  const usable = finalW - 26 - endReserve - startX;

  // staff lines (drawn first so everything sits on top)
  const lineX1 = 20, lineX2 = finalW - 20;
  if (isRhythm) {
    svg.appendChild(svgEl('line', { x1: lineX1, x2: lineX2, y1: yStep(4), y2: yStep(4), class: 'staff-line' }));
  } else {
    for (let i = 0; i < 5; i++) svg.appendChild(svgEl('line', { x1: lineX1, x2: lineX2, y1: TOP + i * LINE_GAP, y2: TOP + i * LINE_GAP, class: 'staff-line' }));
  }
  minX = 0;
  svg.appendChild(body);
  // left barline for pitched staves
  if (!isRhythm) put(svgEl('line', { x1: lineX1, x2: lineX1, y1: ST, y2: SB, class: 'barline' }));

  /* ---- clef ---- */
  if (!isRhythm && o.showClef) {
    const originStep = clef === 'treble' ? 2 : clef === 'bass' ? 6 : 4;   // G line / F line / middle C line
    put(glyphPath(clefName, CLEF_X, yStep(originStep), 'clef'));
    trackGlyph(clefName, CLEF_X, yStep(originStep));
  }

  /* ---- key signature ---- */
  if (ks) {
    const gname = ks.type === 'sharp' ? 'accidentalSharp' : 'accidentalFlat';
    const steps = KEYSIG_STEPS[clef][ks.type];
    let x = ksStartX + 2;
    for (let i = 0; i < ks.count; i++) {
      put(glyphPath(gname, x, yStep(steps[i]), 'keysig'));
      trackGlyph(gname, x, yStep(steps[i]));
      x += glyphWidth(gname) + 2.5;
    }
  }

  /* ---- time signature ---- */
  if (tsParts) {
    const x0 = tsStartX + 2;
    if (tsParts.common) {
      put(glyphPath(tsParts.common, x0, yStep(4), 'timesig'));
    } else {
      const drawDigits = (s, cy) => {
        const w = s.split('').reduce((a, ch) => a + glyphWidth('timeSig' + ch), 0);
        let x = x0 + (tsParts.w - w) / 2;
        s.split('').forEach(ch => { put(glyphPath('timeSig' + ch, x, cy, 'timesig')); x += glyphWidth('timeSig' + ch); });
      };
      drawDigits(tsParts.n, yStep(6));
      drawDigits(tsParts.d, yStep(2));
      track(yStep(6) - 251 * GS, yStep(2) + 259 * GS);
    }
  }

  /* ---- geometry pass ---- */
  const keyAlt = keySigAlterations(ks);
  let barState = Object.assign({}, keyAlt);       // letter+octave -> current alteration
  const altState = {};                             // 'C4' -> alteration in this bar
  const curAlt = (letter, octave) => (altState[letter + octave] !== undefined ? altState[letter + octave] : (keyAlt[letter] || 0));
  const headW = glyphWidth('noteheadBlack');
  const wholeW = glyphWidth('noteheadWhole');

  let cum = 0;
  const geo = [];
  items.forEach((it, idx) => {
    const w = it.weight + (it.kind === 'note' && it.dots ? 0.3 : 0);
    it.x = startX + (cum + w / 2) * (usable / totalWeight);
    cum += w;
    if (it.kind === 'bar') {
      for (const k of Object.keys(altState)) delete altState[k];
      return;
    }
    if (it.kind !== 'note') return;

    const dur = DURATIONS[it.duration] || DURATIONS.crotchet;
    const hw = dur.head === 'noteheadWhole' ? wholeW : headW;
    const heads = it.pitches.map(p => {
      const pp = parsePitch(p);
      const step = isRhythm ? 4 : diatonicStep(p) - ref.refStep;
      return { pitch: p, letter: pp.letter, octave: pp.octave, acc: pp.acc, step, y: yStep(step), dx: 0, alt: ACC_OFFSET[pp.acc], accShow: null };
    });
    // which accidental sign is needed?
    if (!isRhythm) {
      heads.forEach(h => {
        const explicitNatural = h.acc === 'n';
        const cur = curAlt(h.letter, h.octave);
        if (h.alt !== cur || (explicitNatural && cur === 0 && false)) {
          h.accShow = h.alt > 0 ? (h.alt === 2 ? '##' : '#') : h.alt < 0 ? (h.alt === -2 ? 'bb' : 'b') : 'n';
        } else if (explicitNatural && cur === 0) {
          h.accShow = 'n';   // author asked for a courtesy natural
        }
        altState[h.letter + h.octave] = h.alt;
      });
    }
    const steps = heads.map(h => h.step);
    const minStep = Math.min(...steps), maxStep = Math.max(...steps);
    let stemUp;
    if (isRhythm) stemUp = true;
    else if (it.stemDir) stemUp = it.stemDir === 'up';
    else stemUp = (4 - minStep) > (maxStep - 4);

    // displace the second note of a chord when two notes are a 2nd apart
    const sorted = heads.slice().sort((a, b) => a.step - b.step);
    if (dur.stem && sorted.length > 1) {
      const seq = stemUp ? sorted : sorted.slice().reverse();
      for (let i = 1; i < seq.length; i++) {
        if (Math.abs(seq[i].step - seq[i - 1].step) === 1 && seq[i - 1].dx === 0) seq[i].dx = (stemUp ? 1 : -1) * (hw - STEM_W);
      }
    }
    geo[idx] = { it, dur, hw, heads, stemUp, minStep, maxStep, x: it.x };
  });

  /* ---- beams (decide stem direction + tip for groups) ---- */
  const beamed = new Set();
  const beamGroups = (o.beams || []).map(([a, b]) => {
    const members = [];
    for (let i = a; i <= b; i++) if (geo[i]) members.push(i);
    members.forEach(i => beamed.add(i));
    if (!members.length) return null;
    const ups = members.filter(i => geo[i].stemUp).length;
    const up = isRhythm ? true : ups * 2 > members.length || (ups * 2 === members.length && geo[members[0]].stemUp);
    members.forEach(i => { geo[i].stemUp = up; });
    return { members, up };
  }).filter(Boolean);

  // stem tips
  geo.forEach(g => {
    if (!g) return;
    if (!g.dur.stem) return;
    const extra = g.dur.flags >= 2 ? STEP : 0;
    if (g.stemUp) {
      const tipStep = Math.max(g.maxStep + 7, 4) + (g.maxStep + 7 < 4 ? 0 : 0);
      g.tipY = yStep(tipStep) - extra;
      g.baseY = yStep(g.minStep) - 2;
    } else {
      const tipStep = Math.min(g.minStep - 7, 4);
      g.tipY = yStep(tipStep) + extra;
      g.baseY = yStep(g.maxStep) + 2;
    }
    if (isRhythm) { g.tipY = yStep(4) - 7 * STEP - extra; g.baseY = yStep(4) - 2; }
    g.stemX = g.stemUp ? g.x + g.hw / 2 - STEM_W / 2 : g.x - g.hw / 2 + STEM_W / 2;
  });
  beamGroups.forEach(grp => {
    const tips = grp.members.map(i => geo[i].tipY);
    const beamTip = grp.up ? Math.min(...tips) : Math.max(...tips);
    grp.tip = beamTip;
    grp.members.forEach(i => { geo[i].tipY = beamTip; });
  });

  /* ---- draw items ---- */
  items.forEach((it, idx) => {
    if (it.kind === 'bar') {
      const x = it.x;
      if (it.style === 'double') {
        put(svgEl('line', { x1: x - 2.5, x2: x - 2.5, y1: ST, y2: SB, class: 'barline' }));
        put(svgEl('line', { x1: x + 2.5, x2: x + 2.5, y1: ST, y2: SB, class: 'barline' }));
      } else if (it.style === 'final') {
        put(svgEl('line', { x1: x - 3, x2: x - 3, y1: ST, y2: SB, class: 'barline' }));
        put(svgEl('line', { x1: x + 1.5, x2: x + 1.5, y1: ST, y2: SB, class: 'barline barline-thick' }));
      } else {
        put(svgEl('line', { x1: x, x2: x, y1: ST, y2: SB, class: 'barline' }));
      }
      return;
    }
    if (it.kind === 'rest') {
      const g = REST_GLYPH[it.duration] || 'restQuarter';
      const gy = it.duration === 'semibreve' ? yStep(6) : it.duration === 'minim' ? yStep(4) : yStep(4);
      const gx = it.x - glyphWidth(g) / 2;
      put(glyphPath(g, gx, gy, 'rest'));
      trackGlyph(g, gx, gy);
      if (it.label) it._labelX = it.x;
      return;
    }
    const gg = geo[idx];
    const { dur, hw, heads, stemUp } = gg;
    const x = it.x;

    // ledger lines
    heads.forEach(h => {
      const hx = x + h.dx;
      const l1 = hx - hw / 2 - 4.8, l2 = hx + hw / 2 + 4.8;
      if (isRhythm) return;
      if (h.step < 0) for (let s = -2; s >= h.step; s -= 2) put(svgEl('line', { x1: l1, x2: l2, y1: yStep(s), y2: yStep(s), class: 'ledger-line' }));
      else if (h.step > 8) for (let s = 10; s <= h.step; s += 2) put(svgEl('line', { x1: l1, x2: l2, y1: yStep(s), y2: yStep(s), class: 'ledger-line' }));
    });

    // accidental signs (stagger into columns for chords)
    const accHeads = heads.filter(h => h.accShow).sort((a, b) => b.step - a.step);
    const cols = [];
    const leftEdge = Math.min(...heads.map(h => x + h.dx - hw / 2));
    accHeads.forEach(h => {
      const gname = h.accShow === 'n' ? 'accidentalNatural' : (h.accShow === '#' ? 'accidentalSharp' : h.accShow === '##' ? 'accidentalDoubleSharp' : 'accidentalFlat');
      let c = cols.findIndex(col => Math.abs(col.lastStep - h.step) >= 6);
      if (c === -1) { cols.push({ lastStep: h.step }); c = cols.length - 1; } else cols[c].lastStep = h.step;
      const w = glyphWidth(gname);
      const ax = leftEdge - 3.5 - (c + 1) * (glyphWidth('accidentalSharp') + 1.5) + (glyphWidth('accidentalSharp') - w);
      put(glyphPath(gname, ax, h.y, 'acc'));
      trackGlyph(gname, ax, h.y);
      if (h.accShow === 'bb') { const ax2 = ax - w + 1; put(glyphPath('accidentalFlat', ax2, h.y, 'acc')); }
    });

    // noteheads
    heads.forEach(h => {
      put(glyphPath(dur.head, x + h.dx - hw / 2, h.y, 'notehead')).setAttribute('data-pitch', h.pitch);
      track(h.y - 7, h.y + 7);
    });

    // dots
    if (it.dots) {
      const rightEdge = Math.max(...heads.map(h => x + h.dx + hw / 2));
      heads.forEach(h => {
        const onLine = !isRhythm ? h.step % 2 === 0 : true;
        const dy = onLine ? h.y - STEP : h.y;
        for (let d = 0; d < it.dots; d++) {
          put(glyphPath('augmentationDot', rightEdge + 4 + d * 5.5, dy, 'dot'));
        }
      });
    }

    // stem + flags
    if (dur.stem) {
      const inBeam = beamed.has(idx);
      const stem = svgEl('line', { x1: gg.stemX, x2: gg.stemX, y1: gg.baseY, y2: gg.tipY, class: 'stem' });
      put(stem);
      track(Math.min(gg.tipY, gg.baseY), Math.max(gg.tipY, gg.baseY));
      if (dur.flags && !inBeam) {
        const fname = (dur.flags === 1 ? 'flag8th' : 'flag16th') + (stemUp ? 'Up' : 'Down');
        put(glyphPath(fname, gg.stemX - STEM_W / 2, gg.tipY, 'flag'));
        trackGlyph(fname, gg.stemX - STEM_W / 2, gg.tipY);
      }
    }

    // articulation (placed on the notehead side, away from the stem)
    if (it.articulation) {
      const map = { staccato: 'articStaccatoAbove', accent: 'articAccentAbove', tenuto: 'articTenutoAbove', marcato: 'articMarcatoAbove' };
      const gname = map[it.articulation];
      if (gname) {
        const above = dur.stem ? !stemUp : true;
        const topStep = gg.maxStep, botStep = gg.minStep;
        let ay = above ? yStep(topStep) - 1.25 * LINE_GAP : yStep(botStep) + 1.25 * LINE_GAP;
        // keep clear of staff lines by snapping to a space
        const gW = glyphWidth(gname);
        put(glyphPath(gname, x - gW / 2, above ? ay + (it.articulation === 'staccato' ? 6 : 0) : ay + (it.articulation === 'staccato' ? 0 : 0), 'artic'));
        trackGlyph(gname, x - gW / 2, ay);
      }
    }
  });

  /* ---- beams ---- */
  beamGroups.forEach(grp => {
    const ms = grp.members;
    const thick = 6, gap = 3;
    const dir = grp.up ? 1 : -1;      // beams grow away from the tip toward the noteheads
    const xL = geo[ms[0]].stemX - STEM_W / 2;
    const xR = geo[ms[ms.length - 1]].stemX + STEM_W / 2;
    const rect = (x1, x2, level) => {
      const y0 = grp.up ? grp.tip + level * (thick + gap) : grp.tip - thick - level * (thick + gap);
      put(svgEl('rect', { x: x1, y: y0, width: x2 - x1, height: thick, class: 'beam' }));
      track(y0, y0 + thick);
    };
    rect(xL, xR, 0);
    // secondary beams for semiquavers
    let run = [];
    const flush = () => {
      if (!run.length) return;
      if (run.length > 1) rect(geo[run[0]].stemX - STEM_W / 2, geo[run[run.length - 1]].stemX + STEM_W / 2, 1);
      else {
        const i = run[0];
        const pos = ms.indexOf(i);
        const stub = 8;
        const toRight = pos < ms.length - 1;
        const sx = geo[i].stemX;
        if (toRight) rect(sx - STEM_W / 2, sx + stub, 1); else rect(sx - stub, sx + STEM_W / 2, 1);
      }
      run = [];
    };
    ms.forEach(i => { if (geo[i].dur.flags >= 2) run.push(i); else flush(); });
    flush();
  });

  /* ---- tuplets ---- */
  (o.tuplets || []).forEach(tp => {
    const a = geo[tp.from], b = geo[tp.to];
    if (!a || !b) return;
    const cx = (a.stemX + b.stemX) / 2;
    const up = a.stemUp;
    const tip = beamGroups.find(gr => gr.members.includes(tp.from));
    const tipY = tip ? tip.tip : a.tipY;
    if (tp.num === 3) {
      const gw = glyphWidth('tuplet3');
      const gy = up ? tipY - 5 : tipY + 5 + 375 * GS;
      put(glyphPath('tuplet3', cx - gw / 2, gy, 'tuplet'));
      trackGlyph('tuplet3', cx - gw / 2, gy);
    } else {
      const t = svgEl('text', { x: cx, y: up ? tipY - 5 : tipY + 16, class: 'tuplet-text', 'text-anchor': 'middle' });
      t.textContent = String(tp.num);
      put(t);
    }
  });

  /* ---- ties & slurs ---- */
  const arc = (x1, y1, x2, y2, above, lift) => {
    const mx = (x1 + x2) / 2;
    const cy = (above ? Math.min(y1, y2) - lift : Math.max(y1, y2) + lift);
    put(svgEl('path', { d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, class: 'tie-arc' }));
    track(Math.min(y1, y2, cy) - 2, Math.max(y1, y2, cy) + 2);
  };
  const noteIdx = geo.map((g, i) => (g ? i : -1)).filter(i => i >= 0);
  items.forEach((it, idx) => {
    if (it.kind === 'note' && it.tie) {
      const next = noteIdx.find(j => j > idx);
      if (next === undefined) return;
      const a = geo[idx], b = geo[next];
      const above = !a.stemUp;                     // curve away from the stems
      const ya = above ? a.heads[a.heads.length - 1].y - 8 : a.heads[0].y + 8;
      const yb = above ? b.heads[b.heads.length - 1].y - 8 : b.heads[0].y + 8;
      arc(a.x + a.hw / 2 + 1, ya, b.x - b.hw / 2 - 1, yb, above, 7);
    }
  });
  (o.slurs || []).forEach(([i, j]) => {
    const a = geo[i], b = geo[j];
    if (!a || !b) return;
    const above = !a.stemUp;
    // articulation marks sit on the notehead side, so lift the slur clear of them
    const clearA = (a.it.articulation && (a.dur.stem ? !a.stemUp === above : true)) ? 14 : 0;
    const clearB = (b.it.articulation && (b.dur.stem ? !b.stemUp === above : true)) ? 14 : 0;
    const ya = (above ? Math.min(...a.heads.map(h => h.y)) - 10 - clearA : Math.max(...a.heads.map(h => h.y)) + 10 + clearA);
    const yb = (above ? Math.min(...b.heads.map(h => h.y)) - 10 - clearB : Math.max(...b.heads.map(h => h.y)) + 10 + clearB);
    arc(a.x, ya, b.x, yb, above, 12);
  });

  // end barline
  if (o.endBarline) {
    const bx = finalW - 26;
    if (o.endBarline === 'final') {
      put(svgEl('line', { x1: bx - 3, x2: bx - 3, y1: ST, y2: SB, class: 'barline' }));
      put(svgEl('line', { x1: bx + 1.5, x2: bx + 1.5, y1: ST, y2: SB, class: 'barline barline-thick' }));
    } else put(svgEl('line', { x1: bx, x2: bx, y1: ST, y2: SB, class: 'barline' }));
  }

  // highlight ring
  if (o.highlightIndex !== null && o.highlightIndex !== undefined && geo[o.highlightIndex]) {
    const g = geo[o.highlightIndex];
    const h = g.heads[0];
    put(svgEl('circle', { cx: g.x, cy: h.y, r: 13, class: 'note-highlight' }));
  }

  /* ---- labels ---- */
  const anyLabel = items.some(it => it.label);
  if (anyLabel) {
    const ly = Math.max(maxY, SB + (isRhythm ? 1.2 : 3) * LINE_GAP) + 14;
    items.forEach(it => {
      if (!it.label) return;
      const t = svgEl('text', { x: it.x, y: ly, class: 'note-caption', 'text-anchor': 'middle' });
      t.textContent = it.label;
      put(t);
    });
    track(ly - 10, ly + 4);
  }

  const padTop = 10, padBottom = 8;
  const vbY = minY - padTop;
  const vbH = (maxY + padBottom) - vbY;
  svg.setAttribute('viewBox', `${minX} ${vbY.toFixed(1)} ${finalW} ${vbH.toFixed(1)}`);
  svg.dataset.clef = clef;
  return svg;
}

/* ============================================================
   Rhythm strip — a one-line staff with proper note shapes.
   values: [{type, label}] where type is one of
     semibreve, minim, crotchet, quaver, semiquaver  (optionally 'dotted-…')
     rest-semibreve, rest-minim, rest-crotchet, rest-quaver, rest-semiquaver
     quaver-pair (2 beamed quavers), triplet (3 beamed quavers marked 3)
     barline
   Adjacent quavers/semiquavers are beamed automatically.
   ============================================================ */
function drawRhythmStrip(values, opts = {}) {
  const notes = [], beams = [], tuplets = [];
  const auto = opts.autoBeam !== false;
  let run = [];
  const endRun = () => { if (run.length > 1) beams.push([run[0], run[run.length - 1]]); run = []; };
  values.forEach(v => {
    const type = v.type;
    if (type === 'barline') { endRun(); notes.push({ barline: v.style || 'single' }); return; }
    if (type === 'triplet') {
      endRun();
      const s = notes.length;
      notes.push({ pitch: 'C4', duration: 'quaver' }, { pitch: 'C4', duration: 'quaver', label: v.label }, { pitch: 'C4', duration: 'quaver' });
      beams.push([s, s + 2]); tuplets.push({ from: s, to: s + 2, num: 3 });
      return;
    }
    if (type === 'quaver-pair') {
      endRun();
      const s = notes.length;
      notes.push({ pitch: 'C4', duration: 'quaver', label: v.label }, { pitch: 'C4', duration: 'quaver' });
      beams.push([s, s + 1]);
      return;
    }
    const restM = /^rest-(semibreve|minim|crotchet|quaver|semiquaver)$/.exec(type);
    if (restM) { endRun(); notes.push({ rest: true, duration: restM[1], label: v.label }); return; }
    const m = /^(dotted-)?(semibreve|minim|crotchet|quaver|semiquaver)$/.exec(type);
    if (!m) { endRun(); notes.push({ pitch: 'C4', duration: 'crotchet', label: v.label }); return; }
    const dur = m[2];
    const entry = { pitch: 'C4', duration: dur, dots: m[1] ? 1 : 0, label: v.label };
    if (auto && DURATIONS[dur].flags > 0 && run.length < 4) run.push(notes.length);
    else { endRun(); if (auto && DURATIONS[dur].flags > 0) run.push(notes.length); }
    notes.push(entry);
    if (!(DURATIONS[dur].flags > 0)) { run.pop(); }
  });
  endRun();
  return drawStaff({ clef: 'rhythm', width: opts.width || 360, notes, beams, tuplets, timeSignature: opts.timeSignature, endBarline: opts.endBarline, caption: opts.caption || 'rhythm notation' });
}

/* ============================================================
   Inline icons for use in running text (flashcards, lessons)
   noteIcon('crotchet') · 'dotted-minim' · 'rest-quaver' · 'treble-clef'
   · 'bass-clef' · 'alto-clef' · 'sharp' · 'flat' · 'natural'
   ============================================================ */
function noteIcon(kind) {
  const svg = svgEl('svg', { class: 'note-icon', role: 'img', 'aria-label': kind.replace(/-/g, ' ') });
  const g = svgEl('g', {});
  svg.appendChild(g);
  let x0 = 0, x1 = 0, y0 = 0, y1 = 0;
  const ext = (a, b, c, d) => { x0 = Math.min(x0, a); x1 = Math.max(x1, b); y0 = Math.min(y0, c); y1 = Math.max(y1, d); };
  const glyphAt = (name, x, y) => {
    const gl = SMUFL_GLYPHS[name];
    g.appendChild(glyphPath(name, x, y));
    ext(x + gl.x0 * GS, x + gl.x1 * GS, y + gl.y0 * GS, y + gl.y1 * GS);
  };
  const clefs = { 'treble-clef': 'gClef', 'bass-clef': 'fClef', 'alto-clef': 'cClef' };
  const accs = { sharp: 'accidentalSharp', flat: 'accidentalFlat', natural: 'accidentalNatural' };
  if (clefs[kind]) glyphAt(clefs[kind], 0, 0);
  else if (accs[kind]) glyphAt(accs[kind], 0, 0);
  else {
    const rm = /^rest-(.+)$/.exec(kind);
    if (rm) {
      const name = REST_GLYPH[rm[1]] || 'restQuarter';
      glyphAt(name, 0, name === 'restWhole' ? -LINE_GAP : name === 'restHalf' ? 0 : 0);
    } else {
      const m = /^(dotted-)?(semibreve|minim|crotchet|quaver|semiquaver)$/.exec(kind) || [null, '', 'crotchet'];
      const dur = DURATIONS[m[2]];
      const hw = glyphWidth(dur.head);
      glyphAt(dur.head, 0, 0);
      if (dur.stem) {
        const sx = hw - STEM_W / 2, tip = -3.5 * LINE_GAP - (dur.flags >= 2 ? STEP : 0);
        g.appendChild(svgEl('line', { x1: sx, x2: sx, y1: -2, y2: tip, class: 'stem' }));
        ext(sx - 1, sx + 1, tip, 0);
        if (dur.flags) glyphAt(dur.flags === 1 ? 'flag8thUp' : 'flag16thUp', sx - STEM_W / 2, tip);
      }
      if (m[1]) glyphAt('augmentationDot', hw + 4, -STEP);
    }
  }
  const pad = 2;
  svg.setAttribute('viewBox', `${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${(x1 - x0 + 2 * pad).toFixed(1)} ${(y1 - y0 + 2 * pad).toFixed(1)}`);
  const emH = ((y1 - y0 + 2 * pad) / LINE_GAP) * 0.32;
  svg.style.height = emH.toFixed(2) + 'em';
  svg.style.width = 'auto';
  return svg;
}

/* ============================================================
   Music-theory helpers (spelling, intervals, triads)
   ============================================================ */

// accidental string for an alteration count: 1 -> '#', -1 -> 'b'
function accString(alt) { return alt > 0 ? '#'.repeat(alt) : alt < 0 ? 'b'.repeat(-alt) : ''; }

const ORDINALS = ['', '1st', '2nd', '3rd', '4th', '5th'];

/** Plain-English position of a pitch on a staff, e.g. describePosition('G4','treble') -> '2nd line' ;
    'C4','treble' -> 'first ledger line below the stave'. Used for explanations. */
function describePosition(pitch, clef) {
  const step = diatonicStep(pitch) - CLEF_REF[clef].refStep;
  if (step >= 0 && step <= 8) return step % 2 === 0 ? `${ORDINALS[step / 2 + 1]} line` : `${ORDINALS[(step + 1) / 2]} space`;
  const word = n => ['', 'first', 'second', 'third', 'fourth'][n];
  if (step < 0) {
    if (step === -1) return 'space just below the stave';
    if (step % 2 === 0) return `${word(-step / 2)} ledger line below the stave`;
    return `space below the ${word((-step - 1) / 2)} ledger line`;
  }
  if (step === 9) return 'space just above the stave';
  if (step % 2 === 0) return `${word((step - 8) / 2)} ledger line above the stave`;
  return `space above the ${word((step - 9) / 2)} ledger line`;
}

/** Correctly SPELLED scale. spellScale('F#', MAJOR_SCALE_STEPS.slice(0,7)) -> F# G# A# B C# D# E# */
function spellScale(tonic, stepsArray) {
  const m = /^([A-G])(#|b)?$/.exec(tonic);
  if (!m) throw new Error('Bad tonic: ' + tonic);
  const startIdx = NOTE_LETTERS.indexOf(m[1]);
  const tonicChroma = (LETTER_SEMITONE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  return stepsArray.map((s, i) => {
    const letter = NOTE_LETTERS[(startIdx + (i % 7)) % 7];
    const target = (tonicChroma + s) % 12;
    let alt = ((target - LETTER_SEMITONE[letter]) % 12 + 12) % 12;
    if (alt > 6) alt -= 12;
    return letter + accString(alt);
  });
}

/** Turn scale note names into pitches with rising octaves: ['G','A','B','C',…] -> ['G4','A4','B4','C5',…] */
function ascendingPitches(names, startOctave = 4) {
  let oct = startOctave;
  let prevIdx = null;
  return names.map(n => {
    const idx = NOTE_LETTERS.indexOf(n[0]);
    if (prevIdx !== null && idx < prevIdx) oct++;
    prevIdx = idx;
    return n + oct;
  });
}

/** Interval between two pitches (ascending): {number, semitones, quality, name} */
function intervalInfo(p1, p2) {
  let a = p1, b = p2;
  if (pitchToMidi(b) < pitchToMidi(a) || (pitchToMidi(b) === pitchToMidi(a) && diatonicStep(b) < diatonicStep(a))) { a = p2; b = p1; }
  const stepDiff = diatonicStep(b) - diatonicStep(a);
  const semis = pitchToMidi(b) - pitchToMidi(a);
  const simple = stepDiff % 7;                 // 0..6
  const number = stepDiff === 0 ? 1 : (simple === 0 ? 8 : simple + 1);
  const compound = stepDiff > 7;
  const perfectBase = { 1: 0, 4: 5, 5: 7, 8: 12 };
  const majorBase = { 2: 2, 3: 4, 6: 9, 7: 11 };
  const semiMod = compound ? semis - 12 * Math.floor(stepDiff / 7) : semis;
  const semiSimple = number === 8 ? semis - 12 * (Math.floor(stepDiff / 7) - 1) : semiMod;
  let quality;
  if (number in perfectBase) {
    const d = semiSimple - perfectBase[number];
    quality = d === 0 ? 'Perfect' : d === 1 ? 'Augmented' : d === -1 ? 'Diminished' : d > 1 ? 'Doubly augmented' : 'Doubly diminished';
  } else {
    const d = semiSimple - majorBase[number];
    quality = d === 0 ? 'Major' : d === -1 ? 'Minor' : d === 1 ? 'Augmented' : d === -2 ? 'Diminished' : d > 1 ? 'Doubly augmented' : 'Doubly diminished';
  }
  const ordinals = { 1: 'unison', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: 'octave' };
  let name;
  if (number === 1) name = quality === 'Perfect' ? 'Unison' : quality + ' unison';
  else if (number === 8) name = quality === 'Perfect' ? 'Octave' : quality + ' octave';
  else name = `${quality} ${ordinals[number]}`;
  return { number, semitones: semis, quality, name };
}

/** Root-position triad quality from three pitches: 'Major' | 'Minor' | 'Diminished' | 'Augmented' | null */
function triadQuality(pitches) {
  const sorted = pitches.slice().sort((x, y) => diatonicStep(x) - diatonicStep(y) || pitchToMidi(x) - pitchToMidi(y));
  if (sorted.length !== 3) return null;
  const third = intervalInfo(sorted[0], sorted[1]).name;
  const fifth = intervalInfo(sorted[0], sorted[2]).name;
  if (third === 'Major 3rd' && fifth === 'Perfect 5th') return 'Major';
  if (third === 'Minor 3rd' && fifth === 'Perfect 5th') return 'Minor';
  if (third === 'Minor 3rd' && fifth === 'Diminished 5th') return 'Diminished';
  if (third === 'Major 3rd' && fifth === 'Augmented 5th') return 'Augmented';
  return null;
}

/* ---------- Circle of Fifths data ---------- */

const CIRCLE_OF_FIFTHS = [
  { key: 'C', minor: 'Am', sharps: 0, flats: 0, angle: 0, tonics: ['C'], minors: ['A'] },
  { key: 'G', minor: 'Em', sharps: 1, flats: 0, angle: 30, tonics: ['G'], minors: ['E'] },
  { key: 'D', minor: 'Bm', sharps: 2, flats: 0, angle: 60, tonics: ['D'], minors: ['B'] },
  { key: 'A', minor: 'F#m', sharps: 3, flats: 0, angle: 90, tonics: ['A'], minors: ['F#'] },
  { key: 'E', minor: 'C#m', sharps: 4, flats: 0, angle: 120, tonics: ['E'], minors: ['C#'] },
  { key: 'B', minor: 'G#m', sharps: 5, flats: 0, angle: 150, tonics: ['B'], minors: ['G#'] },
  { key: 'F#/Gb', minor: 'D#m/Ebm', sharps: 6, flats: 6, angle: 180, tonics: ['F#', 'Gb'], minors: ['D#', 'Eb'] },
  { key: 'Db', minor: 'Bbm', sharps: 0, flats: 5, angle: 210, tonics: ['Db'], minors: ['Bb'] },
  { key: 'Ab', minor: 'Fm', sharps: 0, flats: 4, angle: 240, tonics: ['Ab'], minors: ['F'] },
  { key: 'Eb', minor: 'Cm', sharps: 0, flats: 3, angle: 270, tonics: ['Eb'], minors: ['C'] },
  { key: 'Bb', minor: 'Gm', sharps: 0, flats: 2, angle: 300, tonics: ['Bb'], minors: ['G'] },
  { key: 'F', minor: 'Dm', sharps: 0, flats: 1, angle: 330, tonics: ['F'], minors: ['D'] }
];

const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];
const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10, 12];
const HARMONIC_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 11, 12];
const MELODIC_MINOR_UP_STEPS = [0, 2, 3, 5, 7, 9, 11, 12];

const DEGREE_NAMES = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading note', 'Tonic'];

const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Kept for backwards compatibility: now returns CORRECTLY SPELLED scale notes
// (e.g. F# major contains E#, not F). The third argument is ignored.
function scaleNotes(tonic, stepsArray) {
  return spellScale(tonic, stepsArray);
}
