/* ============================================================
   GCSE Music Theory Quest — content-flashcards.js
   Flashcard deck: term -> definition, tagged by topic.
   ============================================================ */

const FLASHCARD_DATA = [
  // Notation
  ['notation', 'Stave (staff)', 'Five lines and four spaces that notes are written on.'],
  ['notation', 'Treble clef', 'The clef used for higher pitches — e.g. violin, flute, right hand piano.'],
  ['notation', 'Bass clef', 'The clef used for lower pitches — e.g. cello, tuba, left hand piano.'],
  ['notation', 'Ledger line', 'A short extra line added above or below the stave for notes outside its range.'],
  ['notation', 'Sharp (♯)', 'Raises a note by a semitone.'],
  ['notation', 'Flat (♭)', 'Lowers a note by a semitone.'],
  ['notation', 'Natural (♮)', 'Cancels a previous sharp or flat.'],
  ['notation', 'Enharmonic equivalent', 'Two different names for the same pitch, e.g. F♯ and G♭.'],
  ['notation', 'Semitone', 'The smallest interval in Western music.'],
  ['notation', 'Tone', 'Two semitones added together.'],
  ['notation', 'Semibreve', 'A note worth 4 beats in simple time — an open oval notehead with no stem.'],
  ['notation', 'Minim', 'A note worth 2 beats in simple time — an open oval notehead with a stem.'],
  ['notation', 'Crotchet', 'A note worth 1 beat in simple time — a solid notehead with a stem.'],
  ['notation', 'Quaver', 'A note worth ½ a beat in simple time — a solid notehead, stem and one flag.'],
  ['notation', 'Semiquaver', 'A note worth ¼ of a beat in simple time — a solid notehead, stem and two flags.'],
  ['notation', 'Dotted note', 'A note whose value is increased by half again (dot adds 50%).'],
  ['notation', 'Rest', 'A symbol showing a specific length of silence.'],
  ['notation', 'Tie', 'A curved line joining two notes of the same pitch into one longer sound.'],
  ['notation', 'Slur', 'A curved line over notes of different pitches, asking for smooth (legato) playing.'],

  // Rhythm
  ['rhythm', 'Pulse', 'The steady, repeating beat underlying music.'],
  ['rhythm', 'Metre', 'The regular grouping of beats into bars.'],
  ['rhythm', 'Simple metre', 'Time signatures where each beat divides into 2 (e.g. 2/4, 3/4, 4/4).'],
  ['rhythm', 'Compound metre', 'Time signatures where each beat divides into 3 (e.g. 6/8, 9/8, 12/8).'],
  ['rhythm', 'Syncopation', 'Accenting a note where it isn\u2019t normally expected, e.g. an off-beat.'],
  ['rhythm', 'Triplet', 'Three notes fitted into the time of two.'],
  ['rhythm', 'Anacrusis', 'One or more notes before the first full bar of a piece (a "pick-up").'],
  ['rhythm', 'Off-beat', 'The weaker, "and" parts of the beat.'],
  ['rhythm', 'Subdivision', 'Splitting a beat into smaller equal parts.'],

  // Scales and keys
  ['scales', 'Major scale', 'Scale with the pattern T-T-S-T-T-T-S, often sounding bright.'],
  ['scales', 'Natural minor scale', 'Scale with the pattern T-S-T-T-S-T-T, often sounding dark.'],
  ['scales', 'Harmonic minor scale', 'Natural minor with a raised 7th degree.'],
  ['scales', 'Melodic minor scale', 'Raised 6th and 7th ascending; natural minor descending.'],
  ['scales', 'Chromatic scale', 'A scale using all 12 semitones within an octave.'],
  ['scales', 'Key signature', 'The sharps/flats shown after the clef, applying throughout a piece.'],
  ['scales', 'Circle of fifths', 'A diagram arranging keys by ascending/descending 5ths, showing sharps/flats.'],
  ['scales', 'Relative minor', 'The minor key sharing the same key signature as a major key, starting on its 6th degree.'],
  ['scales', 'Tonic', 'The 1st degree of a scale — the "home" note.'],
  ['scales', 'Supertonic', 'The 2nd degree of a scale.'],
  ['scales', 'Mediant', 'The 3rd degree of a scale.'],
  ['scales', 'Subdominant', 'The 4th degree of a scale.'],
  ['scales', 'Dominant', 'The 5th degree of a scale.'],
  ['scales', 'Submediant', 'The 6th degree of a scale.'],
  ['scales', 'Leading note', 'The 7th degree of a scale, pulling strongly back to the tonic.'],
  ['scales', 'Modulation', 'A change of key within a piece of music.'],

  // Intervals
  ['intervals', 'Interval', 'The distance in pitch between two notes.'],
  ['intervals', 'Perfect interval', 'Quality used for unisons, 4ths, 5ths and octaves.'],
  ['intervals', 'Major interval', 'A 2nd, 3rd, 6th or 7th one semitone larger than the minor version.'],
  ['intervals', 'Minor interval', 'A 2nd, 3rd, 6th or 7th one semitone smaller than the major version.'],
  ['intervals', 'Augmented interval', 'One semitone larger than perfect or major.'],
  ['intervals', 'Diminished interval', 'One semitone smaller than perfect or minor.'],
  ['intervals', 'Unison (interval)', 'Two notes of the same pitch (0 semitones apart).'],
  ['intervals', 'Octave', 'Two notes of the same letter name, 12 semitones apart.'],

  // Chords
  ['chords', 'Triad', 'A three-note chord built in 3rds: root, 3rd and 5th.'],
  ['chords', 'Major triad', 'Root, major 3rd, perfect 5th — a bright, stable sound.'],
  ['chords', 'Minor triad', 'Root, minor 3rd, perfect 5th — a darker, stable sound.'],
  ['chords', 'Diminished triad', 'Root, minor 3rd, diminished 5th — a tense, unstable sound.'],
  ['chords', 'Augmented triad', 'Root, major 3rd, augmented 5th — an unsettled, dreamlike sound.'],
  ['chords', 'Root position', 'A chord with its root as the lowest note.'],
  ['chords', 'First inversion', 'A chord with its 3rd as the lowest note.'],
  ['chords', 'Second inversion', 'A chord with its 5th as the lowest note.'],
  ['chords', 'Roman numerals (chords)', 'Labels for chords built on each scale degree — capital = major, lowercase = minor.'],
  ['chords', 'Dominant seventh', 'The V chord with an added minor 7th above the root — extra pull to the tonic.'],
  ['chords', 'Perfect cadence', 'V–I: sounds fully finished.'],
  ['chords', 'Plagal cadence', 'IV–I: also finished, softer — the "Amen" cadence.'],
  ['chords', 'Imperfect cadence', 'Ends on V — sounds unfinished.'],
  ['chords', 'Interrupted cadence', 'V–vi: sets up an ending, then surprises by moving elsewhere.'],

  // Elements
  ['elements', 'pp (pianissimo)', 'Very quiet.'],
  ['elements', 'p (piano)', 'Quiet.'],
  ['elements', 'mp (mezzo-piano)', 'Moderately quiet.'],
  ['elements', 'mf (mezzo-forte)', 'Moderately loud.'],
  ['elements', 'f (forte)', 'Loud.'],
  ['elements', 'ff (fortissimo)', 'Very loud.'],
  ['elements', 'Crescendo', 'Gradually getting louder.'],
  ['elements', 'Diminuendo / decrescendo', 'Gradually getting quieter.'],
  ['elements', 'Subito', '"Suddenly" — e.g. subito piano = suddenly quiet.'],
  ['elements', 'Largo', 'Very slow, broad tempo.'],
  ['elements', 'Adagio', 'Slow tempo.'],
  ['elements', 'Andante', 'A walking-pace tempo.'],
  ['elements', 'Moderato', 'Moderate tempo.'],
  ['elements', 'Allegro', 'Fast tempo.'],
  ['elements', 'Presto', 'Very fast tempo.'],
  ['elements', 'Accelerando', 'Gradually speeding up.'],
  ['elements', 'Ritardando / rallentando', 'Gradually slowing down.'],
  ['elements', 'Rubato', 'A flexible, expressive bending of strict tempo.'],
  ['elements', 'Staccato', 'Short and detached articulation.'],
  ['elements', 'Legato', 'Smooth, connected articulation.'],
  ['elements', 'Accent', 'A stronger, more forceful attack on a note.'],
  ['elements', 'Tenuto', 'Held for full length, slightly stressed.'],
  ['elements', 'Marcato', 'Marked, strongly accented.'],

  // Texture
  ['texture', 'Monophonic', 'A single melodic line, with no other parts at all.'],
  ['texture', 'Homophonic', 'A melody with chordal accompaniment underneath.'],
  ['texture', 'Polyphonic', 'Two or more independent, equally important melodic lines together.'],
  ['texture', 'Heterophonic', 'Performers share a basic melody but with individual simultaneous variations.'],
  ['texture', 'Unison (texture)', 'Every performer playing or singing exactly the same notes at the same pitch, at the same time.'],
  ['texture', 'Counterpoint', 'The technique of combining independent melodic lines.'],
  ['texture', 'Imitation', 'One part copying an idea shortly after another part introduced it.'],

  // Melody
  ['melody', 'Conjunct movement', 'Melodic movement mostly by step.'],
  ['melody', 'Disjunct movement', 'Melodic movement mostly by leap.'],
  ['melody', 'Contour', 'The overall shape of a melody — rising, falling, arching.'],
  ['melody', 'Motif', 'A short, distinctive idea that recurs and develops through a piece.'],
  ['melody', 'Riff', 'A short repeated pattern, typically unchanged, in popular music.'],
  ['melody', 'Ostinato', 'A short pattern repeated persistently.'],
  ['melody', 'Sequence', 'A melodic idea immediately repeated at a new pitch level.'],
  ['melody', 'Repetition', 'Repeating an idea at the exact same pitch.'],
  ['melody', 'Call and response', 'A phrase (call) answered by another phrase (response).'],

  // Form
  ['form', 'Binary form', 'Two contrasting sections: AB.'],
  ['form', 'Ternary form', 'Opening, contrast, then return: ABA.'],
  ['form', 'Rondo form', 'A recurring theme alternating with episodes: ABACA.'],
  ['form', 'Theme and variations', 'A theme stated, then altered repeatedly while staying recognisable.'],
  ['form', 'Strophic form', 'Identical music repeated for every verse, new words each time.'],
  ['form', 'Through-composed', 'Continuously new music, no large-scale repeats.'],
  ['form', '12-bar blues', 'A repeating 12-bar chord pattern used in blues.'],
  ['form', 'Sonata form', 'Exposition, Development, Recapitulation — common in Classical first movements.'],
  ['form', 'Minuet and trio', 'A ternary dance form: Minuet–Trio–Minuet.'],
  ['form', 'Ground bass', 'A short bass pattern repeating while the melody above changes.'],
  ['form', 'Verse', 'A song section telling the story, same music/different words each time.'],
  ['form', 'Chorus', 'The memorable, repeated "hook" section of a song.'],
  ['form', 'Bridge / middle 8', 'A contrasting section appearing usually once, before the final chorus.'],
  ['form', 'Coda', 'A closing section that rounds the piece off.'],

  // Accompaniment
  ['accompaniment', 'Alberti bass', 'A broken-chord pattern (low-high-middle-high) common in Classical piano.'],
  ['accompaniment', 'Broken chords', 'Notes of a chord played one after another rather than together.'],
  ['accompaniment', 'Arpeggio', 'The notes of a chord played individually in strict order.'],
  ['accompaniment', 'Walking bass', 'A stepwise, continuous crotchet bass line, common in jazz/blues.'],
  ['accompaniment', 'Drone', 'Sustained note(s) held continuously beneath the melody.'],
  ['accompaniment', 'Pedal note (pedal point)', 'A sustained note (often tonic/dominant) held while harmony above changes.'],
  ['accompaniment', 'Chordal accompaniment', 'Simple block chords played under a melody.'],

  // Transposition
  ['transposition', 'Transposition', 'Moving music to a different pitch/key, keeping the same interval pattern.'],
  ['transposition', 'Transposing instrument', 'An instrument whose written pitch differs from its sounding pitch.'],
  ['transposition', 'Written pitch', 'The pitch shown on the page for a transposing instrument.'],
  ['transposition', 'Sounding pitch', 'The pitch that is actually heard when a transposing instrument plays.'],

  // Instruments and voices
  ['instruments', 'Strings family', 'Violin, viola, cello, double bass — sound from bowed/plucked strings.'],
  ['instruments', 'Woodwind family', 'Flute, oboe, clarinet, bassoon — sound from blowing air.'],
  ['instruments', 'Brass family', 'Trumpet, trombone, French horn, tuba — sound from buzzing lips.'],
  ['instruments', 'Percussion family', 'Timpani, snare drum, cymbals, xylophone — sound from striking/shaking.'],
  ['instruments', 'Soprano', 'The highest standard female voice type.'],
  ['instruments', 'Alto', 'A lower female voice type.'],
  ['instruments', 'Tenor', 'A higher male voice type.'],
  ['instruments', 'Bass (voice)', 'The lowest standard male voice type.'],
  ['instruments', 'SATB', 'Soprano, Alto, Tenor, Bass — the standard choral layout.'],
  ['instruments', 'Falsetto', 'A technique letting male singers reach notes above their normal range.'],
  ['instruments', 'Melisma', 'Singing many notes across a single syllable of text.'],
  ['instruments', 'Syllabic', 'Singing one note per syllable of text.'],
  ['instruments', 'A cappella', 'Singing with no instrumental accompaniment.'],

  // Vocabulary
  ['vocabulary', 'Dolce', 'Sweetly.'],
  ['vocabulary', 'Cantabile', 'In a singing style.'],
  ['vocabulary', 'Maestoso', 'Majestically.'],
  ['vocabulary', 'Con brio', 'With vigour/spirit.'],
  ['vocabulary', 'Espressivo', 'Expressively.'],
  ['vocabulary', 'Con moto', 'With movement.'],
  ['vocabulary', 'Sempre', 'Always/continuing.'],
  ['vocabulary', 'Poco a poco', 'Little by little.'],
  ['vocabulary', 'Solo', 'Played/sung by one performer alone.'],
  ['vocabulary', 'Tutti', 'All performers playing together.'],

  // Genre
  ['genre', 'Baroque', 'c.1600–1750: terraced dynamics, continuous drive, counterpoint.'],
  ['genre', 'Classical (period)', 'c.1750–1820: balance, clarity, homophonic texture, sonata form.'],
  ['genre', 'Romantic', 'c.1820–1900: expressive rubato, big orchestras, programme music.'],
  ['genre', 'Leitmotif', 'A recurring theme representing a character or idea, especially in film music.'],
  ['genre', 'Blue note', 'A flattened 3rd, 5th or 7th, characteristic of blues.'],
  ['genre', 'Fusion', 'Blending different musical traditions or genres together.'],
  ['genre', 'Programme music', 'Instrumental music that tells a story or depicts a scene.'],
  ['genre', 'Terraced dynamics', 'Abrupt shifts between loud and soft, typical of Baroque music.']
];

const FLASHCARDS = FLASHCARD_DATA.map((row, i) => ({
  id: `fc-${i}`, topic: row[0], term: row[1], definition: row[2]
}));
