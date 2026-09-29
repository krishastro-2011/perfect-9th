/* ============================================================
   GCSE Music Theory Quest — content-quiz-2.js
   Question bank: Chords, Elements, Texture, Melody, Form,
   Accompaniment, Transposition, Instruments, Vocabulary,
   Listening, Genre.
   ============================================================ */

const QUIZ_BANK_2 = [];

/* ---------------- CHORDS AND HARMONY ---------------- */
(() => {
  const t = 'chords';
  const chordDefs = [
    { notes: ['C4', 'E4', 'G4'], ans: 'Major triad', diff: 1 },
    { notes: ['C4', 'Eb4', 'G4'], ans: 'Minor triad', diff: 2 },
    { notes: ['C4', 'Eb4', 'Gb4'], ans: 'Diminished triad', diff: 3 },
    { notes: ['C4', 'E4', 'G#4'], ans: 'Augmented triad', diff: 4 },
    { notes: ['G4', 'B4', 'D5'], ans: 'Major triad', diff: 2 },
    { notes: ['A4', 'C5', 'E5'], ans: 'Minor triad', diff: 2 },
    { notes: ['D4', 'F#4', 'A4'], ans: 'Major triad', diff: 2 },
    { notes: ['E4', 'G4', 'B4'], ans: 'Minor triad', diff: 2 }
  ];
  const chordTypes = ['Major triad', 'Minor triad', 'Diminished triad', 'Augmented triad'];
  chordDefs.forEach((c, i) => {
    const distractors = shuffle(chordTypes.filter(x => x !== c.ans)).slice(0, 3);
    const { options, answerIndex } = mcq(c.ans, distractors);
    QUIZ_BANK_2.push({
      id: `chords-triad-${i}`, topic: t, type: 'chord', difficulty: c.diff, board: 'core',
      prompt: 'Identify this triad type.',
      visual: { kind: 'staff', clef: 'treble', chordNotes: c.notes },
      options, answerIndex,
      explanation: `Root, ${c.ans.includes('Minor') || c.ans.includes('Diminished') ? 'minor' : 'major'} 3rd, ${c.ans.includes('Augmented') ? 'augmented' : c.ans.includes('Diminished') ? 'diminished' : 'perfect'} 5th = ${/^[aeiou]/i.test(c.ans) ? 'an' : 'a'} ${c.ans.toLowerCase()}.`
    });
  });
  QUIZ_BANK_2.push(
    { id: 'chords-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'In root position, which note of the triad is lowest?',
      ...mcq('The root', ['The 3rd', 'The 5th', 'None — they\u2019re all equal']), explanation: 'Root position has the root of the chord as the lowest-sounding note.' },
    { id: 'chords-2', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'If the 3rd of a triad is the lowest note, the chord is in:',
      ...mcq('First inversion', ['Root position', 'Second inversion', 'Third inversion']), explanation: 'First inversion has the 3rd of the chord as the lowest note.' },
    { id: 'chords-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which Roman numeral represents the dominant chord in a major key?',
      ...mcq('V', ['I', 'IV', 'vi']), explanation: 'The dominant chord is built on the 5th scale degree, labelled V.' },
    { id: 'chords-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which chord pattern makes a perfect cadence?',
      ...mcq('V–I', ['IV–I', 'ii–V', 'V–vi']), explanation: 'A perfect cadence moves from the dominant (V) chord to the tonic (I) chord, sounding fully resolved.' },
    { id: 'chords-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A plagal cadence, sometimes called the "Amen" cadence, moves from:',
      ...mcq('IV to I', ['V to I', 'I to V', 'V to vi']), explanation: 'The plagal cadence is IV–I, a softer-sounding conclusion than the perfect cadence.' },
    { id: 'chords-6', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'An imperfect cadence typically:',
      ...mcq('Ends on the dominant (V), sounding unfinished', ['Ends on the tonic (I), sounding finished', 'Always uses a diminished chord', 'Only occurs at the very end of a piece']),
      explanation: 'An imperfect cadence ends on V, leaving the music sounding like it needs to continue — like a comma rather than a full stop.' },
    { id: 'chords-7', topic: t, type: 'mcq', difficulty: 4, board: 'core',
      prompt: 'An interrupted cadence moves from V to which chord, creating a "surprise"?',
      ...mcq('vi', ['I', 'IV', 'ii']), explanation: 'The interrupted cadence (V–vi) sets up an expected resolution to I, then "interrupts" it by moving to vi instead.' },
    { id: 'chords-8', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'A dominant seventh chord (V7) adds which extra note to the V triad?',
      ...mcq('A minor 7th above the root', ['A major 7th above the root', 'A perfect 4th above the root', 'An octave above the root']),
      explanation: 'A dominant 7th chord is a major triad plus a minor 7th above the root, adding extra pull back to the tonic.' },
    { id: 'chords-9', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Roman numeral chords written in lowercase (e.g. ii, vi) usually represent:',
      ...mcq('Minor chords', ['Major chords', 'Diminished chords only', 'Chords with no 3rd']), explanation: 'By convention, capital Roman numerals = major chords, lowercase = minor chords (vii° is marked separately as diminished).' },
    { id: 'chords-match-1', topic: t, type: 'match', difficulty: 3, board: 'core',
      prompt: 'Match each cadence to its chord pattern.',
      pairs: [
        { term: 'Perfect cadence', def: 'V – I' }, { term: 'Plagal cadence', def: 'IV – I' },
        { term: 'Imperfect cadence', def: 'Ends on V' }, { term: 'Interrupted cadence', def: 'V – vi' }
      ],
      explanation: 'Perfect = V–I, Plagal = IV–I, Imperfect = ends on V, Interrupted = V–vi.' }
  );
})();

/* ---------------- ELEMENTS: DYNAMICS/TEMPO/ARTICULATION ---------------- */
(() => {
  const t = 'elements';
  QUIZ_BANK_2.push(
    { id: 'elements-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'What does "forte" (f) mean?', ...mcq('Loud', ['Quiet', 'Fast', 'Slow']), explanation: 'Forte means loud.' },
    { id: 'elements-2', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'What does "pianissimo" (pp) mean?', ...mcq('Very quiet', ['Very loud', 'Moderately loud', 'Getting louder']), explanation: 'Pianissimo means very quiet — quieter than piano (p).' },
    { id: 'elements-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A crescendo means the music should:', ...mcq('Gradually get louder', ['Gradually get quieter', 'Suddenly get louder', 'Stay at the same volume']), explanation: 'Crescendo = gradually getting louder.' },
    { id: 'elements-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What does "subito" mean when attached to a dynamic, e.g. subito piano?', ...mcq('Suddenly', ['Gradually', 'Very', 'Slightly']), explanation: '"Subito" means "suddenly" — subito piano means suddenly quiet.' },
    { id: 'elements-5', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Which tempo marking means "at a walking pace"?', ...mcq('Andante', ['Presto', 'Largo', 'Allegro']), explanation: 'Andante literally means "at a walking pace" — a gently moving tempo.' },
    { id: 'elements-6', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Which of these tempo markings is the fastest?', ...mcq('Presto', ['Adagio', 'Andante', 'Largo']), explanation: 'Presto means very fast — the fastest of these four terms.' },
    { id: 'elements-7', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: '"Accelerando" instructs the performer to:', ...mcq('Gradually speed up', ['Gradually slow down', 'Play louder', 'Play staccato']), explanation: 'Accelerando means to gradually speed up.' },
    { id: 'elements-8', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: '"Rubato" describes:', ...mcq('A flexible, expressive bending of strict tempo', ['A strict, mechanical tempo', 'Playing exactly in time with a metronome', 'A type of cadence']), explanation: 'Rubato is expressive give-and-take with tempo, speeding up and slowing down for musical effect.' },
    { id: 'elements-9', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Staccato notes should be played:', ...mcq('Short and detached', ['Smooth and connected', 'Very loud', 'Very slow']), explanation: 'Staccato means short and detached, marked with a dot above or below the notehead.' },
    { id: 'elements-10', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Legato playing means notes are:', ...mcq('Smooth and connected', ['Short and detached', 'Heavily accented', 'Played very quietly']), explanation: 'Legato means smoothly connected, with no gaps between notes.' },
    { id: 'elements-11', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What is a tenuto marking asking for?', ...mcq('The note held for its full length, slightly stressed', ['The note cut very short', 'A gradual increase in speed', 'The note played an octave higher']), explanation: 'Tenuto asks the performer to hold the note for its full value, often with slight emphasis.' },
    { id: 'elements-12', topic: t, type: 'truefalse', difficulty: 2, board: 'core',
      prompt: 'True or false: tempo and rhythm mean the same thing.',
      ...mcq('False', ['True']), explanation: 'Tempo is the speed of the pulse; rhythm is the pattern of note lengths — quite different things.' }
  );
})();

/* ---------------- TEXTURE ---------------- */
(() => {
  const t = 'texture';
  QUIZ_BANK_2.push(
    { id: 'texture-1', topic: t, type: 'texture', difficulty: 1, board: 'core',
      prompt: 'A single unaccompanied singer, with no harmony or other parts, has which texture?',
      ...mcq('Monophonic', ['Homophonic', 'Polyphonic', 'Heterophonic']), explanation: 'A single line with nothing else happening is a monophonic texture.' },
    { id: 'texture-2', topic: t, type: 'texture', difficulty: 1, board: 'core',
      prompt: 'A pop song with a lead vocal over chords has which texture?',
      ...mcq('Homophonic', ['Monophonic', 'Polyphonic', 'Heterophonic']), explanation: 'Melody plus chordal accompaniment is a homophonic texture — the most common in pop music.' },
    { id: 'texture-3', topic: t, type: 'texture', difficulty: 2, board: 'core',
      prompt: 'A Bach fugue with several independent, equally important melodic lines has which texture?',
      ...mcq('Polyphonic', ['Homophonic', 'Monophonic', 'Unison']), explanation: 'Several independent melodic lines happening together is called polyphonic (or contrapuntal) texture.' },
    { id: 'texture-4', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'When several performers play the same basic melody with small individual variations at once, this is:',
      ...mcq('Heterophonic texture', ['Monophonic texture', 'Homophonic texture', 'Polyphonic texture']), explanation: 'Heterophonic texture is a shared melody performed with small simultaneous variations — common in some folk and non-Western traditions.' },
    { id: 'texture-5', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'When every performer sings or plays exactly the same notes at once, this is called:',
      ...mcq('Unison', ['Counterpoint', 'Imitation', 'Antiphony']), explanation: 'Unison is when all parts perform identical pitches simultaneously.' },
    { id: 'texture-6', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What is imitation?', ...mcq('One part copying a melodic idea shortly after another part played it', ['Two instruments playing completely different melodies', 'A single melody with no accompaniment', 'Playing exactly the same rhythm as another part but different pitches']),
      explanation: 'Imitation is when a melodic idea introduced by one part is copied by another part shortly afterwards, as in a round or canon.' },
    { id: 'texture-7', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'The technique of combining two or more independent melodic lines is called:',
      ...mcq('Counterpoint', ['Homophony', 'Unison', 'Drone']), explanation: 'Counterpoint is the art of combining independent melodic lines, producing polyphonic texture.' },
    { id: 'texture-8', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: '"Melody and accompaniment" is another way of describing which texture?',
      ...mcq('Homophonic', ['Monophonic', 'Polyphonic', 'Heterophonic']), explanation: 'Melody and accompaniment describes one clear tune supported by other parts — a homophonic texture.' }
  );
})();

/* ---------------- MELODY ---------------- */
(() => {
  const t = 'melody';
  QUIZ_BANK_2.push(
    { id: 'melody-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Melodic movement mostly by step (2nds) is described as:', ...mcq('Conjunct', ['Disjunct', 'Chromatic', 'Syncopated']), explanation: 'Conjunct melodic movement moves mostly by small steps.' },
    { id: 'melody-2', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Melodic movement mostly by leap is described as:', ...mcq('Disjunct', ['Conjunct', 'Diatonic', 'Legato']), explanation: 'Disjunct melodic movement moves mostly by larger intervals (leaps).' },
    { id: 'melody-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A short, distinctive musical idea that is developed and returns throughout a piece is called a:',
      ...mcq('Motif', ['Riff', 'Cadence', 'Coda']), explanation: 'A motif is a short recognisable idea (rhythmic and/or melodic) that recurs and develops through a piece.' },
    { id: 'melody-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A short repeated pattern common in rock/pop, usually staying the same each time, is a:',
      ...mcq('Riff', ['Motif', 'Sequence', 'Cadence']), explanation: 'A riff is a short repeated pattern in popular music, generally unchanged each time it returns.' },
    { id: 'melody-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A short pattern (rhythmic and/or melodic) repeated persistently underneath other material is a(n):',
      ...mcq('Ostinato', ['Sequence', 'Motif', 'Cadence']), explanation: 'An ostinato is a persistently repeated short pattern.' },
    { id: 'melody-6', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'When a short melodic idea is immediately repeated at a higher or lower pitch, this is called a:',
      ...mcq('Sequence', ['Ostinato', 'Riff', 'Ground bass']), explanation: 'A sequence repeats a melodic pattern at a new pitch level.' },
    { id: 'melody-7', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'When one phrase is answered by another, often between different performers, this is called:',
      ...mcq('Call and response', ['Ostinato', 'Modulation', 'Inversion']), explanation: 'Call and response is a "question and answer" structure between phrases or performers.' },
    { id: 'melody-8', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'The overall shape of a melody (rising, falling, arching) is called its:',
      ...mcq('Contour', ['Texture', 'Cadence', 'Metre']), explanation: 'Contour describes the overall melodic shape when pictured as a line.' }
  );
})();

/* ---------------- FORM AND STRUCTURE ---------------- */
(() => {
  const t = 'form';
  QUIZ_BANK_2.push(
    { id: 'form-1', topic: t, type: 'form', difficulty: 1, board: 'core',
      prompt: 'A piece with two contrasting sections, often each repeated, has which form?',
      pattern: ['A', 'B'],
      ...mcq('Binary (AB)', ['Ternary (ABA)', 'Rondo (ABACA)', 'Strophic']), explanation: 'Binary form has two contrasting sections, labelled AB.' },
    { id: 'form-2', topic: t, type: 'form', difficulty: 1, board: 'core',
      prompt: 'A piece that opens, contrasts, then returns to the opening material has which form?',
      pattern: ['A', 'B', 'A'],
      ...mcq('Ternary (ABA)', ['Binary (AB)', 'Rondo (ABACA)', 'Through-composed']), explanation: 'Ternary form is ABA — an opening section, contrast, then a return.' },
    { id: 'form-3', topic: t, type: 'form', difficulty: 2, board: 'core',
      prompt: 'A recurring main theme alternating with contrasting episodes describes which form?',
      pattern: ['A', 'B', 'A', 'C', 'A'],
      ...mcq('Rondo (ABACA)', ['Ternary (ABA)', 'Binary (AB)', 'Theme and variations']), explanation: 'Rondo form alternates a recurring theme (A) with contrasting episodes (B, C…).' },
    { id: 'form-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A hymn that repeats exactly the same music for every verse, with new words each time, uses which form?',
      ...mcq('Strophic', ['Through-composed', 'Rondo', 'Sonata form']), explanation: 'Strophic form repeats identical music for each verse.' },
    { id: 'form-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A piece that is continuously new throughout, with no large-scale repetition, is:',
      ...mcq('Through-composed', ['Strophic', 'Binary', 'Ternary']), explanation: 'Through-composed music has continuously new material rather than repeating sections.' },
    { id: 'form-6', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A theme is presented, then altered repeatedly in rhythm, key or texture while remaining recognisable — this is:',
      ...mcq('Theme and variations', ['Rondo', 'Strophic form', 'Sonata form']), explanation: 'Theme and variations states a theme, then presents a series of altered but recognisable versions of it.' },
    { id: 'form-7', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'Which structure typically forms the first movement of a Classical symphony, with an Exposition, Development and Recapitulation?',
      ...mcq('Sonata form', ['Rondo form', 'Strophic form', '12-bar blues']), explanation: 'Sonata form presents themes (Exposition), explores them (Development), then returns to them (Recapitulation).' },
    { id: 'form-8', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A repeating 12-bar chord pattern is the basis of:', ...mcq('12-bar blues', ['Sonata form', 'Rondo form', 'Minuet and trio']), explanation: 'The 12-bar blues uses a specific repeating 12-bar chord progression as its basic structure.' },
    { id: 'form-9', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'In a typical pop song, the contrasting section that usually appears once before the final chorus is called the:',
      ...mcq('Bridge (or middle 8)', ['Verse', 'Coda', 'Introduction']), explanation: 'The bridge/middle 8 provides contrast, usually appearing once, before the song returns to its final chorus.' },
    { id: 'form-10', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'A short bass-line pattern that repeats continuously while the melody above changes is called a:',
      ...mcq('Ground bass', ['Riff', 'Coda', 'Anacrusis']), explanation: 'A ground bass is a repeating bass pattern under changing melodic material, as in Pachelbel\u2019s Canon.' },
    { id: 'form-order-1', topic: t, type: 'order', difficulty: 4, board: 'core',
      prompt: 'Drag these sections of sonata form into the correct order.',
      items: ['Exposition', 'Development', 'Recapitulation'],
      explanation: 'Sonata form presents its themes (Exposition), explores/transforms them (Development), then restates them (Recapitulation).' }
  );
})();

/* ---------------- ACCOMPANIMENT TECHNIQUES ---------------- */
(() => {
  const t = 'accompaniment';
  QUIZ_BANK_2.push(
    { id: 'accomp-1', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A broken-chord accompaniment pattern (low-high-middle-high) common in Classical piano music is called:',
      ...mcq('Alberti bass', ['Walking bass', 'Ground bass', 'Drone']), explanation: 'Alberti bass is a specific broken-chord pattern very common in Classical-era keyboard music.' },
    { id: 'accomp-2', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A bass line that moves in continuous, mostly stepwise crotchets, common in jazz and blues, is called:',
      ...mcq('Walking bass', ['Alberti bass', 'Drone', 'Ostinato']), explanation: 'A walking bass "walks" stepwise from chord to chord in steady crotchets.' },
    { id: 'accomp-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'One or two notes sustained continuously underneath changing melodic material, typical of bagpipe music, is called a:',
      ...mcq('Drone', ['Riff', 'Sequence', 'Arpeggio']), explanation: 'A drone is a sustained note (or notes) held continuously beneath the melody.' },
    { id: 'accomp-4', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'The classical-harmony term for a sustained note (often tonic or dominant) held while the harmony above it changes is:',
      ...mcq('Pedal note (pedal point)', ['Drone', 'Riff', 'Ground bass']), explanation: 'A pedal note (or pedal point) is the classical harmony term for this technique, closely related to a drone.' },
    { id: 'accomp-5', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Playing the notes of a chord one after another in strict order is called playing:',
      ...mcq('An arpeggio', ['A drone', 'A cadence', 'A cluster chord']), explanation: 'An arpeggio plays the notes of a chord individually in order, rather than together.' },
    { id: 'accomp-6', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Simple block chords played directly underneath a melody are an example of:',
      ...mcq('Chordal accompaniment', ['Ground bass', 'Heterophony', 'Imitation']), explanation: 'Chordal accompaniment is the simplest and most direct style — block chords under the tune.' }
  );
})();

/* ---------------- TRANSPOSITION ---------------- */
(() => {
  const t = 'transposition';
  QUIZ_BANK_2.push(
    { id: 'transp-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'What does transposition mean?', ...mcq('Moving music to a different pitch/key while keeping the same pattern of intervals', ['Changing the time signature', 'Changing the dynamics', 'Adding extra harmony notes']),
      explanation: 'Transposition shifts every note by the same interval, keeping the tune identical relative to itself.' },
    { id: 'transp-2', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What is the difference between written pitch and sounding pitch?', ...mcq('For transposing instruments, what\u2019s written differs from what actually sounds', ['They are always exactly the same thing', 'Written pitch only applies to percussion', 'Sounding pitch only applies to singers']),
      explanation: 'Transposing instruments (like the B♭ clarinet) read one pitch but actually sound a different one.' },
    { id: 'transp-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A B♭ clarinet sounds lower than written by which interval (approximately)?', ...mcq('A major 2nd', ['A perfect 5th', 'An octave', 'A minor 3rd']), explanation: 'A B♭ clarinet sounds a major 2nd lower than the pitch that is written on the page.' },
    { id: 'transp-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'One common reason composers transpose a melody is to:', ...mcq('Fit it into a singer\u2019s comfortable vocal range', ['Make the rhythm more complicated', 'Remove the need for a key signature entirely', 'Change the instrument\u2019s timbre']),
      explanation: 'Melodies are often transposed to suit a particular singer\u2019s or instrument\u2019s comfortable range.' },
    { id: 'transp-5', topic: t, type: 'truefalse', difficulty: 2, board: 'core',
      prompt: 'True or false: when you transpose a melody, the pattern of tones and semitones between the notes stays the same.',
      ...mcq('True', ['False']), explanation: 'Correct transposition preserves the exact interval pattern, so the tune sounds identical, just higher or lower.' },
    { id: 'transp-6', topic: t, type: 'mcq', difficulty: 3, board: 'core',
      prompt: 'Why might a composer need to change the key signature when transposing?', ...mcq('To keep the same pattern of tones and semitones in the new key', ['Key signatures are never needed after transposing', 'To make the piece louder', 'To change the time signature automatically']),
      explanation: 'A new key signature is usually needed so the transposed melody keeps exactly the same tone/semitone pattern in its new key.' }
  );
})();

/* ---------------- INSTRUMENTS AND VOICES ---------------- */
(() => {
  const t = 'instruments';
  const famQ = [
    { name: 'Violin', fam: 'Strings' }, { name: 'Oboe', fam: 'Woodwind' }, { name: 'Trombone', fam: 'Brass' },
    { name: 'Timpani', fam: 'Percussion' }, { name: 'Cello', fam: 'Strings' }, { name: 'Clarinet', fam: 'Woodwind' },
    { name: 'French horn', fam: 'Brass' }, { name: 'Xylophone', fam: 'Percussion' }
  ];
  const families = ['Strings', 'Woodwind', 'Brass', 'Percussion'];
  famQ.forEach((f, i) => {
    const distractors = shuffle(families.filter(x => x !== f.fam)).slice(0, 3);
    const { options, answerIndex } = mcq(f.fam, distractors);
    QUIZ_BANK_2.push({
      id: `instr-fam-${i}`, topic: t, type: 'instrument', difficulty: 1, board: 'core',
      prompt: `Which orchestral family does the ${f.name} belong to?`,
      options, answerIndex,
      explanation: `The ${f.name} is a member of the ${f.fam.toLowerCase()} family.`
    });
  });
  QUIZ_BANK_2.push(
    { id: 'instr-1', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Which voice type is the lowest male voice?', ...mcq('Bass', ['Tenor', 'Alto', 'Soprano']), explanation: 'Bass is the lowest standard voice type.' },
    { id: 'instr-2', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Which voice type is the highest female voice?', ...mcq('Soprano', ['Alto', 'Tenor', 'Bass']), explanation: 'Soprano is the highest standard voice type.' },
    { id: 'instr-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'What does SATB stand for?', ...mcq('Soprano, Alto, Tenor, Bass', ['Solo, Accompaniment, Trio, Band', 'Strings, Accordion, Trumpet, Bassoon', 'Simple, Accented, Triple, Binary']), explanation: 'SATB is the standard four-part vocal layout: Soprano, Alto, Tenor, Bass.' },
    { id: 'instr-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Singing many notes across a single syllable of text is called:', ...mcq('Melisma', ['Syllabic singing', 'Falsetto', 'A cappella']), explanation: 'Melisma stretches one syllable of text across several different pitches.' },
    { id: 'instr-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Singing with one note per syllable of text is called:', ...mcq('Syllabic', ['Melismatic', 'Falsetto', 'A cappella']), explanation: 'Syllabic singing gives each syllable exactly one note — the opposite of melisma.' },
    { id: 'instr-6', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Singing with absolutely no instrumental accompaniment is called:', ...mcq('A cappella', ['Melismatic', 'Syllabic', 'Falsetto']), explanation: 'A cappella means unaccompanied singing.' },
    { id: 'instr-7', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A male singer using falsetto is:', ...mcq('Reaching notes above their normal vocal range', ['Singing extremely quietly', 'Singing with no vibrato', 'Using electronic pitch correction']), explanation: 'Falsetto is a vocal technique letting male singers reach pitches above their usual range.' }
  );
})();

/* ---------------- VOCABULARY ---------------- */
(() => {
  const t = 'vocabulary';
  const terms = [
    { term: 'Dolce', def: 'Sweetly' }, { term: 'Cantabile', def: 'In a singing style' },
    { term: 'Maestoso', def: 'Majestically' }, { term: 'Con brio', def: 'With vigour/spirit' },
    { term: 'Espressivo', def: 'Expressively' }, { term: 'Con moto', def: 'With movement' },
    { term: 'Sempre', def: 'Always/continuing' }, { term: 'Solo', def: 'Played/sung by one performer alone' }
  ];
  const allDefs = terms.map(t2 => t2.def);
  terms.forEach((tm, i) => {
    const distractors = shuffle(allDefs.filter(d => d !== tm.def)).slice(0, 3);
    const { options, answerIndex } = mcq(tm.def, distractors);
    QUIZ_BANK_2.push({
      id: `vocab-${i}`, topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: `What does "${tm.term}" mean?`, options, answerIndex,
      explanation: `"${tm.term}" means "${tm.def}".`
    });
  });
  QUIZ_BANK_2.push({
    id: 'vocab-tutti', topic: t, type: 'mcq', difficulty: 2, board: 'core',
    prompt: 'What does "tutti" mean?', ...mcq('All performers playing together', ['One performer playing alone', 'Getting gradually louder', 'Getting gradually quieter']),
    explanation: '"Tutti" is Italian for "all" — every performer plays together.'
  });
  QUIZ_BANK_2.push({
    id: 'vocab-match-1', topic: t, type: 'match', difficulty: 2, board: 'core',
    prompt: 'Match each Italian term to its meaning.',
    pairs: [
      { term: 'Con brio', def: 'With vigour/spirit' }, { term: 'Espressivo', def: 'Expressively' },
      { term: 'Poco a poco', def: 'Little by little' }, { term: 'Maestoso', def: 'Majestically' }
    ],
    explanation: 'Con brio = with vigour, Espressivo = expressively, Poco a poco = little by little, Maestoso = majestically.'
  });
})();

/* ---------------- LISTENING AND AURAL SKILLS ---------------- */
(() => {
  const t = 'listening';
  QUIZ_BANK_2.push(
    { id: 'listen-1', topic: t, type: 'audio', difficulty: 2, board: 'core',
      prompt: 'Listen to the triad. Is it major or minor?', visual: { kind: 'audio', action: 'chord', notes: ['C4', 'E4', 'G4'] },
      ...mcq('Major', ['Minor']), explanation: 'This triad uses a major 3rd (C to E) above the root — a major triad, which tends to sound bright.' },
    { id: 'listen-2', topic: t, type: 'audio', difficulty: 2, board: 'core',
      prompt: 'Listen to the triad. Is it major or minor?', visual: { kind: 'audio', action: 'chord', notes: ['C4', 'Eb4', 'G4'] },
      ...mcq('Minor', ['Major']), explanation: 'This triad uses a minor 3rd (C to E♭) above the root — a minor triad, which tends to sound darker.' },
    { id: 'listen-3', topic: t, type: 'audio', difficulty: 3, board: 'core',
      prompt: 'Listen to the two notes played one after another. Which interval is this?', visual: { kind: 'audio', action: 'interval', notes: ['C4', 'G4'] },
      ...mcq('Perfect 5th', ['Major 3rd', 'Minor 3rd', 'Octave']), explanation: 'C to G spans 7 semitones — a perfect 5th, a very open, stable-sounding interval.' },
    { id: 'listen-4', topic: t, type: 'audio', difficulty: 3, board: 'core',
      prompt: 'Listen to the two notes played one after another. Which interval is this?', visual: { kind: 'audio', action: 'interval', notes: ['C4', 'C5'] },
      ...mcq('Octave', ['Perfect 5th', 'Major 6th', 'Perfect 4th']), explanation: 'C4 to C5 is 12 semitones — the same letter name an octave apart.' },
    { id: 'listen-5', topic: t, type: 'audio', difficulty: 3, board: 'core',
      prompt: 'Listen to the scale played ascending. Is it major or (natural) minor?', visual: { kind: 'audio', action: 'scale', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
      ...mcq('Major', ['Minor']), explanation: 'This uses the pattern T-T-S-T-T-T-S — a major scale, sounding bright.' },
    { id: 'listen-6', topic: t, type: 'audio', difficulty: 3, board: 'core',
      prompt: 'Listen to the scale played ascending. Is it major or (natural) minor?', visual: { kind: 'audio', action: 'scale', notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
      ...mcq('Minor', ['Major']), explanation: 'This uses the pattern T-S-T-T-S-T-T — a natural minor scale, sounding darker.' },
    { id: 'listen-7', topic: t, type: 'audio', difficulty: 4, board: 'core',
      prompt: 'Listen to the cadence. Does it sound finished (perfect) or unfinished (imperfect)?', visual: { kind: 'audio', action: 'cadence', chords: [['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']] },
      ...mcq('Finished (perfect cadence, V–I)', ['Unfinished (imperfect cadence)']), explanation: 'This progression moves from V to I, which sounds fully resolved — a perfect cadence.' },
    { id: 'listen-8', topic: t, type: 'audio', difficulty: 4, board: 'core',
      prompt: 'Listen to the cadence. Does it sound finished (perfect) or unfinished, ending on the dominant (imperfect)?', visual: { kind: 'audio', action: 'cadence', chords: [['C4', 'E4', 'G4'], ['G4', 'B4', 'D5']] },
      ...mcq('Unfinished (imperfect cadence)', ['Finished (perfect cadence, V–I)']), explanation: 'This progression ends on V (the dominant), leaving the phrase sounding unresolved — an imperfect cadence.' },
    { id: 'listen-9', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'In a listening exam, hearing several independent melodic lines of equal importance suggests which texture?',
      ...mcq('Polyphonic', ['Monophonic', 'Homophonic', 'Unison']), explanation: 'Several independent, equally important lines = polyphonic texture.' },
    { id: 'listen-10', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which listening clue most strongly suggests a piece is in a minor key?',
      ...mcq('A generally darker, sadder mood created by minor 3rds', ['A very fast tempo', 'Lots of staccato articulation', 'A large orchestra']), explanation: 'The character of minor 3rds within the harmony is the strongest clue to a minor key, though tempo/mood can support the impression.' }
  );
})();

/* ---------------- GENRE AND STYLE ---------------- */
(() => {
  const t = 'genre';
  QUIZ_BANK_2.push(
    { id: 'genre-1', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Abrupt shifts between loud and soft sections, rather than gradual crescendos, are typical of which period?',
      ...mcq('Baroque', ['Romantic', 'Popular music', '20th-century minimalism']), explanation: 'Baroque music often uses "terraced dynamics" — sudden shifts rather than gradual changes.' },
    { id: 'genre-2', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which period is most associated with balanced phrases, clear structure and sonata form?',
      ...mcq('Classical', ['Baroque', 'Romantic', 'Jazz']), explanation: 'The Classical period (c.1750–1820) favoured clarity, balance and structures such as sonata form.' },
    { id: 'genre-3', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which period is most associated with expressive rubato, large orchestras and programme music?',
      ...mcq('Romantic', ['Baroque', 'Classical', 'Medieval']), explanation: 'The Romantic period (c.1820–1900) embraced expressive freedom, bigger ensembles and storytelling ("programme") music.' },
    { id: 'genre-4', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'A recurring theme representing a character or idea in film music is called a:',
      ...mcq('Leitmotif', ['Riff', 'Ground bass', 'Cadence']), explanation: 'A leitmotif is a recurring musical idea associated with a specific character, place or idea, especially in film/opera.' },
    { id: 'genre-5', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which genre is defined by a 12-bar chord structure and "blue notes" (flattened 3rd, 5th or 7th)?',
      ...mcq('Blues', ['Baroque', 'Minuet', 'Rondo']), explanation: 'Blues music is built around the 12-bar blues structure and characteristic blue notes.' },
    { id: 'genre-6', topic: t, type: 'mcq', difficulty: 2, board: 'core',
      prompt: 'Which genre is most associated with improvisation, swung rhythms and walking bass?',
      ...mcq('Jazz', ['Baroque', 'Minuet and trio', 'Strophic hymn']), explanation: 'Improvisation, swing rhythm and walking bass lines are hallmarks of jazz.' },
    { id: 'genre-7', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Blending musical traditions from different cultures or genres together is called:',
      ...mcq('Fusion', ['Sonata form', 'Strophic form', 'Terraced dynamics']), explanation: 'Fusion combines elements from different musical traditions or genres.' },
    { id: 'genre-8', topic: t, type: 'mcq', difficulty: 1, board: 'core',
      prompt: 'Music written specifically to support the action and emotion of an on-screen story is:',
      ...mcq('Film/game music', ['Strophic hymn music', 'Baroque dance music', 'A cappella choral music']), explanation: 'Film and game music is composed to support and enhance visual storytelling.' }
  );
})();

if (typeof window !== 'undefined') window.QUIZ_BANK_2 = QUIZ_BANK_2;
