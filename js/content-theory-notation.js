/* ============================================================
   GCSE Music Theory Quest - Batch 2 theory and notation content
   Original teaching notes and tagged practice data. This file
   extends, rather than replaces, the original content collections.
   ============================================================ */

const THEORY_EXTENSIONS = {
  notation: {
    learn: `
      <h4>Reading every clef</h4>
      <p>Learn a clef by anchoring one reliable reference point, then count letter names in order. In treble clef the bottom line is E4; in bass clef it is G2; in alto clef the <strong>middle line is C4</strong> and the bottom line is F3. Alto clef is common for viola and keeps its middle register within the stave.</p>
      <div class="compare-pair">
        <div class="compare-box"><strong>Treble</strong><p>Lines: E-G-B-D-F. Spaces: F-A-C-E.</p></div>
        <div class="compare-box"><strong>Bass</strong><p>Lines: G-B-D-F-A. Spaces: A-C-E-G.</p></div>
        <div class="compare-box"><strong>Alto</strong><p>Middle line is C4. Count outward from that C rather than borrowing treble or bass note names.</p></div>
      </div>
      <h4>Accidentals, signatures and notation rules</h4>
      <p>An accidental changes a pitch at the point where it appears. In conventional notation it normally applies for the rest of that bar to the same letter and octave, unless cancelled. A key signature applies throughout the piece until a new signature appears. Do not confuse a key signature with a single accidental written beside a note.</p>
      <p>When reading a key signature, use the order of sharps <strong>F C G D A E B</strong> and flats <strong>B E A D G C F</strong>. The signature tells you the default pitches; a written natural can cancel one temporarily. The accidentals sit on the same <em>pitches</em> in every clef, so their positions on the stave differ: in treble clef the first sharp (F♯) is on the top line, in bass clef it is on the 4th line, and in alto clef it is in the top space.</p>
      <h4>Rhythm notation in context</h4>
      <p>Count the denominator of a time signature as a note value: 4 means crotchet, 8 means quaver. A dotted note lasts one and a half times its undotted value. A tie combines durations only when the tied notes have the same pitch; a slur describes connected performance between different pitches. A triplet divides the time of two equal notes into three equal parts. Other tuplets are named by their number, such as a quintuplet for five notes fitted into a stated space.</p>
      <h4>Performance directions</h4>
      <p>Dynamics describe intensity, tempo describes speed, and articulation describes the attack or connection of notes. A crescendo changes loudness gradually, while accelerando changes speed gradually. Italian terms are instructions, not descriptions of the instrument itself.</p>
      <div class="lesson-callout"><strong>Common mistakes:</strong> reading alto clef as treble clef, treating a key signature as a one-bar accidental, adding a dot as one extra beat, and calling a slur a tie when the pitches differ.</div>`,
    examples: `
      <p>The same stave means different notes in different clefs. Here are the same three positions read in each clef:</p>
      <div id="notation-clef-gallery"></div>
      <p><strong>Middle C (C4)</strong> is the easiest way to link the clefs together:</p>
      <div id="notation-middlec-gallery"></div>
      <p>Key signatures are written in <strong>different positions for each clef</strong> — never copy the treble-clef pattern into bass or alto. Here are D major (2 sharps) and E♭ major (3 flats) in all three clefs:</p>
      <div id="notation-keysig-gallery"></div>
      <div class="notation-example-grid"><div id="notation-alto-example"></div><div id="notation-rhythm-example"></div></div>
      <p>For application, explain the effect rather than naming a symbol alone: a dotted crotchet followed by a quaver creates a long-short grouping, while a tied crotchet across a barline lets a sound continue without being re-attacked.</p>
      <h4>Notation Trainer</h4>
      <p>Use the trainer below to practise treble, bass and alto note reading, clefs, key signatures, intervals and note values. Start with notes on the stave, then choose a higher level to include ledger lines and accidentals.</p>
      <div id="notation-trainer"></div>`
  },
  elements: {
    learn: `
      <h4>The musical elements as an analysis toolkit</h4>
      <p>Use musical elements to describe what you hear and explain why it matters. <strong>Melody</strong> concerns pitch shape and phrases; <strong>harmony</strong> concerns simultaneous pitches and progression; <strong>tonality</strong> concerns the tonal centre or mode; <strong>rhythm and metre</strong> concern duration and grouping; <strong>tempo</strong> concerns speed.</p>
      <p><strong>Texture</strong> describes how parts combine, <strong>timbre/sonority</strong> describes the quality and blend of sound, <strong>dynamics</strong> describe loudness, and <strong>articulation</strong> describes how notes begin and connect. <strong>Phrasing</strong> groups musical ideas in a way that can be compared with punctuation in language.</p>
      <p><strong>Instrumentation</strong> identifies the performers and techniques used. <strong>Musical devices</strong> include repetition, sequence, imitation, ostinato, pedal, drone, motif, riff and hook. In an exam answer, link the device to its audible effect or structural purpose.</p>
      <p><strong>Common mistakes:</strong> treating tempo as rhythm, using "texture" to mean timbre, or listing an element without explaining its audible effect. Keep each term tied to evidence.</p>
      <div class="lesson-callout"><strong>Application model:</strong> name the feature, give precise evidence, then explain its effect. For example: "The repeated quaver ostinato in the lower strings creates a persistent pulse beneath the changing melody." </div>`,
    examples: `
      <p>Compare two performances of the same phrase: identify the tempo, dynamic shape, articulation and instrumentation, then explain how each choice changes character. Avoid vague words such as "nice" or "good" without musical evidence.</p>`
  },
  melody: {
    learn: `
      <h4>Melody and harmony working together</h4>
      <p>Melody can move conjunctly by step or disjunctly by leap, and its contour may rise, fall or form an arch. A balanced phrase often contains a question-like opening and an answering close. A motif can be developed by repetition, sequence, inversion, augmentation or diminution.</p>
      <p>Harmony supports melody through chord tones, passing notes and tension notes. A melody note that belongs to the underlying chord usually sounds stable; a non-chord note can create movement toward a chord tone. A hook is a memorable repeated idea in popular music, while a riff is a repeated melodic or harmonic pattern, often instrumental.</p>
      <p>Do not label every repeated idea an ostinato: an ostinato is persistently repeated, whereas a motif may return in altered form and be developed.</p>
      <p><strong>Common mistakes:</strong> calling any short tune a hook, confusing a sequence with exact repetition, and describing contour without saying whether the movement is conjunct or disjunct.</p>`,
    examples: `<p>In an analysis, describe both parts: "The vocal melody is mainly conjunct and syllabic, while the repeated guitar riff provides a recognisable hook between phrases." Then explain how the contrast shapes the listener's attention.</p>`
  },
  chords: {
    learn: `
      <h4>Harmony beyond chord names</h4>
      <p>Triads are built from a root, third and fifth. Inversions change the bass note without changing the chord's basic identity: root position has the root in the bass, first inversion the third, and second inversion the fifth. In a lead sheet, chord symbols communicate the harmony without writing every note.</p>
      <p>Cadences create punctuation. A perfect cadence V-I is strongly conclusive; a plagal cadence IV-I is also conclusive but softer; an imperfect cadence ends on V; an interrupted cadence begins with V but moves to vi in a major key. A pedal note sustains or repeats one pitch while harmony above it changes. A drone is a sustained pitch or pair of pitches, often associated with traditional music.</p>
      <p><strong>Common mistakes:</strong> identifying a cadence from the first chord only, calling every sustained note a drone, and confusing the bass note of an inversion with the root of the chord.</p>`,
    examples: `<p>To explain effect, connect harmony to expectation: a dominant seventh contains a tritone and pulls strongly toward the tonic, while an interrupted cadence delays the expected resolution and creates surprise.</p>`
  },
  form: {
    learn: `
      <h4>Recognising form and devices</h4>
      <p>Binary is AB and may be rounded if material from A returns briefly near the end of B. Ternary is ABA. Rondo alternates a recurring refrain with contrasting episodes, for example ABACA. Theme and variations keeps a theme recognisable while changing rhythm, melody, harmony, texture or instrumentation.</p>
      <p>Minuet and trio is Minuet-Trio-Minuet, usually in triple metre; a scherzo and trio uses a related three-part design but is generally quicker and more playful. Sonata form is organised as exposition, development and recapitulation, often with a coda. Strophic form repeats the same music for new verses; verse-chorus form alternates narrative verses with a recurring chorus; through-composed form continually introduces new music. Ground bass repeats a bass pattern under changing material, and call-and-response presents a musical statement followed by an answer.</p>
      <p><strong>Common mistakes:</strong> treating any ABA passage as a complete ternary movement, confusing a recurring rondo refrain with a chorus, and naming sonata form without identifying its three main sections.</p>
      <div class="lesson-callout"><strong>Board accuracy:</strong> these forms are general GCSE theory tools. Apply the terminology to the named area of study or repertoire only when the relevant AQA or Eduqas material supports it.</div>`,
    examples: `<p>Map a piece using letters before naming its form. Then identify what changes between sections: key, texture, instrumentation, melody, rhythm or dynamics. A diagram alone is not an analysis.</p>`
  }
};

const THEORY_QUIZ = [];
function addTheoryQuestion(question) {
  THEORY_QUIZ.push({ board: 'core', examBoard: ['general', 'aqa', 'eduqas'], ...question });
}

[
  { id: 'notation-alto-1', topic: 'notation', subtopic: 'alto-clef', type: 'mcq', difficulty: 1, prompt: 'Which pitch is on the middle line of the alto clef?', options: ['C4', 'E4', 'G3', 'F3'], answerIndex: 0, explanation: 'The alto clef centres middle C (C4) on its middle line.' },
  { id: 'notation-alto-2', topic: 'notation', subtopic: 'alto-clef', type: 'mcq', difficulty: 2, prompt: 'A viola part is written in alto clef. Why is this useful?', options: ['It keeps much of the instrument\'s register within the stave', 'It makes every note sound an octave higher', 'It removes the need for accidentals', 'It changes the time signature'], answerIndex: 0, explanation: 'Alto clef reduces the need for many ledger lines in the viola\'s middle register; it does not alter sounding pitch.' },
  { id: 'notation-accidental-1', topic: 'notation', subtopic: 'accidentals', type: 'mcq', difficulty: 2, prompt: 'What is the main difference between a key signature and an accidental?', options: ['A key signature sets a repeated default for the piece; an accidental changes a local note', 'A key signature only affects rests', 'An accidental always lasts for the whole piece', 'They are exactly the same'], answerIndex: 0, explanation: 'The signature establishes the default pitches, while a local accidental alters a note according to notation rules.' },
  { id: 'notation-rhythm-1', topic: 'notation', subtopic: 'rhythm-notation', type: 'mcq', difficulty: 2, prompt: 'A dotted minim is worth how many crotchet beats?', options: ['3', '2', '2.5', '1.5'], answerIndex: 0, explanation: 'A minim is 2 beats and its dot adds half its value, 1 beat: 2 + 1 = 3.' },
  { id: 'notation-tuplet-1', topic: 'notation', subtopic: 'tuplets', type: 'mcq', difficulty: 3, prompt: 'What does a triplet marking tell a performer?', options: ['Play three equal notes in the time normally occupied by two', 'Play three notes three times louder', 'Repeat the bar three times', 'Hold one note for three bars'], answerIndex: 0, explanation: 'A triplet changes the subdivision: three equal notes fit into the time of two notes of the same written value.' },
  { id: 'notation-notation-application', topic: 'notation', subtopic: 'application', type: 'match', difficulty: 3, prompt: 'Match each notation feature to its job.', pairs: [{ term: 'Tie', def: 'Joins same-pitch durations' }, { term: 'Slur', def: 'Connects different pitches smoothly' }, { term: 'Dot', def: 'Adds half the original value' }, { term: 'Natural', def: 'Cancels a sharp or flat' }], explanation: 'These symbols affect duration, phrasing or pitch in different ways: always check the musical context.' },
  { id: 'elements-application-1', topic: 'elements', subtopic: 'analysis', type: 'mcq', difficulty: 3, prompt: 'A composer repeats a quiet, detached quaver pattern in the lower strings beneath a broad melody. Which description is most precise?', options: ['A soft staccato ostinato supporting a longer melody', 'A loud legato drone in the upper strings', 'A slow tempo change in the melody', 'A perfect cadence in the percussion'], answerIndex: 0, explanation: 'Quiet describes dynamics, detached describes articulation, repeated pattern describes an ostinato, and the lower strings describe instrumentation.' },
  { id: 'melody-application-1', topic: 'melody', subtopic: 'melody-harmony', type: 'mcq', difficulty: 3, prompt: 'A vocal hook returns unchanged after every verse while the harmony repeats a four-chord loop. What is the best analysis?', options: ['A recurring hook over a repeating harmonic progression', 'Through-composed melody with no repetition', 'A ground bass because the vocal part is highest', 'A cadence because every phrase is loud'], answerIndex: 0, explanation: 'The repeated memorable vocal idea is a hook, and the recurring chord loop is a harmonic progression; neither term means cadence or ground bass here.' },
  { id: 'chords-application-1', topic: 'chords', subtopic: 'cadences', type: 'mcq', difficulty: 3, prompt: 'A phrase in C major moves from G7 to C. What effect is most likely?', options: ['Strong resolution to the tonic', 'An interrupted ending on A minor', 'An unfinished ending on the dominant', 'A change to the relative minor'], answerIndex: 0, explanation: 'G7 is V7 in C major, and its strong pull resolves to the tonic C chord: a perfect cadence.' },
  { id: 'form-application-1', topic: 'form', subtopic: 'structure', type: 'order', difficulty: 3, prompt: 'Put the main sections of sonata form in order.', items: ['Exposition', 'Development', 'Recapitulation'], explanation: 'The exposition presents themes, the development explores them, and the recapitulation returns to the main material.' },
  { id: 'form-application-2', topic: 'form', subtopic: 'popular-form', type: 'mcq', difficulty: 2, prompt: 'Which form best fits a song with new verses, a repeated chorus and one contrasting middle section?', options: ['Verse-chorus form with a bridge', 'Binary form only', 'Through-composed form', 'Minuet and trio'], answerIndex: 0, explanation: 'Verse-chorus form uses recurring chorus material, while a bridge or middle 8 supplies contrast.' },
  { id: 'theory-modes-1', topic: 'scales', subtopic: 'modes', type: 'mcq', difficulty: 4, prompt: 'What makes a mode different from simply calling music major or minor?', options: ['Its characteristic pattern and tonal centre create a distinct pitch collection', 'It has no tonic', 'It can only be played by a choir', 'It always uses twelve different notes'], answerIndex: 0, explanation: 'Modes have their own interval pattern and tonal centre; they are not automatically major or minor in function.' },
  { id: 'theory-inversion-1', topic: 'chords', subtopic: 'inversions', type: 'mcq', difficulty: 2, prompt: 'A C major triad with E as its lowest note is in which position?', options: ['First inversion', 'Root position', 'Second inversion', 'A fourth inversion'], answerIndex: 0, explanation: 'E is the third of C major, so placing it in the bass creates first inversion.' }
].forEach(addTheoryQuestion);

THEORY_QUIZ.forEach(q => {
  q.id = q.id;
  if (q.type === 'mcq') {
    const shuffled = shuffle([...q.options]);
    q.answerIndex = shuffled.indexOf(q.options[q.answerIndex]);
    q.options = shuffled;
  }
});
QUIZ_BANK_1.push(...THEORY_QUIZ);

const THEORY_FLASHCARDS = [
  ['notation', 'Alto clef', 'A C clef placing middle C (C4) on the middle line.'],
  ['notation', 'Tuplet', 'A group that changes the usual subdivision, such as three notes in the time of two.'],
  ['elements', 'Phrasing', 'The way notes are grouped into expressive musical ideas.'],
  ['elements', 'Sonority', 'The overall quality, blend and colour of a sound or combination of sounds.'],
  ['elements', 'Articulation', 'The way a note is attacked, sustained and released.'],
  ['elements', 'Instrumentation', 'The instruments, voices and playing techniques used in a piece.'],
  ['melody', 'Hook', 'A memorable musical idea designed to catch attention, often in popular music.'],
  ['chords', 'Pedal note', 'A sustained or repeated pitch beneath changing harmony.'],
  ['form', 'Scherzo and trio', 'A fast ternary design: scherzo, contrasting trio, scherzo return.'],
  ['form', 'Verse-chorus form', 'A popular-song structure alternating changing verses with a recurring chorus.'],
  ['scales', 'Mode', 'A pitch collection with its own interval pattern and tonal centre.'],
].map((row, i) => ({
  id: `theory-fc-${i}`, board: 'core', examBoard: ['general', 'aqa', 'eduqas'], topic: row[0],
  subtopic: row[0], difficulty: row[0] === 'notation' ? 2 : 3, questionType: 'flashcard',
  term: row[1], definition: row[2]
}));

FLASHCARDS.push(...THEORY_FLASHCARDS);

if (typeof window !== 'undefined') {
  window.THEORY_EXTENSIONS = THEORY_EXTENSIONS;
}
