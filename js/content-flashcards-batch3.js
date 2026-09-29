/* ============================================================
   Batch 3 - expanded, metadata-rich flashcards.
   Existing cards remain untouched. Quiz-derived cards reuse the
   tested answer and explanation, while curated cards add analysis,
   composition, performance, listening and board-specific review.
   ============================================================ */

const BATCH3_EXISTING_CARD_COUNT = FLASHCARDS.length;

function addBatch3Card(card) {
  FLASHCARDS.push({
    id: `b3-${FLASHCARDS.length}-${card.topic}-${card.subtopic}`,
    examBoard: card.examBoard || 'general',
    topic: card.topic,
    subtopic: card.subtopic || card.topic,
    difficulty: card.difficulty || 2,
    questionType: card.questionType || 'application',
    term: card.front,
    definition: card.back
  });
}

function quizAnswerForFlashcard(question) {
  if (question.type === 'order') return `Order: ${question.items.join(' -> ')}. ${question.explanation}`;
  if (question.type === 'match') return question.pairs.map(pair => `${pair.term} = ${pair.def}`).join('; ') + `. ${question.explanation}`;
  if (question.options && Number.isInteger(question.answerIndex)) return `${question.options[question.answerIndex]}. ${question.explanation}`;
  return question.explanation;
}

function quizFlashcardFromQuestion(question) {
  // Audio prompts need an audio player; keeping them as text-only cards creates a misleading task.
  if (question.visual && question.visual.kind === 'audio') return null;

  if (question.visual && question.visual.kind === 'staff') {
    const visual = question.visual;
    if (visual.notes && visual.notes.length === 1) {
      const pitch = visual.notes[0];
      const clefName = visual.clef === 'alto' ? 'alto' : visual.clef === 'bass' ? 'bass' : 'treble';
      return {
        front: `In ${clefName} clef, what note name is shown on the stave? (Pitch reference: ${pitch})`,
        back: `The note name is ${pitch[0]}. ${question.explanation}`
      };
    }
    if (visual.notes && visual.notes.length > 1) {
      return {
        front: `${question.prompt.replace(/\.$/, '')}: ${visual.notes.join(' and ')}.`,
        back: quizAnswerForFlashcard(question)
      };
    }
    if (visual.chordNotes && visual.chordNotes.length) {
      return {
        front: `What is the musical feature of the chord ${visual.chordNotes.join('-')}?`,
        back: quizAnswerForFlashcard(question)
      };
    }
  }

  return { front: question.prompt, back: quizAnswerForFlashcard(question) };
}

// Earlier versions auto-generated a flashcard from every quiz question. Many of those
// clones had no real answer, gave the answer away in the prompt, or copied a quiz error
// onto a second card, so they have been removed in favour of the curated cards below.

const BATCH3_CURATED = [
  // Notation and theory application
  ['notation','clefs',1,'Which reference pitch belongs on the alto clef middle line?','Middle C (C4). Count outward from that line rather than borrowing treble-clef names.','identification'],
  ['notation','clefs',2,'Why might a viola part use alto clef rather than treble clef?','It keeps much of the viola range inside the stave and reduces ledger lines; the sounding pitches do not change.','application'],
  ['notation','clefs',3,'A note is one ledger line below the treble stave. What reliable method should you use?','Anchor the treble bottom line as E4, then count letter names downward: D4 is the space, C4 is the ledger line.','application'],
  ['notation','accidentals',1,'What does a natural sign do in a passage with a key signature?','It cancels the relevant sharp or flat for that note in the current bar, following normal notation rules.','application'],
  ['notation','accidentals',2,'Why can F-sharp and G-flat not always be treated as interchangeable spellings?','They may sound enharmonically equivalent but their spelling shows different harmonic or melodic function.','comparison'],
  ['notation','key-signatures',1,'What is the order of sharps in a key signature?','F, C, G, D, A, E, B.','recall'],
  ['notation','key-signatures',1,'What is the order of flats in a key signature?','B, E, A, D, G, C, F.','recall'],
  ['notation','key-signatures',2,'How can a key signature help you identify a tonal centre?','It narrows the likely major and relative-minor keys; confirm the tonic by listening for the note or chord that feels like home.','application'],
  ['notation','rhythm-notation',1,'How much does a dot add to a note value?','Half of the original value, so a dotted crotchet lasts 1.5 crotchet beats.','application'],
  ['notation','rhythm-notation',2,'When should you use a tie rather than a slur?','Use a tie between the same pitch to combine durations; use a slur over different pitches for connected phrasing.','comparison'],
  ['notation','rhythm-notation',2,'What is the practical purpose of a rest?','It notates a measured silence so the rhythm still fills the bar accurately.','application'],
  ['notation','rhythm-notation',3,'What is a quintuplet?','Five notes fitted into a stated rhythmic space, changing the normal subdivision.','identification'],
  ['notation','performance-marks',1,'Which element does sfz primarily change?','Dynamics: it requests a sudden strong accent on a note or chord.','application'],
  ['notation','performance-marks',2,'How do marcato and staccato differ?','Marcato stresses and marks a note; staccato shortens and detaches it. They describe different aspects of attack and duration.','comparison'],
  ['notation','performance-marks',2,'What does a crescendo hairpin communicate?','A gradual increase in loudness across the marked passage.','application'],
  ['notation','tempo',1,'What is the difference between BPM and an Italian tempo word?','BPM gives a measurable pulse rate; an Italian word gives a descriptive performance indication.','comparison'],
  ['notation','tempo',2,'How should rubato affect an expressive performance?','The performer flexes the tempo for expression while retaining the phrase direction and overall musical shape.','application'],
  ['scales','modes',2,'How should you identify a mode in listening?','Find the tonal centre, then listen for the characteristic interval that distinguishes the mode from major or minor.','listening'],
  ['scales','chromaticism',2,'What effect can chromatic notes create?','They can add colour, tension or a line of movement outside the basic diatonic key.','application'],
  ['intervals','identification',2,'Why count both note names when naming an interval?','The interval number is inclusive: C to E counts C-D-E, so it is a third.','application'],
  ['chords','inversions',2,'What does changing a triad inversion change most directly?','The bass note and spacing, which can smooth a bass line without changing the chord class.','application'],
  ['chords','harmony',3,'How can dissonance be used compositionally?','It creates instability or tension that can resolve, remain unresolved, or colour a passage.','application'],
  ['chords','cadences',2,'How do you distinguish an imperfect cadence from a perfect cadence?','An imperfect cadence ends on V and sounds unfinished; a perfect cadence resolves V-I to the tonic.','comparison'],
  ['chords','cadences',2,'What is the function of a pedal point?','It sustains or repeats one pitch while the harmony above changes, creating stability or tension.','application'],
  // Musical elements and analysis
  ['elements','melody',1,'What evidence supports the description conjunct melody?','Most adjacent notes move by step, producing a smooth line rather than frequent leaps.','application'],
  ['elements','melody',2,'How can a composer make a melody sound more angular?','Use wider leaps, irregular contour and less predictable phrase shapes.','composition'],
  ['elements','harmony',2,'What should an analysis say after naming a chord progression?','Explain its effect, such as stability, tension, direction towards a cadence or support for the melody.','application'],
  ['elements','texture',1,'What change creates a thicker texture?','Adding independent or supporting layers, doubling parts, or moving from a solo line to an ensemble.','application'],
  ['elements','texture',2,'How can imitation develop texture?','A second part repeats a musical idea after the first, creating layered or contrapuntal interaction.','application'],
  ['elements','texture',2,'What is the difference between unison and octaves?','Unison uses the same pitch; octaves use the same letter name at different pitch levels.','comparison'],
  ['elements','timbre',1,'What evidence can identify timbre?','Instrument family, register, attack, sustained sound, playing technique and production effects all provide evidence.','listening'],
  ['elements','timbre',2,'How can orchestration change the colour of the same melody?','Assign it to different instruments, registers, articulations or combinations of instruments.','composition'],
  ['elements','rhythm',2,'How does syncopation affect a listener?','It shifts emphasis away from expected strong beats, creating drive, instability or groove.','application'],
  ['elements','rhythm',2,'What is the difference between cross-rhythm and polyrhythm?','Cross-rhythm creates conflicting rhythmic emphasis; polyrhythm layers different repeated rhythms at the same time.','comparison'],
  ['elements','metre',2,'How can hemiola disturb an established metre?','It temporarily regroups the beats: two bars of triple time (normally felt as two groups of three) can be made to feel like three groups of two instead.','application'],
  ['elements','tempo',1,'What does accelerando change?','The speed of the pulse gradually increases; it is not a dynamic change.','application'],
  ['elements','dynamics',2,'How can dynamics shape a phrase?','A crescendo can intensify a goal, while a diminuendo can release energy or close a phrase.','composition'],
  ['elements','articulation',1,'What does legato tell a performer?','Connect the notes smoothly with minimal gaps.','application'],
  ['elements','phrasing',2,'Why is phrasing important when analysing a melody?','It reveals how ideas are grouped, where musical punctuation occurs and how expression is shaped.','application'],
  ['elements','sonority',3,'What does sonority include beyond instrument names?','The blend, register, density, playing technique and production quality of the combined sound.','application'],
  ['elements','vocabulary',2,'How should a strong listening answer use musical vocabulary?','Use a precise term, cite audible evidence, and explain the effect rather than listing disconnected labels.','application'],
  // Form and devices
  ['form','binary',1,'What is binary form?','Two main sections, A and B, usually contrasting in musical material or key.','identification'],
  ['form','ternary',1,'What makes a form ternary rather than simply repetitive?','A contrasting middle section is followed by a recognisable return of the opening A material.','comparison'],
  ['form','rondo',2,'What is the defining feature of rondo?','A recurring main theme alternates with contrasting episodes, such as ABACA.','identification'],
  ['form','theme-and-variations',2,'How can a variation remain recognisable?','Keep a contour, harmony, rhythm or phrase shape while changing texture, register, articulation or accompaniment.','composition'],
  ['form','sonata-form',3,'What is the role of the development in sonata form?','It explores, fragments, sequences or transforms ideas introduced in the exposition before the recapitulation.','application'],
  ['form','minuet-and-trio',2,'What is the basic design of minuet and trio?','Minuet, contrasting trio, then a return to the minuet, often in triple metre.','identification'],
  ['form','scherzo-and-trio',3,'How does scherzo and trio relate to minuet and trio?','It uses a similar three-part return design, but the scherzo is generally quicker and more playful.','comparison'],
  ['form','strophic',1,'What changes in strophic form?','The words or text may change while the underlying music repeats for each verse.','application'],
  ['form','verse-chorus',2,'What is the usual function of a chorus?','It returns with memorable material and often the main hook or refrain after contrasting verses.','application'],
  ['form','through-composed',2,'What listening evidence suggests through-composed form?','Large sections continually introduce new music rather than returning to a repeated verse or refrain.','listening'],
  ['form','ground-bass',2,'How does a ground bass create continuity?','A repeated bass pattern anchors changing melodies, harmony, texture or instrumentation above it.','application'],
  ['form','call-and-response',1,'What is call-and-response?','One musical statement is answered by another voice, instrument or group.','identification'],
  ['form','devices',2,'How does a sequence differ from repetition?','A sequence repeats an idea at a different pitch level; repetition returns it at the same pitch.','comparison'],
  ['form','devices',2,'How can augmentation develop a motif?','Lengthen its note values while retaining enough of its contour or rhythm for recognition.','composition'],
  // Instruments, voices and production
  ['instruments','strings',1,'Which string technique uses the bow to produce a sustained tone?','Arco, as opposed to pizzicato, which plucks the strings.','identification'],
  ['instruments','strings',2,'What is pizzicato likely to contribute?','A short, plucked, percussive string timbre rather than a bowed sustained line.','listening'],
  ['instruments','woodwind',1,'How does a clarinet produce its sound?','A single reed vibrates as air passes through the instrument.','identification'],
  ['instruments','woodwind',2,'How does a flute differ from a reed woodwind?','It is an edge-blown instrument, so its sound is produced by directing air across an opening rather than vibrating a reed.','comparison'],
  ['instruments','brass',1,'How do brass players start the sound?','Buzzing the lips into a cup or funnel-shaped mouthpiece, then using tubing to shape the pitch.','identification'],
  ['instruments','brass',2,'What is a mute used for?','It alters the colour, projection or intensity of a brass instrument rather than simply changing its pitch.','application'],
  ['instruments','percussion',1,'What distinguishes pitched percussion from unpitched percussion?','Pitched percussion produces identifiable notes; unpitched percussion mainly contributes rhythm and colour.','comparison'],
  ['instruments','voices',1,'What does SATB stand for?','Soprano, alto, tenor and bass, the standard four-part choral layout.','recall'],
  ['instruments','voices',2,'What is melisma?','Singing several pitches on one syllable of text.','identification'],
  ['instruments','ensemble',2,'How can ensemble balance be improved?','Adjust dynamics, register, articulation, spacing or amplification so important material remains audible.','performance'],
  ['instruments','technology',2,'What does amplification change in a performance?','It changes sound level and can also affect balance, tone and the relationship between performers and audience.','application'],
  ['instruments','technology',3,'How can synthesis alter timbre?','By shaping oscillator type, envelope, filter and effects such as delay or reverb.','composition'],
  // Composition and performance
  ['composition','developing-ideas',1,'What is a useful first step when developing a motif?','Identify its rhythm, contour and interval shape so one feature can be repeated, varied or contrasted deliberately.','composition'],
  ['composition','developing-ideas',2,'How can contrast be created without abandoning a motif?','Change its mode, register, instrumentation, rhythm, articulation or accompaniment while keeping a recognisable link.','composition'],
  ['composition','briefs',2,'How should a composition respond to a brief?','Make musical decisions that clearly satisfy its stimulus, purpose, forces and intended character, then refine them through review.','application'],
  ['composition','free-composition',2,'What makes a free composition coherent?','A convincing sense of direction through recurring ideas, contrast, structure, pacing and controlled musical elements.','composition'],
  ['composition','harmony',2,'How can a pedal support a composition?','It can anchor a tonal centre while upper harmony changes, creating tension between stability and movement.','composition'],
  ['composition','notation',1,'Why document a composition clearly?','Performers need reliable information about pitches, rhythm, dynamics, articulation, tempo and structure.','application'],
  ['composition','texture',2,'How can a composer move from monophony to a fuller texture?','Add a drone, chordal support, countermelody, imitation or layered ostinato with a clear role for each part.','composition'],
  ['performance','accuracy',1,'What does performance accuracy include?','Correct pitches, rhythms, entries, articulation, dynamics, tempo and secure handling of the written part.','performance'],
  ['performance','expression',2,'How can interpretation communicate phrase direction?','Shape dynamics, articulation, tempo flexibility and tone so musical goals and punctuation are audible.','performance'],
  ['performance','ensemble',2,'Why is active listening essential in an ensemble?','It coordinates pulse, balance, entries, tuning, phrasing and responses between parts.','performance'],
  ['performance','preparation',3,'How can a performer diagnose an unreliable passage?','Isolate the difficulty, practise slowly and accurately, add context gradually, then test it without stopping.','performance'],
  // Listening and aural concepts
  ['listening','aural-analysis',1,'What should you do before naming a listening feature?','Listen for audible evidence such as repetition, texture, instrumentation, rhythm, dynamics or tonal change.','listening'],
  ['listening','comparison',2,'How should two excerpts be compared?','Use the same musical categories for both, identify similarities and differences, then explain their effects.','comparison'],
  ['listening','instrument-identification',2,'What clues can identify a bowed string instrument?','Sustained tone, bow changes, vibrato, register and string-like attack, considered alongside the musical context.','listening'],
  ['listening','production',2,'What can reverb suggest in a recording?','A larger acoustic space or distance, while a dry sound can feel closer and more exposed.','listening'],
  ['listening','film-music',2,'How can a leitmotif support film narrative?','Its recurrence links a musical idea with a character, place or concept; changes can suggest development or altered meaning.','application'],
  ['listening','film-music',3,'What is diegetic music?','Music that exists within the story world and could be heard by the characters, such as a radio or on-screen performer.','identification'],
  // AQA-specific, clearly labelled
  ['assessment','aqa-areas',1,'What are the four AQA GCSE Music Areas of Study?','Western classical tradition 1650-1910; Popular music; Traditional music; Western classical tradition since 1910.','aqa'],
  ['assessment','aqa-understanding',2,'What does AQA Understanding music focus on?','Listening and contextual understanding, including musical elements, unfamiliar listening and relevant study-piece knowledge.','aqa'],
  ['assessment','aqa-performing',2,'What does AQA Performing music require learners to develop?','Solo and ensemble performance skills, accuracy, expression, interpretation, ensemble awareness and supporting documentation.','aqa'],
  ['assessment','aqa-popular',2,'Which analysis terms can be especially useful in AQA Popular music?','Riffs, hooks, verse-chorus structures, groove, production, amplification, synthesis and recording effects when supported by evidence.','aqa'],
  ['assessment','aqa-traditional',2,'What should a learner avoid when revising AQA Traditional music?','Treating one tradition as representative of all traditional music; identify the relevant cultural context and audible features.','aqa'],
  ['assessment','aqa-composing',2,'What are the two AQA composing purposes?','A composition written to a set brief, and a free composition of the student\'s own choice, each supported by developing musical ideas and documentation.','aqa'],
  ['assessment','aqa-western',2,'How should AQA Western classical study be revised?','Connect forms, devices, harmony, texture, sonority and context to the specific area or study material rather than memorising isolated terms.','aqa'],
  // Eduqas-specific, clearly labelled
  ['assessment','eduqas-areas',1,'What are the four Eduqas GCSE Music Areas of Study?','Musical Forms and Devices; Music for Ensemble; Film Music; Popular Music.','eduqas'],
  ['assessment','eduqas-forms',2,'What should revision for Eduqas Musical Forms and Devices connect?','Forms and devices with melody, harmony, tonality, texture, sonority, rhythm, structure and relevant repertoire context.','eduqas'],
  ['assessment','eduqas-ensemble',2,'What should revision for Eduqas Music for Ensemble include?','Ensemble types, balance, accompaniment, texture, instrumental and vocal techniques, melody, harmony and repertoire context.','eduqas'],
  ['assessment','eduqas-film',2,'What is central to Eduqas Film Music analysis?','The relationship between music and visual action, including leitmotif, mood, thematic development, orchestration, technology and structure.','eduqas'],
  ['assessment','eduqas-popular',2,'Which features can support Eduqas Popular Music analysis?','Genres and styles, song structure, riffs, hooks, chord progressions, groove, production, technology and vocal or instrumental techniques.','eduqas'],
  ['composition','briefs',1,'What should a composer identify before writing to a brief?','The intended purpose, audience, stimulus, forces, style and constraints, then choose musical ideas that answer them.','composition'],
  ['composition','structure',2,'How can contrast make a composition easier to follow?','Change one or more elements deliberately, such as texture, register, key, dynamics, rhythm or instrumentation.','composition'],
  ['composition','melody',2,'How can a sequence create forward motion?','Repeat a melodic or rhythmic idea at a new pitch level, often moving towards a cadence or new section.','composition'],
  ['composition','rhythm',2,'How can an ostinato be varied without losing its identity?','Keep its core rhythm or contour but alter orchestration, register, articulation, harmony or layering.','composition'],
  ['composition','technology',3,'What is the creative role of sampling?','A recorded sound can become source material whose rhythm, pitch, timbre or context is transformed.','composition'],
  ['performance','intonation',2,'What is secure intonation?','Accurate pitch that remains controlled within the musical line, including expressive adjustments that do not obscure the tonal centre.','performance'],
  ['performance','breathing',1,'Why plan breaths in a vocal performance?','Planned breathing supports phrasing, pitch stability, stamina and the continuity of the musical sentence.','performance'],
  ['performance','ensemble',3,'What should an ensemble do after a conductor gives a cut-off?','Release together, observing the conductor and the notated or rehearsed duration of the sound.','performance'],
  ['performance','interpretation',2,'How can articulation support character?','Short detached attacks can create lightness or urgency, while legato can support singing, calm or sustained expression.','performance'],
  ['performance','documentation',2,'What performance documentation is useful to retain?','The chosen piece, forces, programme or purpose, rehearsal decisions, technical needs and evidence of reflection.','performance'],
  ['listening','tonality',2,'What clues can suggest a modulation?','A new tonal centre, altered accidentals, a changed cadence pattern or a sustained period centred away from the original key.','listening'],
  ['listening','texture',1,'What should you listen for when texture becomes thinner?','Fewer sounding layers, less doubling, a move towards solo or unison, or the removal of accompaniment.','listening'],
  ['listening','rhythm',2,'How can swing differ from straight quavers?','Paired quavers are performed with a long-short lilt rather than as two equal subdivisions.','listening'],
  ['listening','dynamics',1,'How can you hear a diminuendo?','The sound gradually becomes quieter, often reducing intensity towards a cadence or release.','listening'],
  ['listening','form',3,'Why is a return of opening material significant in listening?','It can confirm ternary, rondo, rounded binary or recapitulation processes depending on the wider structure.','listening'],
  ['listening','aural-analysis',2,'What makes an unfamiliar-listening answer reliable?','Specific audible evidence plus an accurate musical term and an explanation of how the feature affects the music.','application'],
  ['assessment','aqa-areas',1,'Which AQA Area of Study focuses on music from popular genres?','Popular music. This label does not mean every popular work is an AQA set work.','aqa'],
  ['assessment','aqa-areas',2,'Which AQA Area of Study covers music since 1910?','Western classical tradition since 1910. Revise its context and musical features using current official materials.','aqa'],
  ['assessment','aqa-performing',3,'Why are expression and interpretation separate from simple accuracy?','A technically correct performance can still lack convincing phrasing, character, communication and musical decision-making.','aqa'],
  ['assessment','aqa-composing',3,'How can a brief be demonstrated in a composition?','Make the stimulus or purpose audible through deliberate choices of musical elements, structure, forces and development.','aqa'],
  ['assessment','aqa-understanding',3,'What is a useful AQA unfamiliar-listening revision habit?','Practise identifying elements and explaining effects from short excerpts, not only memorising definitions or set-work facts.','aqa'],
  ['assessment','eduqas-film',1,'What is a film cue?','A piece or passage of music written or selected to accompany a particular moment or sequence in a film.','eduqas'],
  ['assessment','eduqas-film',3,'How can thematic transformation affect a film leitmotif?','Changing its mode, orchestration, register, harmony, tempo or articulation can reflect a character or idea changing.','eduqas'],
  ['assessment','eduqas-ensemble',1,'Why does balance matter in Eduqas Music for Ensemble?','Each part must be audible and appropriately proportioned so the ensemble communicates its musical roles.','eduqas'],
  ['assessment','eduqas-forms',3,'How can imitation support an Eduqas Forms and Devices analysis?','It can create layered texture and structural continuity when one part echoes a musical idea introduced by another.','eduqas'],
  ['assessment','eduqas-popular',3,'How can production be a musical feature in Eduqas Popular Music?','Recording, mixing, panning, equalisation, effects and layering can shape timbre, space, balance and the listener experience.','eduqas'],
  ['notation','lead-sheets',2,'What information does a lead-sheet chord symbol communicate?','It gives the harmonic chord or bass relationship without fully notating every sounding part.','application'],
  ['elements','antiphonal-texture',2,'What is antiphonal texture?','Groups or parts answer or alternate with one another across a musical space or ensemble.','identification'],
  ['composition','review',3,'What makes useful composition feedback actionable?','It identifies a specific musical moment, explains its effect and suggests a testable revision rather than giving only a general opinion.','application'],
  ['listening','replay-strategy',1,'Why can replaying an excerpt help listening revision?','A first listen can establish the broad character; later listens can target one element such as texture, rhythm or instrumentation.','study-strategy'],
  ['notation','rhythm-notation',3,'How can beaming clarify rhythm?','Beams group notes according to the metre so beat divisions and subdivisions are easier to read.','application'],
  ['elements','register',2,'What is register?','The relative pitch range in which a sound or part is placed, such as low, middle or high register.','identification'],
  ['composition','transition',2,'How can a transition connect two sections?','Use a shared motif, a sequence, a pedal, a changing texture or a harmonic movement that leads convincingly into the next section.','composition'],
  ['listening','cadence',2,'What listening clue can reveal a cadence?','A phrase-ending harmonic or melodic punctuation, often supported by a change in rhythm, texture or dynamics.','listening']
];

BATCH3_CURATED.forEach(([topic, subtopic, difficulty, front, back, questionType]) => addBatch3Card({
  topic, subtopic, difficulty, front, back, questionType,
  examBoard: questionType === 'aqa' ? 'aqa' : questionType === 'eduqas' ? 'eduqas' : 'general'
}));

// Keep all original cards, but prevent repeated quiz-derived cards from inflating the deck.
const batch3SeenKeys = new Set(FLASHCARDS.slice(0, BATCH3_EXISTING_CARD_COUNT).map(card => `${card.term}|${card.definition}`));
const uniqueBatch3Cards = FLASHCARDS.slice(BATCH3_EXISTING_CARD_COUNT).filter(card => {
  const key = `${card.term}|${card.definition}`;
  if (batch3SeenKeys.has(key)) return false;
  batch3SeenKeys.add(key);
  return true;
});
FLASHCARDS.length = BATCH3_EXISTING_CARD_COUNT;
FLASHCARDS.push(...uniqueBatch3Cards);

// Upgrade the original and Batch 2 cards in place without changing their wording.
FLASHCARDS.forEach(card => {
  if (!card.examBoard) card.examBoard = 'general';
  if (!card.subtopic) card.subtopic = card.topic;
  if (!card.difficulty) card.difficulty = 1;
  if (!card.questionType) card.questionType = 'definition';
});

// Attach a small engraved visual to cards that are easier to grasp by SEEING the
// symbol than by reading a description of it (clefs, note values, ledger lines,
// ties/slurs, accidentals). The card's wording is unchanged; this only adds a picture.
const FC_VISUALS = {
  'treble clef': { kind: 'staff', clef: 'treble', notes: [], width: 200 },
  'bass clef': { kind: 'staff', clef: 'bass', notes: [], width: 200 },
  'alto clef': { kind: 'staff', clef: 'alto', notes: [], width: 200 },
  'ledger line': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'C4', label: 'C4' }], width: 200 },
  'semibreve': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'B4', duration: 'semibreve' }], width: 180, showClef: false },
  'minim': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'B4', duration: 'minim', stemDir: 'down' }], width: 180, showClef: false },
  'crotchet': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'B4', duration: 'crotchet', stemDir: 'down' }], width: 180, showClef: false },
  'quaver': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'B4', duration: 'quaver', stemDir: 'down' }], width: 180, showClef: false },
  'semiquaver': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'B4', duration: 'semiquaver', stemDir: 'down' }], width: 180, showClef: false },
  'tie': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'G4', duration: 'minim', tie: true }, { pitch: 'G4', duration: 'crotchet' }], width: 220, showClef: false },
  'slur': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'C5', duration: 'quaver' }, { pitch: 'A4', duration: 'quaver' }, { pitch: 'F4', duration: 'quaver' }], beams: [[0, 2]], slurs: [[0, 2]], width: 220, showClef: false },
  'sharp (♯)': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'F#4', label: 'F♯' }], width: 180 },
  'flat (♭)': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'Bb4', label: 'B♭' }], width: 180 },
  'natural (♮)': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'Fn4', label: 'F♮' }], width: 180 },
  'key signature': { kind: 'staff', clef: 'treble', keySignature: 'D', notes: [], width: 200, caption: 'D major: 2 sharps' },
  'time signature': { kind: 'staff', clef: 'treble', timeSignature: '3/4', notes: [], width: 190 },
  'unison (interval)': { kind: 'staff', clef: 'treble', chordNotes: ['C4', 'C4'], width: 180 },
  'dotted crotchet': { kind: 'staff', clef: 'treble', notes: [{ pitch: 'B4', duration: 'crotchet', dots: 1, stemDir: 'down' }], width: 190, showClef: false }
};
FLASHCARDS.forEach(card => {
  const v = FC_VISUALS[String(card.term).toLowerCase()];
  if (v) card.visual = v;
});

if (typeof window !== 'undefined') window.BATCH3_FLASHCARD_COUNT = FLASHCARDS.length;
