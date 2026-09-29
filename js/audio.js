/* ============================================================
   GCSE Music Theory Quest — audio.js
   Tiny Web Audio synth. No external sound files or APIs.
   ============================================================ */

const AudioLab = (function () {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setEnabled(v) { enabled = v; }
  function isEnabled() { return enabled; }

  // Pitch -> MIDI number. Handles every spelling the notation engine can draw:
  // sharps, flats, double accidentals and edge cases like Cb4 (= B3) and B#3 (= C4).
  const NOTE_TO_MIDI = (() => {
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const alt = { '': 0, n: 0, '#': 1, b: -1, '##': 2, bb: -2 };
    return function (pitch) {
      const m = String(pitch).match(/^([A-G])(##|bb|#|b|n)?(-?\d+)$/);
      if (!m) return 60;
      return (parseInt(m[3], 10) + 1) * 12 + base[m[1]] + alt[m[2] || ''];
    };
  })();

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function freqFor(pitch) {
    return midiToFreq(NOTE_TO_MIDI(pitch));
  }

  function playFreq(freq, { start = 0, duration = 0.7, gain = 0.18, type = 'triangle' } = {}) {
    if (!enabled) return;
    const audioCtx = getCtx();
    const t0 = audioCtx.currentTime + start;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  function playNote(pitch, opts = {}) {
    playFreq(freqFor(pitch), opts);
  }

  function playChord(pitches, opts = {}) {
    pitches.forEach(p => playFreq(freqFor(p), { ...opts, gain: (opts.gain || 0.16) / Math.sqrt(pitches.length) }));
  }

  function playSequence(pitches, gapSeconds = 0.45, opts = {}) {
    pitches.forEach((p, i) => playFreq(freqFor(p), { ...opts, start: i * gapSeconds, duration: opts.duration || gapSeconds * 0.95 }));
  }

  function playInterval(pitch1, pitch2, mode = 'melodic') {
    if (mode === 'harmonic') {
      playChord([pitch1, pitch2], { duration: 1.2 });
    } else {
      playSequence([pitch1, pitch2], 0.6, { duration: 0.55 });
    }
  }

  function playScale(pitches) {
    playSequence(pitches, 0.32, { duration: 0.3 });
  }

  function playClick(strong = false) {
    if (!enabled) return;
    const audioCtx = getCtx();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(strong ? 1400 : 900, t0);
    g.gain.setValueAtTime(strong ? 0.22 : 0.14, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.09);
  }

  // pattern: durations in beats, e.g. [1, 1, 0.5, 0.5, 1]. A NEGATIVE number is a rest of that length.
  // countIn: number of steady beats played first (strong click on the first) so the listener can hear the pulse.
  function playRhythm(pattern, bpm = 100, countIn = 0) {
    if (!enabled) return;
    const beatSec = 60 / bpm;
    let t = 0;
    for (let i = 0; i < countIn; i++) {
      const strong = i === 0;
      setTimeout(() => playClick(strong), t * 1000);
      t += beatSec;
    }
    pattern.forEach(d => {
      if (d > 0) setTimeout(() => playClick(false), t * 1000);
      t += Math.abs(d) * beatSec;
    });
    return t;   // total length in seconds
  }

  function playCadence(chords) {
    // chords: array of pitch arrays, played in sequence
    let t = 0;
    chords.forEach(chord => {
      chord.forEach(p => playFreq(freqFor(p), { start: t, duration: 0.85 }));
      t += 0.9;
    });
  }

  return { playNote, playChord, playSequence, playInterval, playScale, playClick, playRhythm, playCadence, setEnabled, isEnabled, freqFor, midiOf: NOTE_TO_MIDI };
})();
