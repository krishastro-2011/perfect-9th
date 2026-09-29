/* ============================================================
   GCSE Music Theory Quest — content-topics.js
   "Learn" and "Examples" content for every core topic.
   Board-specific material lives in content-exam.js and is
   layered on top, clearly labelled.
   ============================================================ */

const TOPICS = [
{
  id: 'notation', title: 'Musical Notation', icon: '🎼',
  blurb: 'Reading the stave, clefs, note names and note values.',
  learn: `
  <p>Written music is a set of instructions. The <strong>stave</strong> (or staff) is five lines and four spaces
  that notes sit on — the higher up the stave a note is, the higher it sounds.</p>
  <h4>Clefs</h4>
  <p>A <strong>clef</strong> tells you which pitches the lines and spaces represent. The <strong>treble clef</strong>
  (<span class="ng" data-ng="treble-clef"></span>) is used for higher-pitched instruments and voices (right hand piano, violin, flute, soprano).
  The <strong>bass clef</strong> (<span class="ng" data-ng="bass-clef"></span>) is used for lower-pitched instruments and voices (left hand piano, cello, tuba, bass).
  The <strong>alto clef</strong> (<span class="ng" data-ng="alto-clef"></span>) is a C clef with middle C on the middle line; it is especially associated with
  viola and is useful for writing middle-range parts without excessive ledger lines.</p>
  <h4>Note names and octaves</h4>
  <p>Pitches are named using the first seven letters of the alphabet: A B C D E F G, then the pattern repeats.
  Each time you go from one letter back to the same letter, you've moved up or down an <strong>octave</strong> —
  the note sounds "the same but higher/lower".</p>
  <h4>Ledger lines</h4>
  <p>When a note is too high or too low to fit on the stave, short extra lines called <strong>ledger lines</strong>
  are added above or below the stave so the note can still be placed correctly.</p>
  <h4>Accidentals</h4>
  <div class="compare">
    <div><strong>♯ Sharp</strong> — raises a note by a semitone.</div>
    <div><strong>♭ Flat</strong> — lowers a note by a semitone.</div>
    <div><strong>♮ Natural</strong> — cancels a previous sharp or flat, returning the note to its normal pitch.</div>
  </div>
  <p><strong>Enharmonic equivalents</strong> are two different names for the same pitch — for example F♯ and G♭
  sound identical on a piano but are spelled differently depending on the key or context.</p>
  <h4>Tone vs semitone</h4>
  <div class="compare-pair">
    <div class="compare-box"><strong>Semitone</strong><p>The smallest distance between two notes in Western music
    (e.g. the distance from any piano key to the very next one, black or white).</p></div>
    <div class="compare-box"><strong>Tone</strong><p>Two semitones put together (e.g. C to D).</p></div>
  </div>
  <h4>Note values (durations)</h4>
  <table class="note-table">
    <tr><th>Symbol</th><th>Name</th><th>Beats (in 4/4)</th></tr>
    <tr><td><span class="ng" data-ng="semibreve"></span></td><td>Semibreve (whole note)</td><td>4</td></tr>
    <tr><td><span class="ng" data-ng="minim"></span></td><td>Minim (half note)</td><td>2</td></tr>
    <tr><td><span class="ng" data-ng="crotchet"></span></td><td>Crotchet (quarter note)</td><td>1</td></tr>
    <tr><td><span class="ng" data-ng="quaver"></span></td><td>Quaver (eighth note)</td><td>½</td></tr>
    <tr><td><span class="ng" data-ng="semiquaver"></span></td><td>Semiquaver (sixteenth note)</td><td>¼</td></tr>
  </table>
  <p>A <strong>dot</strong> after a note adds half of that note's value again — a dotted crotchet (<span class="ng" data-ng="dotted-crotchet"></span>) lasts
  1 + ½ = 1½ beats. <strong>Rests</strong> are silences with matching symbols and durations for every note value.</p>
  <div class="compare-pair">
    <div class="compare-box"><strong>Tie</strong><p>A curved line joining two notes of the <em>same pitch</em>,
    added together into one longer sound.</p></div>
    <div class="compare-box"><strong>Slur</strong><p>A curved line over notes of <em>different pitches</em>,
    telling the performer to play them smoothly connected (legato).</p></div>
  </div>`,
  examples: `
  <p>Middle C (C4) sits on the <strong>first ledger line below</strong> the treble stave, on the <strong>first ledger line above</strong> the bass stave, and on the <strong>middle line</strong> of the alto clef —
  the same key on a piano, written three different ways depending on which clef is being used.</p>
  <div id="notation-example-staff"></div>
  <p>A dotted minim in 3/4 time fills the entire bar: a minim is 2 beats and its dot adds half again (1 beat), making 3 beats.</p>`
},
{
  id: 'rhythm', title: 'Rhythm and Metre', icon: '🥁',
  blurb: 'Pulse, time signatures, simple vs compound, syncopation.',
  learn: `
  <p><strong>Pulse</strong> (or beat) is the steady heartbeat you tap your foot to. <strong>Rhythm</strong> is the
  actual pattern of long and short notes played over that pulse — the pulse can stay perfectly still while the
  rhythm is busy and varied.</p>
  <h4>Time signatures and metre</h4>
  <p>A time signature (like 4/4) sits at the start of a piece. The <strong>top number</strong> tells you how many
  beats are in a bar; the <strong>bottom number</strong> tells you what kind of note counts as one beat
  (4 = crotchet, 8 = quaver). This grouping of beats into regular bars is called <strong>metre</strong>.</p>
  <div class="compare-pair">
    <div class="compare-box"><strong>Simple metre</strong><p>Each beat divides naturally into <em>two</em>.
    Time signatures: 2/4, 3/4, 4/4.</p></div>
    <div class="compare-box"><strong>Compound metre</strong><p>Each beat divides naturally into <em>three</em>.
    Time signatures: 6/8 (2 beats), 9/8 (3 beats), 12/8 (4 beats).</p></div>
  </div>
  <p>A quick trick: in compound time signatures the top number is usually 6, 9 or 12, and you feel the beat as a
  dotted note (e.g. in 6/8 you feel 2 big beats, each worth a dotted crotchet, not 6 small beats).</p>
  <h4>Syncopation, triplets and anacrusis</h4>
  <ul>
    <li><strong>Syncopation</strong> — accenting a note where you wouldn't normally expect the stress, e.g. on an
    off-beat, creating a "pushed" or surprising feel. Common in jazz, funk and reggae.</li>
    <li><strong>Off-beat</strong> — the weaker parts of the beat (the "and" counts), as opposed to the strong,
    on-the-beat counts.</li>
    <li><strong>Triplet</strong> — three notes played in the time normally taken by two, marked with a small "3".</li>
    <li><strong>Anacrusis</strong> (or "pick-up") — one or more notes before the first full bar of a piece,
    e.g. the two notes of "Hap-py" before the first strong beat of "Happy Birthday to you."</li>
    <li><strong>Subdivision</strong> — splitting a beat into smaller equal parts (e.g. splitting a crotchet beat
    into two quavers).</li>
  </ul>`,
  examples: `
  <p>"Happy Birthday" starts with an anacrusis — the two pick-up notes "Hap-py" come <em>before</em> the first full bar,
  and the first strong beat (beat one) lands on "birth-".</p>
  <div id="rhythm-example-strip"></div>
  <p>A reggae guitar "skank" is a classic example of syncopation: the chords are deliberately played on the
  off-beats instead of on the strong beats.</p>`
},
{
  id: 'scales', title: 'Scales and Keys', icon: '🔑',
  blurb: 'Major and minor scales, key signatures, the circle of fifths.',
  learn: `
  <p>A <strong>scale</strong> is a set of notes arranged in order of pitch, built from a specific pattern of
  tones (T) and semitones (S). A <strong>key</strong> tells you which scale/note a piece of music is centred on.</p>
  <h4>Major and minor</h4>
  <div class="compare-pair">
    <div class="compare-box"><strong>Major scale</strong><p>Pattern: T–T–S–T–T–T–S. Often described as sounding
    bright or happy.</p></div>
    <div class="compare-box"><strong>Natural minor scale</strong><p>Pattern: T–S–T–T–S–T–T. Often described as
    sounding darker or sadder.</p></div>
  </div>
  <p>There are two other versions of the minor scale used in GCSE theory:</p>
  <ul>
    <li><strong>Harmonic minor</strong> — natural minor but with a raised 7th degree, creating a distinctive
    gap of a tone-and-a-half between the 6th and 7th notes.</li>
    <li><strong>Melodic minor</strong> — traditionally, the 6th and 7th degrees are raised going up, but return
    to the natural minor coming back down.</li>
  </ul>
  <p>The <strong>chromatic scale</strong> uses all twelve semitones within an octave, moving entirely in semitone steps.</p>
  <h4>Key signatures and the circle of fifths</h4>
  <p>Instead of writing a sharp or flat every time it's needed, composers place all the sharps/flats needed for
  a key together right after the clef — this is the <strong>key signature</strong>. The <strong>circle of fifths</strong>
  is a diagram that arranges all major (and their relative minor) keys in a circle, each one a perfect 5th from
  its neighbour, showing how many sharps or flats each key has.</p>
  <div id="scales-circle-of-fifths"></div>
  <h4>Relative major and minor</h4>
  <p>Every major key has a <strong>relative minor</strong> that shares exactly the same key signature — it starts
  on the 6th degree of the major scale. For example, C major and A minor share no sharps or flats at all.</p>
  <h4>Scale degrees</h4>
  <p>Each note of a scale has a technical name:</p>
  <table class="note-table">
    <tr><th>Degree</th><th>Name</th></tr>
    <tr><td>1</td><td>Tonic</td></tr><tr><td>2</td><td>Supertonic</td></tr>
    <tr><td>3</td><td>Mediant</td></tr><tr><td>4</td><td>Subdominant</td></tr>
    <tr><td>5</td><td>Dominant</td></tr><tr><td>6</td><td>Submediant</td></tr>
    <tr><td>7</td><td>Leading note</td></tr>
  </table>
  <p><strong>Modulation</strong> is when a piece of music changes key partway through, often to a closely related
  key like the dominant or relative minor, to create variety or build tension.</p>`,
  examples: `
  <p>Click around the circle of fifths above: G major has one sharp (F♯) and its relative minor is E minor.
  Moving clockwise adds a sharp each time; moving anticlockwise adds a flat each time.</p>`
},
{
  id: 'intervals', title: 'Intervals', icon: '📏',
  blurb: 'Measuring the distance between two notes.',
  learn: `
  <p>An <strong>interval</strong> is the distance in pitch between two notes. Intervals have a <strong>number</strong>
  (how many letter names the notes span, counting both notes) and a <strong>quality</strong> (major, minor,
  perfect, augmented or diminished).</p>
  <h4>Counting the number</h4>
  <p>Count the letter names inclusively: C to E is a 3rd (C, D, E = 3 letters), C to G is a 5th (C, D, E, F, G = 5 letters).</p>
  <h4>Quality</h4>
  <div class="compare-pair">
    <div class="compare-box"><strong>Perfect intervals</strong><p>Used for unisons, 4ths, 5ths and octaves —
    these sound very "stable" and don't come in major/minor versions.</p></div>
    <div class="compare-box"><strong>Major/minor intervals</strong><p>Used for 2nds, 3rds, 6ths and 7ths.
    A minor interval is one semitone smaller than the equivalent major interval.</p></div>
  </div>
  <p>An <strong>augmented</strong> interval is one semitone larger than perfect or major; a <strong>diminished</strong>
  interval is one semitone smaller than perfect or minor.</p>
  <table class="note-table">
    <tr><th>Interval</th><th>Semitones</th><th>Example</th></tr>
    <tr><td>Unison</td><td>0</td><td>C–C</td></tr>
    <tr><td>Minor 2nd</td><td>1</td><td>C–D♭</td></tr>
    <tr><td>Major 2nd</td><td>2</td><td>C–D</td></tr>
    <tr><td>Minor 3rd</td><td>3</td><td>C–E♭</td></tr>
    <tr><td>Major 3rd</td><td>4</td><td>C–E</td></tr>
    <tr><td>Perfect 4th</td><td>5</td><td>C–F</td></tr>
    <tr><td>Perfect 5th</td><td>7</td><td>C–G</td></tr>
    <tr><td>Minor 6th</td><td>8</td><td>C–A♭</td></tr>
    <tr><td>Major 6th</td><td>9</td><td>C–A</td></tr>
    <tr><td>Minor 7th</td><td>10</td><td>C–B♭</td></tr>
    <tr><td>Major 7th</td><td>11</td><td>C–B</td></tr>
    <tr><td>Octave</td><td>12</td><td>C–C</td></tr>
  </table>
  <div id="intervals-example-staff"></div>
  <p>A helpful method for GCSE questions: count semitones on an imagined keyboard, then check the table above.</p>`,
  examples: `
  <p>C up to E is 4 semitones — a major 3rd. C up to E♭ is 3 semitones — a minor 3rd. Just one semitone
  changes the quality from major to minor, even though the "number" (3rd) stays the same.</p>`
},
{
  id: 'chords', title: 'Chords and Harmony', icon: '🎹',
  blurb: 'Triads, inversions, Roman numerals and cadences.',
  learn: `
  <p>A <strong>chord</strong> is three or more notes played together. The most common chord in GCSE theory is
  the <strong>triad</strong> — three notes stacked in 3rds: a root, a 3rd, and a 5th.</p>
  <h4>Types of triad</h4>
  <table class="note-table">
    <tr><th>Triad</th><th>Built from</th><th>Sound</th></tr>
    <tr><td>Major</td><td>Root, major 3rd, perfect 5th</td><td>Bright, stable</td></tr>
    <tr><td>Minor</td><td>Root, minor 3rd, perfect 5th</td><td>Darker, stable</td></tr>
    <tr><td>Diminished</td><td>Root, minor 3rd, diminished 5th</td><td>Tense, unstable</td></tr>
    <tr><td>Augmented</td><td>Root, major 3rd, augmented 5th</td><td>Unsettled, dreamlike</td></tr>
  </table>
  <h4>Root position and inversions</h4>
  <p>When the root of the chord is the lowest note, the chord is in <strong>root position</strong>. If the 3rd
  is the lowest note it's in <strong>first inversion</strong>; if the 5th is the lowest note it's in
  <strong>second inversion</strong>.</p>
  <h4>Roman numerals</h4>
  <p>Chords built on each scale degree are often labelled with Roman numerals — capital for major, lowercase
  for minor. In a major key: <strong>I</strong> (tonic, major), <strong>ii</strong> (minor), <strong>iii</strong>
  (minor), <strong>IV</strong> (subdominant, major), <strong>V</strong> (dominant, major), <strong>vi</strong>
  (minor), <strong>vii°</strong> (diminished). A <strong>dominant seventh</strong> chord (V7) adds a minor 7th
  on top of the V chord, creating extra pull back to the tonic.</p>
  <h4>Cadences</h4>
  <p>A cadence is a pair of chords that ends a musical phrase, a bit like punctuation in a sentence.</p>
  <div class="compare-pair">
    <div class="compare-box"><strong>Perfect (V–I)</strong><p>Sounds fully finished — like a full stop.</p></div>
    <div class="compare-box"><strong>Plagal (IV–I)</strong><p>Also sounds finished, but softer — the "Amen"
    cadence.</p></div>
    <div class="compare-box"><strong>Imperfect (ending on V)</strong><p>Sounds unfinished — like a comma.</p></div>
    <div class="compare-box"><strong>Interrupted (V–vi)</strong><p>Sets up an ending, then "surprises" you by
    moving somewhere unexpected.</p></div>
  </div>
  <div id="chords-example-staff"></div>`,
  examples: `
  <p>In C major: I = C major (C-E-G), IV = F major (F-A-C), V = G major (G-B-D), vi = A minor (A-C-E).
  A perfect cadence in C major is G major → C major (V–I).</p>`
},
{
  id: 'elements', title: 'Dynamics, Tempo & Articulation', icon: '🎚️',
  blurb: 'How loud, how fast, and how notes are played.',
  learn: `
  <h4>Dynamics — how loud or quiet</h4>
  <table class="note-table">
    <tr><th>Symbol</th><th>Term</th><th>Meaning</th></tr>
    <tr><td>pp</td><td>Pianissimo</td><td>Very quiet</td></tr>
    <tr><td>p</td><td>Piano</td><td>Quiet</td></tr>
    <tr><td>mp</td><td>Mezzo-piano</td><td>Moderately quiet</td></tr>
    <tr><td>mf</td><td>Mezzo-forte</td><td>Moderately loud</td></tr>
    <tr><td>f</td><td>Forte</td><td>Loud</td></tr>
    <tr><td>ff</td><td>Fortissimo</td><td>Very loud</td></tr>
  </table>
  <p><strong>Crescendo</strong> = gradually getting louder. <strong>Diminuendo/decrescendo</strong> = gradually
  getting quieter. <strong>Subito</strong> means "suddenly" (e.g. subito piano = suddenly quiet).</p>
  <h4>Tempo — how fast or slow</h4>
  <table class="note-table">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Largo</td><td>Very slow, broad</td></tr>
    <tr><td>Adagio</td><td>Slow</td></tr>
    <tr><td>Andante</td><td>At a walking pace</td></tr>
    <tr><td>Moderato</td><td>Moderate speed</td></tr>
    <tr><td>Allegro</td><td>Fast</td></tr>
    <tr><td>Presto</td><td>Very fast</td></tr>
  </table>
  <p><strong>Accelerando</strong> = gradually speed up. <strong>Ritardando/rallentando</strong> = gradually slow
  down. <strong>Rubato</strong> = a flexible, expressive bending of strict tempo.</p>
  <div class="compare-pair">
    <div class="compare-box"><strong>Tempo</strong><p>How fast the pulse goes.</p></div>
    <div class="compare-box"><strong>Rhythm</strong><p>The pattern of note lengths — independent of how fast
    or slow the tempo is.</p></div>
  </div>
  <h4>Articulation — how a note is played</h4>
  <div class="compare-pair">
    <div class="compare-box"><strong>Staccato</strong><p>Short and detached (marked with a dot).</p></div>
    <div class="compare-box"><strong>Legato / Slur</strong><p>Smooth and connected.</p></div>
    <div class="compare-box"><strong>Accent</strong><p>A stronger, more forceful attack on one note.</p></div>
    <div class="compare-box"><strong>Tenuto</strong><p>Held for its full length, slightly stressed.</p></div>
    <div class="compare-box"><strong>Marcato</strong><p>Marked, strongly accented.</p></div>
  </div>`,
  examples: `
  <p>A gradual crescendo from p to ff over eight bars, followed by a sudden subito piano, is a classic dramatic
  device used throughout Classical and Romantic music.</p>`
},
{
  id: 'texture', title: 'Texture', icon: '🧶',
  blurb: 'How many layers/lines of music are happening, and how they relate.',
  learn: `
  <p><strong>Texture</strong> describes how many layers of sound are happening and how they relate to each other.</p>
  <div class="compare-pair">
    <div class="compare-box"><strong>Monophonic</strong><p>A single melodic line, with no accompaniment or
    harmony at all — e.g. one singer, unaccompanied.</p></div>
    <div class="compare-box"><strong>Homophonic</strong><p>A melody with chordal accompaniment underneath — the
    most common texture in pop and hymn music.</p></div>
    <div class="compare-box"><strong>Polyphonic (contrapuntal)</strong><p>Two or more independent melodic lines
    happening at the same time, each equally important.</p></div>
    <div class="compare-box"><strong>Heterophonic</strong><p>Multiple performers play the same basic melody but
    with small individual variations at the same time — common in some folk and non-Western traditions.</p></div>
  </div>
  <p><strong>Unison</strong> is when everyone plays or sings exactly the same notes at the same time.
  <strong>Melody and accompaniment</strong> is another way of describing a homophonic texture: one clear tune
  supported by other parts.</p>
  <h4>Counterpoint and imitation</h4>
  <p><strong>Counterpoint</strong> is the technique of combining two or more independent melodic lines (creating
  polyphonic texture). <strong>Imitation</strong> is when one part copies a melodic idea shortly after another
  part has played it — like a round or canon (e.g. "Frère Jacques").</p>`,
  examples: `
  <p>A solo unaccompanied folk singer = monophonic. A pop song with vocals over guitar chords = homophonic.
  A Bach fugue with several independent melodic lines weaving together = polyphonic.</p>`
},
{
  id: 'melody', title: 'Melody', icon: '🎵',
  blurb: 'Shape, movement and recurring ideas in a tune.',
  learn: `
  <p>A <strong>melody</strong> is a memorable, organised sequence of pitches — what most people think of as "the tune".</p>
  <div class="compare-pair">
    <div class="compare-box"><strong>Conjunct / stepwise</strong><p>Moving mostly by small steps (2nds) between
    neighbouring notes — sounds smooth.</p></div>
    <div class="compare-box"><strong>Disjunct</strong><p>Moving by leaps (bigger intervals) — sounds more angular
    and dramatic.</p></div>
  </div>
  <p>The <strong>contour</strong> of a melody is its overall shape — rising, falling, arching, or staying still —
  when you picture it as a line.</p>
  <h4>Recurring ideas</h4>
  <div class="compare-pair">
    <div class="compare-box"><strong>Motif</strong><p>A short, distinctive musical idea (rhythm and/or pitch)
    that is developed and returns throughout a piece — e.g. the famous four-note opening of Beethoven's 5th
    Symphony.</p></div>
    <div class="compare-box"><strong>Riff</strong><p>A short repeated pattern, usually in popular/rock music,
    that generally stays the same each time it returns (rather than being developed).</p></div>
    <div class="compare-box"><strong>Ostinato</strong><p>A short musical pattern (rhythmic, melodic, or both)
    repeated persistently, often underneath other changing material.</p></div>
  </div>
  <p><strong>Sequence</strong> is when a short melodic idea is immediately repeated at a higher or lower pitch.
  <strong>Repetition</strong> is repeating an idea at the exact same pitch. <strong>Call and response</strong> is
  when one phrase (the "call") is answered by another phrase (the "response"), often between different
  performers or groups.</p>`,
  examples: `
  <p>"Twinkle Twinkle Little Star" moves mostly conjunctly (by step); a bugle call moves entirely disjunctly
  because a bugle can only play notes from the harmonic series (wide leaps).</p>`
},
{
  id: 'form', title: 'Form and Structure', icon: '🏛️',
  blurb: 'How a piece of music is organised into sections.',
  learn: `
  <p><strong>Form</strong> (or structure) is how a piece of music is organised into sections, often labelled
  with letters to show which sections repeat, contrast, or vary.</p>
  <table class="note-table">
    <tr><th>Form</th><th>Pattern</th><th>Description</th></tr>
    <tr><td>Binary</td><td>AB</td><td>Two contrasting sections, often each repeated.</td></tr>
    <tr><td>Ternary</td><td>ABA</td><td>An opening section, a contrasting middle section, then a return to the
    opening.</td></tr>
    <tr><td>Rondo</td><td>ABACA</td><td>A recurring main theme (A) alternating with contrasting episodes.</td></tr>
    <tr><td>Theme and variations</td><td>A, A1, A2…</td><td>A theme is stated, then altered repeatedly (in
    rhythm, key, texture etc.) while staying recognisable.</td></tr>
    <tr><td>Strophic</td><td>AAAA…</td><td>The same music repeated for every verse, with new words each time
    (common in hymns and folk songs).</td></tr>
    <tr><td>Through-composed</td><td>ABCD…</td><td>Continuously new music throughout, with no large-scale
    repetition.</td></tr>
    <tr><td>12-bar blues</td><td>I-I-I-I-IV-IV-I-I-V-IV-I-I</td><td>A 12-bar chord pattern that repeats
    throughout a blues song.</td></tr>
    <tr><td>Verse/chorus</td><td>Verse–Chorus–Verse–Chorus…</td><td>The standard pop song structure, often with
    a bridge or middle 8 for contrast.</td></tr>
  </table>
  <p><strong>Sonata form</strong> is a large-scale structure common in the first movements of Classical
  symphonies: an Exposition (presenting themes), a Development (exploring/transforming them), and a
  Recapitulation (themes return). <strong>Minuet and trio</strong> is a dance-based ternary form (Minuet–Trio–Minuet)
  common in Classical suites and symphonies. A <strong>ground bass</strong> is a short bass-line pattern that
  repeats continuously while the melody above it changes.</p>
  <h4>Song-form vocabulary</h4>
  <p><strong>Introduction</strong> (opens the piece, often instrumental) → <strong>verse</strong> (tells the
  story, same music/different words each time) → <strong>chorus</strong> (the memorable, repeated "hook"
  section) → <strong>bridge/middle 8</strong> (a contrasting section, usually appearing once, that provides
  relief before the final chorus) → <strong>coda</strong> (a closing section that rounds the piece off).</p>
  <div id="form-example-diagram"></div>`,
  examples: `
  <p>Most Classical minuets are in ternary form (ABA); most pop songs use verse/chorus form; Pachelbel's Canon
  is built over a ground bass repeated many times.</p>`
},
{
  id: 'accompaniment', title: 'Accompaniment Techniques', icon: '🎸',
  blurb: 'Common ways of supporting a melody.',
  learn: `
  <p>An <strong>accompaniment</strong> supports the main melody, usually providing harmony and rhythm underneath it.</p>
  <ul>
    <li><strong>Alberti bass</strong> — a broken-chord accompaniment pattern (low-high-middle-high) very common
    in Classical piano music, giving continuous movement without being melodically distracting.</li>
    <li><strong>Broken chords</strong> — the notes of a chord played one after another (rather than all
    together) in a repeating pattern.</li>
    <li><strong>Arpeggios</strong> — the notes of a chord played in strict order (usually low to high or back
    down), a specific type of broken chord.</li>
    <li><strong>Walking bass</strong> — a bass line that moves in continuous, mostly stepwise crotchets,
    common in jazz and blues, "walking" from chord to chord.</li>
    <li><strong>Drone</strong> — one or two notes sustained continuously underneath changing melodic material,
    common in bagpipe music and some folk/world traditions.</li>
    <li><strong>Pedal note (pedal point)</strong> — similar to a drone but used within Western classical
    harmony, usually on the tonic or dominant, sustained while the harmony above changes and sometimes clashes
    with it before resolving.</li>
    <li><strong>Ostinato</strong> — a short repeated pattern (see Melody topic) can also serve as an
    accompaniment layer.</li>
    <li><strong>Chordal accompaniment</strong> — block chords played under the melody, simple and direct.</li>
  </ul>`,
  examples: `
  <p>Mozart's piano sonatas frequently use Alberti bass in the left hand while the right hand plays the melody.
  Bagpipe music almost always features a continuous drone.</p>`
},
{
  id: 'transposition', title: 'Transposition', icon: '🔁',
  blurb: 'Moving music to a different pitch or key.',
  learn: `
  <p><strong>Transposition</strong> means moving a melody or piece of music up or down by a consistent interval,
  so every note shifts by the same amount while the pattern of tones and semitones (and therefore the tune)
  stays exactly the same relative to itself.</p>
  <p>To transpose correctly you move every note by the same interval, and if needed you'll also need a
  different key signature to keep the same pattern of tones/semitones in the new key.</p>
  <h4>Transposing instruments</h4>
  <p>Some instruments are "transposing instruments" — when they read and play a written C, the pitch that
  actually sounds is different. This is called the difference between <strong>written pitch</strong> (what's on
  the page) and <strong>sounding pitch</strong> (what you actually hear). For example, a B♭ clarinet sounds a
  major 2nd lower than what is written, so the player and the rest of the ensemble can read comfortable,
  simple key signatures even when the concert pitch is more awkward.</p>
  <p>Composers use transposition to fit a melody into a singer's vocal range, to make a piece easier for a
  transposing instrument to read, or to shift a whole passage into a new key for variety (see also
  Modulation, in Scales and Keys).</p>`,
  examples: `
  <p>Transposing "Frère Jacques" from C major up a perfect 4th moves it into F major — every note moves up by
  the same distance, so it still sounds like exactly the same tune, just higher.</p>`
},
{
  id: 'instruments', title: 'Instruments and Voices', icon: '🎻',
  blurb: 'Orchestral families, voice types and choral terms.',
  learn: `
  <h4>The orchestral families</h4>
  <div class="compare-pair">
    <div class="compare-box"><strong>Strings</strong><p>Violin, viola, cello, double bass. Sound is produced by
    bowing or plucking (pizzicato) strings.</p></div>
    <div class="compare-box"><strong>Woodwind</strong><p>Flute, oboe, clarinet, bassoon. Sound is produced by
    blowing across or through a reed/mouth-hole.</p></div>
    <div class="compare-box"><strong>Brass</strong><p>Trumpet, trombone, French horn, tuba. Sound is produced
    by "buzzing" the lips into a metal mouthpiece.</p></div>
    <div class="compare-box"><strong>Percussion</strong><p>Timpani, snare drum, bass drum, cymbals, xylophone.
    Sound is produced by striking, shaking or scraping.</p></div>
  </div>
  <h4>Voice types (high to low)</h4>
  <p><strong>Soprano</strong> (highest female voice) → <strong>Alto</strong> (lower female voice) →
  <strong>Tenor</strong> (higher male voice) → <strong>Bass</strong> (lowest male voice). Together these four
  parts are known by the abbreviation <strong>SATB</strong>, the standard layout of choral music.</p>
  <ul>
    <li><strong>Falsetto</strong> — a male singing technique used to reach notes above their normal vocal range.</li>
    <li><strong>Melisma</strong> — singing many different notes across a single syllable of text.</li>
    <li><strong>Syllabic</strong> — the opposite of melisma: one note per syllable of text.</li>
    <li><strong>A cappella</strong> — singing with no instrumental accompaniment at all.</li>
  </ul>`,
  examples: `
  <p>A string quartet = 2 violins, viola, cello. A brass fanfare typically features trumpets prominently for
  their bright, penetrating tone. Melisma is heard extensively in gospel and R&B vocal riffs.</p>`
},
{
  id: 'vocabulary', title: 'Musical Vocabulary', icon: '📚',
  blurb: 'Common Italian performance terms.',
  learn: `
  <p>Many performance instructions in Western notation are written in Italian, a tradition dating back to the
  Baroque period. Here are common terms used across all exam boards:</p>
  <table class="note-table">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Dolce</td><td>Sweetly</td></tr>
    <tr><td>Cantabile</td><td>In a singing style</td></tr>
    <tr><td>Maestoso</td><td>Majestically</td></tr>
    <tr><td>Con brio</td><td>With vigour/spirit</td></tr>
    <tr><td>Espressivo</td><td>Expressively</td></tr>
    <tr><td>Con moto</td><td>With movement</td></tr>
    <tr><td>Sempre</td><td>Always/continuing</td></tr>
    <tr><td>Poco a poco</td><td>Little by little</td></tr>
    <tr><td>Solo</td><td>Played/sung by one performer alone</td></tr>
    <tr><td>Tutti</td><td>All performers playing together</td></tr>
  </table>
  <p>These terms are often combined, e.g. "sempre cantabile" (always in a singing style), or "poco a poco
  crescendo" (getting louder little by little).</p>`,
  examples: `
  <p>A solo cello melody marked "espressivo, cantabile" is asking the player for an expressive, singing tone —
  the opposite mood to a "marcato, con brio" brass passage.</p>`
},
{
  id: 'listening', title: 'Listening and Aural Skills', icon: '👂',
  blurb: 'Identifying what you hear — the Listening Lab.',
  learn: `
  <p>GCSE listening exams ask you to identify musical features by ear: instruments, tempo, dynamics, texture,
  major/minor, structure and more, usually from short unfamiliar extracts. The best preparation is regular,
  focused practice — that's exactly what the <strong>Listening Lab</strong> in this app is for.</p>
  <h4>What to listen for</h4>
  <ul>
    <li><strong>Major vs minor</strong> — does the extract sound bright/happy (major) or darker/sadder (minor)?</li>
    <li><strong>Tempo and dynamics</strong> — is it fast/slow, loud/quiet, and does either change during the extract?</li>
    <li><strong>Texture</strong> — one line, melody+chords, or several independent lines woven together?</li>
    <li><strong>Instruments/voices</strong> — which family, and can you identify the specific instrument by its tone colour?</li>
    <li><strong>Structure</strong> — can you hear a section return, or hear clear contrasting sections?</li>
    <li><strong>Cadences</strong> — does a phrase sound "finished" (perfect/plagal) or "unfinished" (imperfect)?</li>
  </ul>
  <p>Use the Listening Lab to play notes, intervals, chords, scales and short cadence progressions, then
  practise naming what you heard — exactly the skill tested in the exam.</p>`,
  examples: `
  <p>Try the Listening Lab now: play a major and then a minor triad back to back and notice the difference in
  mood created by just one note (the 3rd) moving down a semitone.</p>`
},
{
  id: 'genre', title: 'Genre and Style', icon: '🌍',
  blurb: 'Broad musical periods, genres and traditions.',
  learn: `
  <p>Knowing the broad features of different musical periods and genres helps you make sense of listening
  extracts and set works. This is general context — always check which specific genres and set works your
  own exam board requires.</p>
  <table class="note-table">
    <tr><th>Period/genre</th><th>Roughly when</th><th>Typical features</th></tr>
    <tr><td>Baroque</td><td>c.1600–1750</td><td>Terraced dynamics, continuous rhythmic drive, harpsichord/organ,
    ornamentation, counterpoint.</td></tr>
    <tr><td>Classical</td><td>c.1750–1820</td><td>Balanced phrases, homophonic texture, sonata form, clear
    structure, dynamic contrast (crescendo/diminuendo).</td></tr>
    <tr><td>Romantic</td><td>c.1820–1900</td><td>Expressive rubato, larger orchestras, wide dynamic range,
    programme music, chromatic harmony.</td></tr>
    <tr><td>20th/21st-century art music</td><td>c.1900–present</td><td>Wide variety: atonality, minimalism,
    extended techniques, electronic elements.</td></tr>
    <tr><td>Popular music</td><td>c.1950s–present</td><td>Verse/chorus form, riffs and hooks, amplified
    instruments, production/technology.</td></tr>
    <tr><td>Jazz</td><td>c.1900s–present</td><td>Improvisation, syncopation, swung rhythms, walking bass,
    extended/altered chords.</td></tr>
    <tr><td>Blues</td><td>c.1900s–present</td><td>12-bar structure, blue notes (flattened 3rd/5th/7th), call
    and response.</td></tr>
    <tr><td>Film/game music</td><td>c.1930s–present</td><td>Leitmotifs (recurring themes for characters/ideas),
    music that supports on-screen action and emotion.</td></tr>
    <tr><td>World/fusion music</td><td>Ongoing</td><td>Traditions from specific cultures (e.g. drones,
    heterophony, non-Western scales), sometimes blended ("fusion") with other genres.</td></tr>
  </table>`,
  examples: `
  <p>A Baroque concerto typically alternates loud and soft sections abruptly (terraced dynamics) rather than
  gradually — quite different from the sweeping, gradual crescendos typical of the Romantic period.</p>`
}
];

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
