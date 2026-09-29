/* ============================================================
   GCSE Music Theory Quest — content-quiz-1.js
   Question bank: Notation, Rhythm, Scales/Keys, Intervals.
   Combined with content-quiz-2.js into QUIZ_BANK (see app.js).
   ============================================================ */

function mcq(correct, distractors) {
  const options = shuffle([correct, ...distractors]);
  return { options, answerIndex: options.indexOf(correct) };
}

const QUIZ_BANK_1 = [];

/* ---------------- NOTATION ---------------- */
(() => {
  const t = 'notation';
  const items = [
    { pitch: 'E4', name: 'E', clef: 'treble', diff: 1, hint: 'bottom line of the treble stave' },
    { pitch: 'G4', name: 'G', clef: 'treble', diff: 1, hint: 'second line of the treble stave' },
    { pitch: 'B4', name: 'B', clef: 'treble', diff: 1, hint: 'middle line of the treble stave' },
    { pitch: 'F5', name: 'F', clef: 'treble', diff: 2, hint: 'top line of the treble stave' },
    { pitch: 'C4', name: 'C', clef: 'treble', diff: 3, hint: 'middle C — one ledger line below the treble stave' },
    { pitch: 'G2', name: 'G', clef: 'bass', diff: 1, hint: 'bottom line of the bass stave' },
    { pitch: 'D3', name: 'D', clef: 'bass', diff: 1, hint: 'middle line of the bass stave' },
    { pitch: 'A3', name: 'A', clef: 'bass', diff: 2, hint: 'top line of the bass stave' },
    { pitch: 'C4', name: 'C', clef: 'bass', diff: 3, hint: 'middle C — one ledger line above the bass stave' }
  ];
  items.forEach((it, i) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const distractors = shuffle(letters.filter(l => l !== it.name)).slice(0, 3);
    const { options, answerIndex } = mcq(it.name, distractors);
    QUIZ_BANK_1.push({
      id: `notation-note-${i}`, topic: t, type: 'notation', difficulty: it.diff, board: 'core',
      prompt: 'Look at the note on the staff. Which letter name is shown?',
      visual: { kind: 'staff', clef: it.clef, notes: [it.pitch] },
      options, answerIndex,
      explanation: `This note is ${it.name}${it.pitch === 'C4' ? ' (middle C)' : ''} — it sits on the ${describePosition(it.pitch, it.clef)} of the ${it.clef} clef stave.`
    });
  });

  QUIZ_BANK_1.push(
    { id: 'notation-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Which symbol raises a note by a semitone?',
      ...mcq('Sharp (♯)', ['Flat (♭)', 'Natural (♮)', 'Tie']),
      explanation: 'A sharp raises a note by a semitone. A flat lowers it; a natural cancels a previous sharp/flat.' },
    { id: 'notation-2', topic: t, type: 'truefalse', difficulty: 1, board: 'core',
      prompt: 'True or false: F♯ and G♭ can be enharmonic equivalents — the same pitch with a different name.',
      ...mcq('True', ['False']), explanation: 'F♯ and G♭ sound identical on a piano; which name is used depends on the musical context.' },
    { id: 'notation-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'How many semitones are in a tone?',
      ...mcq('2', ['1', '3', '4']), explanation: 'A tone is made up of two semitones.' },
    { id: 'notation-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A crotchet is worth how many beats in 4/4 time?',
      ...mcq('1', ['2', '½', '4']), explanation: 'A crotchet (quarter note) is worth 1 beat in simple time such as 4/4.' },
    { id: 'notation-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A dotted crotchet lasts for how many beats?',
      ...mcq('1½', ['2', '1', '¾']), explanation: 'A dot adds half the note\u2019s value again: 1 + ½ = 1½ beats.' },
    { id: 'notation-6', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'What is the difference between a tie and a slur?',
      ...mcq('A tie joins the same pitch; a slur joins different pitches', ['A tie joins different pitches; a slur joins the same pitch', 'They mean exactly the same thing', 'A tie is only used in bass clef']),
      explanation: 'A tie joins two notes of the same pitch into one longer note. A slur asks for smooth playing across notes of different pitches.' },
    { id: 'notation-7', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'Which note value is a semiquaver worth in 4/4 time?',
      ...mcq('¼ beat', ['½ beat', '1 beat', '2 beats']), explanation: 'A semiquaver is worth a quarter of a beat — four semiquavers fit into one crotchet beat.' },
    { id: 'notation-8', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Why are ledger lines used?',
      ...mcq('To notate pitches too high or low to fit on the stave', ['To show dynamics', 'To show tempo changes', 'To join tied notes']),
      explanation: 'Ledger lines extend the stave upward or downward so very high or low notes can still be placed accurately.' },
    { id: 'notation-9', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Which clef is normally used for a cello part?',
      ...mcq('Bass clef', ['Treble clef', 'Neither — cellos read from a chart', 'Only ledger lines, no clef']),
      explanation: 'The cello is a lower-pitched instrument, so its music is usually written in the bass clef (higher passages may briefly switch to tenor or treble clef).' }
  );
})();

/* ---------------- RHYTHM ---------------- */
(() => {
  const t = 'rhythm';
  QUIZ_BANK_1.push(
    { id: 'rhythm-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'In 3/4 time, how many crotchet beats are in each bar?',
      ...mcq('3', ['2', '4', '6']), explanation: 'The top number of a time signature tells you the number of beats per bar — here, 3.' },
    { id: 'rhythm-2', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which of these is a compound time signature?',
      ...mcq('6/8', ['4/4', '3/4', '2/4']), explanation: '6/8 is compound duple — 2 main beats, each dividing into 3 (as dotted crotchets).' },
    { id: 'rhythm-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'In simple time, each beat divides naturally into:',
      ...mcq('2', ['3', '4', '5']), explanation: 'Simple time signatures (2/4, 3/4, 4/4) divide each beat into two equal parts.' },
    { id: 'rhythm-4', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'What is syncopation?',
      ...mcq('Accenting a note where it isn\u2019t normally expected, e.g. an off-beat', ['Playing exactly on every strong beat', 'A type of key signature', 'Slowing the tempo down gradually']),
      explanation: 'Syncopation deliberately stresses weak beats or off-beats, creating a "pushed" or surprising rhythmic feel.' },
    { id: 'rhythm-5', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'What is an anacrusis?',
      ...mcq('One or more notes before the first full bar of a piece', ['A rest at the end of a piece', 'A type of cadence', 'A repeated bass pattern']),
      explanation: 'An anacrusis (or "pick-up") is a note or notes that begin a phrase before the first complete bar.' },
    { id: 'rhythm-6', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A triplet fits three notes into the time normally taken by:',
      ...mcq('Two notes', ['Four notes', 'One note', 'Five notes']), explanation: 'A triplet squeezes three equal notes into the space usually occupied by two of the same value.' },
    { id: 'rhythm-7', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'How many quaver beats fit into one bar of 4/4?',
      ...mcq('8', ['4', '6', '16']), explanation: 'Four crotchet beats, each worth two quavers, gives 8 quavers per bar.' },
    { id: 'rhythm-8', topic: t, type: 'mcq', difficulty: 4, board: 'core',
      prompt: 'In 9/8 time, how many main (dotted crotchet) beats are felt per bar?',
      ...mcq('3', ['2', '4', '9']), explanation: '9/8 is compound triple: 9 quavers group into 3 sets of 3, felt as 3 dotted-crotchet beats.' },
    { id: 'rhythm-9', topic: t, type: 'truefalse', difficulty: 2, board: 'core',
      prompt: 'True or false: pulse and rhythm always mean exactly the same thing.',
      ...mcq('False', ['True']), explanation: 'Pulse is the steady underlying beat; rhythm is the pattern of note lengths played over it — they can be quite different.' },
    { id: 'rhythm-10', topic: t, type: 'order', difficulty: 3, board: 'core',
      prompt: 'Drag these note values into order from LONGEST to SHORTEST.',
      items: ['Semibreve', 'Minim', 'Crotchet', 'Quaver'],
      explanation: 'From longest to shortest: semibreve (4 beats) → minim (2 beats) → crotchet (1 beat) → quaver (½ beat).' }
  );
})();

/* ---------------- SCALES AND KEYS ---------------- */
(() => {
  const t = 'scales';
  QUIZ_BANK_1.push(
    { id: 'scales-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'What is the tone/semitone pattern of a major scale?',
      ...mcq('T-T-S-T-T-T-S', ['T-S-T-T-S-T-T', 'S-T-T-S-T-T-T', 'T-T-T-T-T-T-T']),
      explanation: 'Major scales always follow the pattern Tone-Tone-Semitone-Tone-Tone-Tone-Semitone.' },
    { id: 'scales-2', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'How many sharps are in the key signature of D major?',
      ...mcq('2', ['1', '3', '0']), explanation: 'D major has 2 sharps: F♯ and C♯.' },
    { id: 'scales-3', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'How many flats are in the key signature of F major?',
      ...mcq('1', ['0', '2', '3']), explanation: 'F major has 1 flat: B♭.' },
    { id: 'scales-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What is the relative minor of C major?',
      ...mcq('A minor', ['E minor', 'G minor', 'F minor']), explanation: 'The relative minor starts on the 6th degree of the major scale — the 6th degree of C major is A.' },
    { id: 'scales-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which minor scale is the natural minor with ONLY its 7th degree raised by a semitone?',
      ...mcq('Harmonic minor', ['Natural minor', 'Melodic minor (ascending)', 'Minor pentatonic']),
      explanation: 'Harmonic minor raises just the 7th degree, giving a leading note and a tone-and-a-half gap between the 6th and 7th. Melodic minor (ascending) raises both the 6th and the 7th.' },
    { id: 'scales-6', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'The chromatic scale is made up entirely of:',
      ...mcq('Semitones', ['Tones', 'Perfect 4ths', 'A mix of tones and semitones']), explanation: 'The chromatic scale moves in semitone steps only, using all 12 pitches within an octave.' },
    { id: 'scales-7', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What is the name for the 5th degree of a major scale?',
      ...mcq('Dominant', ['Subdominant', 'Mediant', 'Supertonic']), explanation: 'The 5th degree of any scale is called the dominant.' },
    { id: 'scales-8', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What is the name for the 7th degree of a major scale?',
      ...mcq('Leading note', ['Submediant', 'Subdominant', 'Tonic']), explanation: 'The 7th degree is the leading note — it strongly "leads" back to the tonic.' },
    { id: 'scales-9', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'On the circle of fifths, moving one step clockwise from C major takes you to:',
      ...mcq('G major (1 sharp)', ['F major (1 flat)', 'D major (2 sharps)', 'A minor (0 sharps/flats)']),
      explanation: 'Moving clockwise around the circle of fifths adds one sharp each time; the first clockwise step from C is G major.' },
    { id: 'scales-10', topic: t, type: 'mcq', difficulty: 4, board: 'core',
      prompt: 'What is modulation?',
      ...mcq('A change of key within a piece of music', ['A change of time signature', 'A change of instrument', 'A type of cadence']),
      explanation: 'Modulation is when a piece moves from one key to another, often to a closely related key such as the dominant or relative minor.' },
    { id: 'scales-11', topic: t, type: 'truefalse', difficulty: 2, board: 'core',
      prompt: 'True or false: a major key and its relative minor share the same key signature.',
      ...mcq('True', ['False']), explanation: 'Relative major/minor pairs always share an identical key signature — e.g. C major and A minor share no sharps or flats.' },
    { id: 'scales-order-1', topic: t, type: 'order', difficulty: 3, board: 'core',
      prompt: 'Drag the sharps into the correct order in which they are added to key signatures.',
      items: ['F', 'C', 'G', 'D', 'A', 'E', 'B'],
      explanation: 'The order of sharps is F–C–G–D–A–E–B (each one a 5th above the last) — remembered by "Father Charles Goes Down And Ends Battle".' },
    { id: 'scales-match-1', topic: t, type: 'match', difficulty: 2, board: 'core',
      prompt: 'Match each scale degree number to its correct name.',
      pairs: [
        { term: '1st degree', def: 'Tonic' }, { term: '4th degree', def: 'Subdominant' },
        { term: '5th degree', def: 'Dominant' }, { term: '7th degree', def: 'Leading note' }
      ],
      explanation: 'Degree names: 1 Tonic, 2 Supertonic, 3 Mediant, 4 Subdominant, 5 Dominant, 6 Submediant, 7 Leading note.' },
    { id: 'scales-12', topic: t, type: 'mcq', difficulty: 4, board: 'core',
      prompt: 'Traditionally, how does the melodic minor scale behave?',
      ...mcq('6th and 7th degrees raised ascending, natural minor descending', ['Identical ascending and descending', 'Always uses a raised 7th in both directions', 'It has no 6th degree at all']),
      explanation: 'The melodic minor raises the 6th and 7th degrees on the way up, then typically reverts to the natural minor coming back down.' }
  );
})();

/* ---------------- INTERVALS ---------------- */
(() => {
  const t = 'intervals';
  const ALL_NAMES = ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Augmented 4th', 'Diminished 5th', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'];
  const pairs = [
    { p1: 'C4', p2: 'C4', ans: 'Unison', diff: 1, note: '0 semitones apart — the same pitch.' },
    { p1: 'E4', p2: 'F4', ans: 'Minor 2nd', diff: 2, note: 'E to F is a natural semitone (1 semitone) — a minor 2nd.' },
    { p1: 'C4', p2: 'D4', ans: 'Major 2nd', diff: 1, note: 'C to D is a whole tone (2 semitones) — a major 2nd.' },
    { p1: 'A4', p2: 'C5', ans: 'Minor 3rd', diff: 2, note: '3 letter names (A,B,C), 3 semitones — a minor 3rd.' },
    { p1: 'C4', p2: 'E4', ans: 'Major 3rd', diff: 1, note: '3 letter names (C,D,E), 4 semitones — a major 3rd.' },
    { p1: 'C4', p2: 'F4', ans: 'Perfect 4th', diff: 1, note: '4 letter names, 5 semitones — a perfect 4th.' },
    { p1: 'F4', p2: 'B4', ans: 'Augmented 4th', diff: 4, note: '4 letter names (F,G,A,B), 6 semitones — one semitone bigger than perfect, so augmented.' },
    { p1: 'B4', p2: 'F5', ans: 'Diminished 5th', diff: 4, note: '5 letter names (B,C,D,E,F), 6 semitones — one semitone smaller than perfect, so diminished.' },
    { p1: 'C4', p2: 'G4', ans: 'Perfect 5th', diff: 1, note: '5 letter names, 7 semitones — a perfect 5th.' },
    { p1: 'E4', p2: 'C5', ans: 'Minor 6th', diff: 3, note: '6 letter names (E,F,G,A,B,C), 8 semitones — a minor 6th.' },
    { p1: 'C4', p2: 'A4', ans: 'Major 6th', diff: 2, note: '6 letter names, 9 semitones — a major 6th.' },
    { p1: 'D4', p2: 'C5', ans: 'Minor 7th', diff: 3, note: '7 letter names (D,E,F,G,A,B,C), 10 semitones — a minor 7th.' },
    { p1: 'C4', p2: 'B4', ans: 'Major 7th', diff: 3, note: '7 letter names, 11 semitones — a major 7th.' },
    { p1: 'C4', p2: 'C5', ans: 'Octave', diff: 1, note: '12 semitones apart — the same letter name, one octave higher.' },
    { p1: 'D4', p2: 'F4', ans: 'Minor 3rd', diff: 2, note: '3 letter names (D,E,F), 3 semitones — a minor 3rd.' },
    { p1: 'G4', p2: 'B4', ans: 'Major 3rd', diff: 2, note: '3 letter names (G,A,B), 4 semitones — a major 3rd.' },
    { p1: 'D4', p2: 'A4', ans: 'Perfect 5th', diff: 3, note: '5 letter names, 7 semitones — a perfect 5th.' },
    { p1: 'C4', p2: 'Db4', ans: 'Minor 2nd', diff: 3, note: '2 letter names (C, D) and 1 semitone — a minor 2nd.' }
  ];
  pairs.forEach((pr, i) => {
    // never offer the enharmonic twin (Augmented 4th / Diminished 5th sound the same) as a wrong answer
    const TWIN = { 'Augmented 4th': 'Diminished 5th', 'Diminished 5th': 'Augmented 4th' };
    const pool = ALL_NAMES.filter(n => n !== pr.ans && n !== TWIN[pr.ans]);
    const sameNumber = pool.filter(n => n.split(' ')[1] === pr.ans.split(' ')[1]);
    const rest = shuffle(pool.filter(n => !sameNumber.includes(n)));
    const distractors = [...shuffle(sameNumber).slice(0, 1), ...rest].slice(0, 3);
    const { options, answerIndex } = mcq(pr.ans, distractors);
    QUIZ_BANK_1.push({
      id: `intervals-${i}`, topic: t, type: 'interval', difficulty: pr.diff, board: 'core',
      prompt: `What interval is ${prettyName(pr.p1.replace(/\d/, ''))} → ${prettyName(pr.p2.replace(/\d/, ''))}?`,
      visual: { kind: 'staff', clef: 'treble', notes: [pr.p1, pr.p2] },
      options, answerIndex,
      explanation: pr.note
    });
  });
  QUIZ_BANK_1.push({
    id: 'intervals-extra-1', topic: t, type: 'mcq', difficulty: 2, board: 'core',
    prompt: 'Which family of intervals includes unisons, 4ths, 5ths and octaves?',
    ...mcq('Perfect', ['Major', 'Minor', 'Augmented']),
    explanation: 'Unisons, 4ths, 5ths and octaves are called perfect intervals — they don\u2019t have major/minor versions.'
  });
})();

if (typeof window !== 'undefined') window.QUIZ_BANK_1 = QUIZ_BANK_1;
