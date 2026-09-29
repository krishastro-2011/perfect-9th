/* ============================================================
   Perfect 9th — trainer.js
   The Notation Trainer: unlimited, self-checking practice for
   reading the stave — note names in treble / bass / alto clef,
   clef recognition, key signatures, intervals and note values.

   Part 1 (TrainerGen) makes questions with computed answers and
   explanations. Part 2 builds the interactive widget.
   ============================================================ */

const TRAINER_CLEFS = ['treble', 'bass', 'alto'];
const TRAINER_CLEF_NAMES = { treble: 'Treble clef', bass: 'Bass clef', alto: 'Alto clef' };

function trainerPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function trainerInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

/** Pitch for a given number of diatonic steps above a clef's bottom line. */
function stepToPitch(clef, step, acc = '') {
  const total = CLEF_REF[clef].refStep + step;
  const idx = ((total % 7) + 7) % 7;
  return NOTE_LETTERS[idx] + acc + Math.floor(total / 7);
}

function trainerOptions(correct, pool, n = 4) {
  const others = shuffle(pool.filter(o => o !== correct));
  return shuffle([correct, ...others.slice(0, n - 1)]);
}

const TrainerGen = {
  /** Name the note. cfg: {clef:'treble'|'bass'|'alto'|'mixed', ledger:boolean, accidentals:boolean} */
  note(cfg = {}) {
    const clef = cfg.clef && cfg.clef !== 'mixed' ? cfg.clef : trainerPick(TRAINER_CLEFS);
    const lo = cfg.ledger ? -4 : 0, hi = cfg.ledger ? 12 : 8;
    const step = trainerInt(lo, hi);
    let acc = '';
    if (cfg.accidentals && Math.random() < 0.45) acc = Math.random() < 0.5 ? '#' : 'b';
    const pitch = stepToPitch(clef, step, acc);
    const letter = pitch[0];
    const name = letter + acc;
    const pool = new Set();
    NOTE_LETTERS.forEach(l => pool.add(l));
    if (cfg.accidentals) { pool.add(letter + '#'); pool.add(letter + 'b'); }
    let options;
    if (cfg.accidentals) {
      // keep the distractors close: same letter with other accidentals, plus neighbouring letters
      const near = [letter, letter + '#', letter + 'b', NOTE_LETTERS[(NOTE_LETTERS.indexOf(letter) + 1) % 7], NOTE_LETTERS[(NOTE_LETTERS.indexOf(letter) + 6) % 7]];
      options = trainerOptions(name, near);
    } else options = trainerOptions(name, NOTE_LETTERS);
    const extra = pitch === 'C4' ? ' This is middle C.' : '';
    return {
      mode: 'note', clef,
      prompt: 'Which note is shown?',
      draw: { clef, notes: [pitch], caption: 'A note on the ' + clef + ' clef stave' },
      options: options.map(prettyName), answer: prettyName(name),
      explain: `${prettyPitch(pitch, true)} sits on the ${describePosition(pitch, clef)} of the ${clef} clef.${extra}`,
      sound: { kind: 'note', pitch }
    };
  },

  /** Which clef? */
  clef() {
    const clef = trainerPick(TRAINER_CLEFS);
    const info = {
      treble: 'The treble (G) clef curls around the 2nd line, which is G4. It is used for higher parts such as violin, flute, trumpet and the right hand of the piano.',
      bass: 'The bass (F) clef has two dots either side of the 4th line, which is F3. It is used for lower parts such as cello, bassoon, trombone, tuba and the left hand of the piano.',
      alto: 'The alto (C) clef points at the middle line, which is middle C (C4). The viola reads it as its main clef.'
    };
    return {
      mode: 'clef', clef,
      prompt: 'Which clef is this?',
      draw: { clef, notes: [], width: 240, caption: 'A clef on a stave' },
      options: shuffle(TRAINER_CLEFS.map(c => TRAINER_CLEF_NAMES[c])), answer: TRAINER_CLEF_NAMES[clef],
      explain: info[clef], sound: null
    };
  },

  /** Which major key has this key signature? cfg: {clef, maxAccidentals} */
  keysig(cfg = {}) {
    const clef = cfg.clef && cfg.clef !== 'mixed' ? cfg.clef : trainerPick(TRAINER_CLEFS);
    const max = cfg.maxAccidentals || 5;
    const majors = Object.entries(MAJOR_KEY_ACCIDENTALS).filter(([, n]) => Math.abs(n) <= max);
    const [tonic, n] = trainerPick(majors);
    const ks = keySigFor(tonic);
    const order = ks.type === 'sharp' ? SHARP_ORDER : FLAT_ORDER;
    const list = order.slice(0, ks.count).map(l => l + (ks.type === 'sharp' ? '♯' : '♭')).join(', ');
    let how;
    if (ks.count === 0) how = 'No sharps or flats means C major (or A minor).';
    else if (ks.type === 'sharp') how = `${ks.count} sharp${ks.count > 1 ? 's' : ''} (${list}). The last sharp is the leading note, so go up a semitone to find the key: ${prettyName(tonic)} major.`;
    else if (ks.count === 1) how = `One flat (B♭) means F major — you just have to remember this one.`;
    else how = `${ks.count} flats (${list}). The second-to-last flat is the name of the key: ${prettyName(tonic)} major.`;
    const relMinor = Object.entries(MINOR_KEY_ACCIDENTALS).find(([, m]) => m === n)[0];
    const pool = majors.map(([t]) => t);
    const near = pool.filter(t => Math.abs(MAJOR_KEY_ACCIDENTALS[t] - n) <= 2);
    return {
      mode: 'keysig', clef,
      prompt: 'Which major key has this key signature?',
      draw: { clef, notes: [], keySignature: ks.count ? ks : null, width: 300, caption: 'A key signature' },
      options: trainerOptions(tonic, near.length >= 4 ? near : pool).map(t => prettyName(t) + ' major'), answer: prettyName(tonic) + ' major',
      explain: `${how} Its relative minor is ${prettyName(relMinor)} minor.`,
      sound: { kind: 'scale', tonic }
    };
  },

  /** Name the interval (Major/Minor/Perfect 2nd–octave). cfg: {clef} */
  interval(cfg = {}) {
    const clef = cfg.clef && cfg.clef !== 'mixed' ? cfg.clef : trainerPick(TRAINER_CLEFS);
    for (let tries = 0; tries < 500; tries++) {
      const s1 = trainerInt(0, 6);
      const gap = trainerInt(1, 7);         // 1..7 steps up = 2nd..octave
      const acc1 = Math.random() < 0.25 ? trainerPick(['#', 'b']) : '';
      const acc2 = Math.random() < 0.35 ? trainerPick(['#', 'b']) : '';
      const p1 = stepToPitch(clef, s1, acc1), p2 = stepToPitch(clef, s1 + gap, acc2);
      const info = intervalInfo(p1, p2);
      if (!['Major', 'Minor', 'Perfect'].includes(info.quality) || info.number < 2) continue;
      const pool = [];
      for (const q of ['Major', 'Minor']) for (const num of [2, 3, 6, 7]) pool.push(`${q} ${['', '', '2nd', '3rd', '', '', '6th', '7th'][num]}`);
      pool.push('Perfect 4th', 'Perfect 5th', 'Octave');
      const near = pool.filter(n => n !== info.name && (n.split(' ')[1] === info.name.split(' ')[1] || Math.random() < 0.3));
      const options = shuffle([info.name, ...shuffle(near).slice(0, 3)]);
      if (options.length < 4) continue;
      const letters = [];
      for (let i = 0; i <= gap; i++) letters.push(NOTE_LETTERS[(NOTE_LETTERS.indexOf(p1[0]) + i) % 7]);
      return {
        mode: 'interval', clef,
        prompt: 'What is the interval between these two notes?',
        draw: { clef, notes: [p1, p2], caption: 'Two notes' },
        options, answer: info.name,
        explain: `Count the letter names ${letters.join('–')}: that makes a ${info.number === 8 ? 'octave' : ['', '', '2nd', '3rd', '4th', '5th', '6th', '7th'][info.number]}. The notes are ${info.semitones} semitones apart, which makes it a ${info.name}.`,
        sound: { kind: 'interval', pitches: [p1, p2] }
      };
    }
    return TrainerGen.note({ clef });
  },

  /** Note and rest values. */
  values() {
    const durs = ['semibreve', 'minim', 'crotchet', 'quaver', 'semiquaver'];
    const beats = { semibreve: '4 beats', minim: '2 beats', crotchet: '1 beat', quaver: '½ a beat', semiquaver: '¼ of a beat' };
    const us = { semibreve: 'whole note', minim: 'half note', crotchet: 'quarter note', quaver: 'eighth note', semiquaver: 'sixteenth note' };
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const isRest = Math.random() < 0.3;
    const dotted = !isRest && Math.random() < 0.3;
    const dur = trainerPick(durs);
    const label = (d, r, dt) => (dt ? 'Dotted ' + d : cap(d)) + (r ? ' rest' : '');
    const answer = isRest ? cap(dur) + ' rest' : (dotted ? 'Dotted ' + dur : cap(dur));
    const pool = [];
    durs.forEach(d => { pool.push(isRest ? cap(d) + ' rest' : cap(d)); if (!isRest) pool.push('Dotted ' + d); });
    const near = pool.filter(n => n !== answer);
    const options = shuffle([answer, ...shuffle(near).slice(0, 3)]);
    const value = dotted ? { semibreve: '6 beats', minim: '3 beats', crotchet: '1½ beats', quaver: '¾ of a beat', semiquaver: '⅜ of a beat' }[dur] : beats[dur];
    const note = isRest ? { rest: true, duration: dur } : { pitch: 'B4', duration: dur, dots: dotted ? 1 : 0, stemDir: 'down' };
    return {
      mode: 'values', clef: 'treble',
      prompt: isRest ? 'Which rest is this?' : 'Which note value is this?',
      draw: { clef: 'treble', notes: [note], width: 240, caption: isRest ? 'A rest' : 'A note' },
      options, answer,
      explain: `${answer} — worth ${value} when a crotchet is one beat.${!isRest && !dotted ? ` (In American English: ${us[dur]}.)` : ''}${dotted ? ' The dot adds half of the note\'s own value.' : ''}`,
      sound: isRest ? null : { kind: 'rhythm', pattern: [1] }
    };
  }
};

/* ------------------------------ UI ------------------------------ */

function buildNotationTrainer() {
  const cfg = { mode: 'note', clef: 'treble', ledger: false, accidentals: false, maxAccidentals: 4 };
  const stats = { asked: 0, correct: 0, streak: 0, best: 0 };
  let current = null, answered = false;

  const root = el('div', { class: 'trainer' });
  const controls = el('div', { class: 'trainer-controls' });
  const stage = el('div', { class: 'trainer-stage' });
  const scoreLine = el('p', { class: 'trainer-score', 'aria-live': 'polite' });
  root.appendChild(controls); root.appendChild(stage); root.appendChild(scoreLine);

  const chip = (label, active, fn) => el('button', { type: 'button', class: 'select-chip' + (active ? ' active' : ''), 'aria-pressed': String(!!active), onclick: fn }, label);

  function buildControls() {
    controls.innerHTML = '';
    const modes = [['note', '🎼 Note names'], ['clef', '🗝️ Clefs'], ['keysig', '🔑 Key signatures'], ['interval', '📏 Intervals'], ['values', '⏱️ Note values']];
    controls.appendChild(el('div', { class: 'trainer-row' }, [el('span', { class: 'trainer-label' }, 'Practise'), el('div', { class: 'select-grid' }, modes.map(([id, label]) => chip(label, cfg.mode === id, () => { cfg.mode = id; buildControls(); next(); })))]));
    if (['note', 'keysig', 'interval'].includes(cfg.mode)) {
      const clefs = [['treble', 'Treble'], ['bass', 'Bass'], ['alto', 'Alto'], ['mixed', 'Mixed']];
      controls.appendChild(el('div', { class: 'trainer-row' }, [el('span', { class: 'trainer-label' }, 'Clef'), el('div', { class: 'select-grid' }, clefs.map(([id, label]) => chip(label, cfg.clef === id, () => { cfg.clef = id; buildControls(); next(); })))]));
    }
    if (cfg.mode === 'note') {
      controls.appendChild(el('div', { class: 'trainer-row' }, [el('span', { class: 'trainer-label' }, 'Level'), el('div', { class: 'select-grid' }, [
        chip('On the stave', !cfg.ledger, () => { cfg.ledger = false; buildControls(); next(); }),
        chip('With ledger lines', cfg.ledger, () => { cfg.ledger = true; buildControls(); next(); }),
        chip('Natural notes', !cfg.accidentals, () => { cfg.accidentals = false; buildControls(); next(); }),
        chip('Add ♯ and ♭', cfg.accidentals, () => { cfg.accidentals = true; buildControls(); next(); })
      ])]));
    }
    if (cfg.mode === 'keysig') {
      controls.appendChild(el('div', { class: 'trainer-row' }, [el('span', { class: 'trainer-label' }, 'Level'), el('div', { class: 'select-grid' }, [
        chip('Up to 4 ♯/♭', cfg.maxAccidentals === 4, () => { cfg.maxAccidentals = 4; buildControls(); next(); }),
        chip('Up to 7 ♯/♭', cfg.maxAccidentals === 7, () => { cfg.maxAccidentals = 7; buildControls(); next(); })
      ])]));
    }
  }

  function updateScore() {
    scoreLine.textContent = stats.asked
      ? `Score: ${stats.correct} / ${stats.asked} · streak ${stats.streak} · best streak ${stats.best}`
      : 'Answer a few questions to start your score.';
  }

  function playSound(s) {
    if (!s) return;
    if (typeof soundOffNotice === 'function' && soundOffNotice()) return;
    if (s.kind === 'note') AudioLab.playNote(s.pitch, { duration: 1.1 });
    else if (s.kind === 'interval') AudioLab.playInterval(s.pitches[0], s.pitches[1], 'melodic');
    else if (s.kind === 'scale') { const names = spellScale(s.tonic, MAJOR_SCALE_STEPS); AudioLab.playScale(ascendingPitches(names, 4)); }
    else if (s.kind === 'rhythm') AudioLab.playRhythm(s.pattern, 90, 4);
  }

  function next() {
    answered = false;
    current = TrainerGen[cfg.mode](cfg);
    stage.innerHTML = '';
    stage.appendChild(el('h3', { class: 'trainer-prompt' }, current.prompt));
    stage.appendChild(el('div', { class: 'visual-host' }, [drawStaff(current.draw)]));
    const grid = el('div', { class: 'option-grid', role: 'group', 'aria-label': 'Answer choices' });
    const feedback = el('div', { class: 'trainer-feedback', role: 'status', 'aria-live': 'polite' });
    const actions = el('div', { class: 'trainer-actions' });
    current.options.forEach((opt, i) => {
      const b = el('button', { type: 'button', class: 'option-btn', 'data-opt': opt, onclick: () => choose(opt, b) }, `${i + 1}. ${opt}`);
      grid.appendChild(b);
    });
    if (current.sound) actions.appendChild(el('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: () => playSound(current.sound) }, '▶ Hear it'));
    const nextBtn = el('button', { type: 'button', class: 'btn btn-primary btn-sm trainer-next', onclick: next }, 'Next question →');
    nextBtn.style.display = 'none';
    actions.appendChild(nextBtn);
    stage.appendChild(grid); stage.appendChild(feedback); stage.appendChild(actions);

    function choose(opt, btn) {
      if (answered) return;
      answered = true;
      const ok = opt === current.answer;
      stats.asked++; if (ok) { stats.correct++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); } else stats.streak = 0;
      if (typeof STATE !== 'undefined' && STATE) {
        STATE.trainerStats = STATE.trainerStats || { asked: 0, correct: 0 };
        STATE.trainerStats.asked++; if (ok) STATE.trainerStats.correct++;
        if (typeof persist === 'function') persist();
      }
      Array.from(grid.children).forEach(c => {
        c.disabled = true;
        if (c.dataset.opt === current.answer) c.classList.add('correct');
        else if (c === btn) c.classList.add('wrong');
      });
      feedback.className = 'trainer-feedback ' + (ok ? 'ok' : 'bad');
      feedback.textContent = (ok ? '✅ Correct! ' : `❌ Not quite — the answer is ${current.answer}. `) + current.explain;
      nextBtn.style.display = '';
      nextBtn.focus();
      updateScore();
    }
  }

  // keyboard: 1–4 choose an answer, Enter for next
  root.addEventListener('keydown', ev => {
    if (ev.target && /input|textarea|select/i.test(ev.target.tagName)) return;
    const n = parseInt(ev.key, 10);
    if (n >= 1 && n <= 4 && !answered) { const b = stage.querySelectorAll('.option-btn')[n - 1]; if (b) b.click(); }
  });

  buildControls(); next(); updateScore();
  return root;
}

function renderNotationTrainer(root) {
  root.appendChild(el('button', { class: 'btn-link back-link', onclick: () => navigate('quiz') }, '← Back to quizzes'));
  root.appendChild(el('h1', { class: 'page-title' }, '🎼 Notation Trainer'));
  root.appendChild(el('p', { class: 'page-sub' }, 'Unlimited practice reading the stave in treble, bass and alto clef. Every answer comes with an explanation.'));
  root.appendChild(el('div', { class: 'panel-card' }, [buildNotationTrainer()]));
}
