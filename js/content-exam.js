/* ============================================================
   GCSE Music Theory Quest — content-exam.js
   Exam-board-specific overview material.

   IMPORTANT: this is a general, simplified summary for revision
   context only — always check the current official specification
   from AQA / Eduqas for exact, up-to-date requirements.
   Nothing here should be treated as a substitute for the official
   spec documents.
   ============================================================ */

const EXAM_BOARDS = {
  aqa: {
    name: 'AQA',
    fullName: 'AQA GCSE Music (8271)',
    note: 'General summary for revision only — always check the current official AQA specification for exact, up-to-date requirements.',
    areasOfStudy: [
      { title: 'Western Classical Tradition 1650–1910', desc: 'Baroque, Classical and Romantic era music: forms such as binary, ternary, rondo, sonata form and theme and variations, and how composers use melody, harmony, texture and timbre.' },
      { title: 'Popular Music', desc: 'Popular genres and styles, including song structures, riffs and hooks, groove, vocal and instrumental techniques, and the role of technology and production.' },
      { title: 'Traditional Music', desc: 'Music with roots in particular cultures and traditions, such as drones, call-and-response, improvisation and characteristic instruments and rhythms.' },
      { title: 'Western Classical Tradition since 1910', desc: 'Art music from the 20th and 21st centuries, including new approaches to harmony, rhythm, texture, timbre and technology.' }
    ],
    assessmentNote: 'Three parts: Understanding music (listening and contextual understanding) is 40%; Performing music (solo and ensemble) is 30%; Composing music (to a brief and free composition) is 30%. Always confirm the details in the current AQA specification.',
    focusTerms: ['ostinato', 'ground bass', 'sequence', 'hemiola', 'pedal', 'sonata form', 'riff', 'hook', 'drone', 'anacrusis', 'syncopation']
  },
  eduqas: {
    name: 'Eduqas',
    fullName: 'WJEC Eduqas GCSE Music (C660QS)',
    note: 'General summary for revision only — WJEC (for Wales) and Eduqas (for England) are related but separate specifications with their own set works; always check the current official specification that applies to you.',
    areasOfStudy: [
      { title: 'Musical Forms and Devices', desc: 'Rooted in the Western classical tradition: forms and devices such as binary, ternary, rondo, variations, sequence, imitation and cadences, with melody, harmony, tonality, texture and sonority.' },
      { title: 'Music for Ensemble', desc: 'Ensemble types and how they are used — texture, sonority and timbre, instrumental and vocal techniques, balance, accompaniment, melody and harmony.' },
      { title: 'Film Music', desc: 'How music supports the screen: leitmotif, mood and atmosphere, thematic development, orchestration and timbre, technology, and the link between music and visual action.' },
      { title: 'Popular Music', desc: 'Genres and styles, song structure, riffs, hooks, chord progressions, rhythm and groove, technology and production, and vocal and instrumental techniques.' }
    ],
    assessmentNote: 'Eduqas integrates performing, composing and appraising through its four areas of study. Always confirm the details in the current Eduqas specification.',
    focusTerms: ['leitmotif', 'canon', 'imitation', 'sequence', 'ground bass', 'riff', 'hook', 'thematic development', 'diegetic', 'strophic']
  }
};

const BADGES = [
  { id: 'first-notes', icon: '🎼', name: 'First Notes', desc: 'Complete your first lesson.', check: s => s.completedTopics && s.completedTopics.length >= 1 },
  { id: 'rhythm-rookie', icon: '🥁', name: 'Rhythm Rookie', desc: 'Score 70%+ on a Rhythm and Metre quiz.', check: (s, ctx) => !!(ctx && ctx.topicPass === 'rhythm') },
  { id: 'key-master', icon: '🔑', name: 'Key Master', desc: 'Reach Secure or higher mastery in Scales and Keys.', check: s => masteryOf(s, 'scales').key !== 'not-started' && masteryOf(s, 'scales').key !== 'learning' },
  { id: 'interval-expert', icon: '📏', name: 'Interval Expert', desc: 'Answer 25 interval questions correctly.', check: s => (s.topicStats.intervals?.correct || 0) >= 25 },
  { id: 'chord-builder', icon: '🎹', name: 'Chord Builder', desc: 'Reach Secure or higher mastery in Chords and Harmony.', check: s => ['secure', 'mastered'].includes(masteryOf(s, 'chords').key) },
  { id: 'dynamics-pro', icon: '🎚️', name: 'Dynamics Pro', desc: 'Reach Secure or higher mastery in Elements.', check: s => ['secure', 'mastered'].includes(masteryOf(s, 'elements').key) },
  { id: 'texture-detective', icon: '🧶', name: 'Texture Detective', desc: 'Reach Secure or higher mastery in Texture.', check: s => ['secure', 'mastered'].includes(masteryOf(s, 'texture').key) },
  { id: 'form-finder', icon: '🏛️', name: 'Form Finder', desc: 'Reach Secure or higher mastery in Form and Structure.', check: s => ['secure', 'mastered'].includes(masteryOf(s, 'form').key) },
  { id: 'listening-legend', icon: '👂', name: 'Listening Legend', desc: 'Complete 20 Listening Lab questions.', check: s => (s.topicStats.listening?.attempts || 0) >= 20 },
  { id: 'theory-scholar', icon: '📖', name: 'Theory Scholar', desc: 'Reach Level 5 (Theory Student).', check: s => levelForXp(s.xp).level >= 5 },
  { id: 'streak-5', icon: '🔥', name: 'Warming Up', desc: 'Get a 5-answer correct streak.', check: s => s.correctStreakBest >= 5 },
  { id: 'streak-10', icon: '🔥🔥', name: 'On Fire', desc: 'Get a 10-answer correct streak.', check: s => s.correctStreakBest >= 10 },
  { id: 'streak-20', icon: '🔥🔥🔥', name: 'Unstoppable', desc: 'Get a 20-answer correct streak.', check: s => s.correctStreakBest >= 20 },
  { id: 'gcse-ready', icon: '🏆', name: 'GCSE Ready', desc: 'Complete a mock exam.', check: s => (s.mockExamHistory || []).length >= 1 }
];

function masteryOf(state, topicId) {
  return masteryLevel(state.topicStats[topicId]);
}

const CONFUSABLE_PAIRS = [
  { a: 'Perfect cadence', b: 'Plagal cadence', note: 'Both sound "finished", but perfect (V–I) sounds strong and conclusive, while plagal (IV–I) sounds softer — think of the "Amen" at the end of a hymn.' },
  { a: 'Major', b: 'Minor', note: 'Major generally sounds brighter/happier; minor generally sounds darker/sadder. The difference always comes down to the 3rd of the scale/chord being a semitone lower in minor.' },
  { a: 'Simple metre', b: 'Compound metre', note: 'In simple metre each beat splits into 2 (2/4, 3/4, 4/4); in compound metre each beat splits into 3 (6/8, 9/8, 12/8).' },
  { a: 'Monophonic', b: 'Homophonic', note: 'Monophonic = a single line with nothing else at all. Homophonic = a melody plus chordal accompaniment underneath it.' },
  { a: 'Homophonic', b: 'Polyphonic', note: 'Homophonic = one clear melody with supporting chords. Polyphonic = two or more independent melodic lines of equal importance happening together.' },
  { a: 'Motif', b: 'Riff', note: 'A motif is a short idea that tends to be developed and transformed through a piece (typical of classical music). A riff is a short pattern that is usually just repeated largely unchanged (typical of rock/pop).' },
  { a: 'Riff', b: 'Ostinato', note: 'A riff is usually melodic/harmonic and specific to popular genres. An ostinato is any short pattern (rhythmic and/or melodic) repeated persistently, in any genre.' },
  { a: 'Sharp', b: 'Flat', note: 'A sharp (♯) raises a note by a semitone; a flat (♭) lowers a note by a semitone. A natural (♮) cancels either.' },
  { a: 'Tempo', b: 'Rhythm', note: 'Tempo is the speed of the pulse. Rhythm is the pattern of long and short notes — you can play the same rhythm at many different tempos.' },
  { a: 'Tone', b: 'Semitone', note: 'A semitone is the smallest step in Western music; a tone is two semitones added together.' },
  { a: 'Tie', b: 'Slur', note: 'A tie joins two notes of the same pitch into one longer sound. A slur joins notes of different pitches, asking for smooth, connected playing.' },
  { a: 'Interval (Perfect)', b: 'Interval (Major/Minor)', note: 'Perfect applies only to unisons, 4ths, 5ths and octaves. Major/minor applies to 2nds, 3rds, 6ths and 7ths.' },
  { a: 'Conjunct melody', b: 'Disjunct melody', note: 'Conjunct = moving mostly by step (smooth). Disjunct = moving mostly by leap (angular).' },
  { a: 'Binary form', b: 'Ternary form', note: 'Binary = two contrasting sections (AB). Ternary = an opening section, contrast, then a return to the opening (ABA).' },
  { a: 'Drone', b: 'Pedal note', note: 'Both are sustained/repeated notes under changing material. "Drone" is typically used for folk/world music traditions; "pedal note" (or pedal point) is the term used within Western classical harmony.' }
];
