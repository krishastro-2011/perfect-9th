# 🎼 Perfect 9th

A self-contained, offline learning game for GCSE Music Theory revision — no
backend and no build step. Accounts (email + username + password) keep the
learning studio private on the current browser; nothing is sent anywhere.

## How to run it

Just open **`index.html`** in any modern browser (Chrome, Edge, Firefox, Safari).
Double-click the file, or drag it into a browser window. That's it.

Your account, XP, streaks, mastery, flashcard progress and mistake history are
saved in your browser via `localStorage`, so they remain available next time
you open the file on the same device/browser. The app works fully offline —
the only exception is the optional Google Fonts stylesheet link in
`index.html`, which just falls back to your system font if you're offline.
All music notation (clefs, noteheads, accidentals, rests) is drawn as vector
graphics rather than relying on a font, so it looks identical on every device
and works offline too.

## First-time welcome

The very first time this browser ever completes an account (signing up, or
finishing the legacy-account upgrade), a slow, cinematic "system boot"
sequence plays before the app appears: a single point of light growing out
of total darkness, a real recorded narrator, a dry aside, a metallic title
reveal, then identity creation (avatar + username) — before the cinematic
layer physically assembles into, and dissolves to reveal, the real
homepage underneath. It never plays again afterwards, skip is always
available top-right, and it can be replayed any time from **Settings →
your account → "Replay welcome intro."**

### Files involved
- `js/welcome-intro.js` — the sequence itself: the two full scripts (normal
  and `prefers-reduced-motion`), the boot-light opening, the avatar and
  username scenes, the closing homepage-transform sequence, and the public
  `WelcomeIntro.play()` entry point.
- `js/narration.js` — the spoken-line script and the real-audio player.
- `js/auth.js` — `enterApp()` (the one choke point every successful
  signup/login/reset passes through) plus the whole avatar system:
  `defaultAvatarConfig`, `avatarSvg`, `buildAvatarPicker`.
- `assets/audio/intro/` — the real ElevenLabs narration recordings (see
  `assets/audio/intro/README.md` — one clip, "Before we begin…", wasn't
  included in the batch provided and is worth recording to complete the set).
- CSS lives in the "Welcome Intro" sections near the end of `styles.css`,
  namespaced under `.wi-*` so it can't collide with the rest of the design
  system.

### First-time detection
A single `localStorage` flag, `gmq_seen_welcome_intro_v1`. `auth.js`'s
`enterApp()` function sits in front of every successful signup, login,
legacy-upgrade and password-reset; if the flag isn't set it plays the intro
and only then enters the app, setting the flag as soon as the intro ends
**or is skipped**. Skipping always leaves any avatar/name choices already
made in place — nothing is redone. For local testing, running
`window.resetPerfect9Intro()` in the browser console clears the flag so the
next successful login or signup shows the intro again.

### Narration
Every spoken line is a real recorded performance from
`assets/audio/intro/` — there is no synthesised or text-to-speech voice
anywhere in this feature. `js/narration.js` holds the script as data
(`NARRATION_LINES`) and `Narrator.speak(id)` plays the matching file. The
on-screen text and animation timing are driven by the **actual** audio:
each line waits for the real `ended` event (with a short minimum "reading
time" floor under it) before moving on, so re-recording any clip at any
pace stays in sync automatically with no timing numbers to touch. If a
clip is ever missing (as `intro-14-beforewebegin.mp3` currently is) or
fails to load, that one line simply plays silently with its normal
on-screen timing — nothing else is affected.

### Avatar storage
Saved as `avatar` on the same account object `js/auth.js` already keeps in
`localStorage` (`gmq_auth_v1`), right alongside the email/username/password
hash — e.g. `{ skin: 3, hairStyle: 1, hairColor: 4, shirt: 2, accessory:
'note-pin' }`. `getAccountAvatarConfig()` reads it, or — for accounts that
predate this feature, or if someone skips before the avatar scene ever
appears — derives the exact same deterministic look the avatar always had
before (from the username), so nobody's avatar changes underneath them.
`avatarSvg(configOrUsername, size)` draws it anywhere in the app; the header
chip, the login greeting, and the Settings account panel all call
`getAccountAvatarConfig()` so they always show whatever is actually saved.
Avatar and username can each be changed later too, independently of the
intro, from **Settings → your account** ("Change avatar" / the password
form is right there for the name — usernames are edited the same way they
always were).

### The closing "transform," not a page swap
When the closing sequence begins, the real homepage is actually built and
rendered in the DOM *underneath* the still-visible cinematic overlay (the
same `initApp()` the rest of the app already uses — nothing custom). A
light "dashboard" skeleton (a nav-bar shape, a few card shapes, all drawn
in the site's own colour variables) assembles on top of that in the
overlay, the avatar just created flies — via a measured, read-only lookup
of the real header avatar's on-screen position — to where it will actually
live, and then the whole cinematic layer dissolves, revealing the real,
already-matching homepage that was quietly finished underneath it the
whole time. This is the one place the intro looks outside its own overlay,
and it only ever *reads* the real page; if the header isn't where it's
expected for any reason, the avatar-flight step is simply skipped, never
an error.

### Changing the dialogue or timing
Every on-screen line and its narration mapping live in
`js/narration.js`'s `NARRATION_LINES` array — edit the `text` there and the
matching `id` used in `js/welcome-intro.js`'s `wiBeat(..., { narrate: 'id' }
)` calls stays linked to it. Per-line minimum hold times (`hold`,
`inDuration`, `outDuration`) are set right where each line is called in
`wiRunFullSequence` / `wiRunReducedSequence` — these act as a floor under
the real audio, not a substitute for it.

### Mobile / reduced motion
The reduced-motion path (`wiRunReducedSequence`) keeps the exact same
words, order and account-creation flow (avatar + username both still
happen, and real narration still plays) but uses only short opacity
crossfades — no parallax, no flying notation, no boot-light growth, no
looping background motion — and is checked automatically via
`prefers-reduced-motion`. Both paths use `clamp()`-based type sizing and a
flex/grid layout throughout, so the same markup adapts down to a phone
screen without a separate mobile version.

### For testing only
Setting `window.__wiTestFast = true` before the page loads (e.g. via
Playwright's `addInitScript`) uniformly compresses every fallback timing in
the intro by 10× and skips waiting on real audio playback, for fast
automated testing. Real users never set this, and the shipped site never
sets it either — full, deliberate, audio-led pacing (roughly 45–90 seconds
depending on how long avatar creation takes) is always what plays.


## Accounts

Signing up asks for an **email address, a username and a password**. The
password is never stored — only a random salt and a salted hash (PBKDF2-SHA256
via the Web Crypto API, with a pure-JS iterated SHA-256 fallback for older
browsers). Returning visitors see a friendly "Hi, [username]!" avatar and are
asked only for their password; a page refresh in the same tab keeps you
logged in, while a fresh visit asks again. Settings has a "Change password"
form, "Forgot password?" is available from the login screen (it confirms your
email and username, since everything lives only on this device), and older
saves from before this feature are upgraded automatically the first time
their owner logs back in.

This is a privacy gate for a shared device, not a security boundary — anyone
with access to the browser's storage could, in principle, tamper with it.

## What's inside

```
index.html                     — entry point, loads everything below
styles.css                     — the entire design system (light + dark mode)
licenses/Bravura-OFL-1.1.txt   — licence for the music glyph outlines
js/utils.js                    — storage, XP/level maths, mastery calculations
js/notation-glyphs.js          — vector outlines for clefs, noteheads, rests etc.
                                  (derived from the Bravura font, SIL OFL 1.1)
js/notation.js                 — the SVG stave/clef/key-signature engraving
                                  engine, plus scale/interval/triad theory helpers
js/trainer.js                  — the Notation Trainer: unlimited self-checking
                                  practice for note names, clefs, key signatures,
                                  intervals and note values
js/audio.js                    — a tiny Web Audio synth (notes, chords, scales,
                                  cadences, rhythms)
js/auth.js                     — the account system (signup, login, password
                                  reset, avatar, legacy-account upgrade)
js/content-topics.js           — the 15 core lessons (Learn + Example content)
js/content-theory-notation.js  — extra notation/theory lesson content, the
                                  three-clef and key-signature galleries, and
                                  a further quiz + flashcard set
js/content-exam.js             — AQA/Eduqas exam-board overview + badges +
                                  confusable-terms data
js/content-quiz-1.js           — question bank part 1 (notation, rhythm,
                                  scales, intervals)
js/content-quiz-2.js           — question bank part 2 (chords, elements,
                                  texture, melody, form, accompaniment,
                                  transposition, instruments, vocabulary,
                                  listening, genre)
js/content-quiz-batch4.js      — further general + AQA + Eduqas questions
js/content-flashcards.js       — the core flashcard deck
js/content-flashcards-batch3.js — curated additional flashcards, plus the
                                  difficulty-tagging and staff-visual pass
                                  applied to the whole deck
js/app.js                      — the application itself: state, navigation,
                                  quiz engine, all screens (Home, Learn, Quiz,
                                  Flashcards, Listening Lab, Mock Exam,
                                  Progress, Settings, Mistake Bank, Daily
                                  Challenge, Study Mode)
```

## What it covers

- **15 core GCSE theory topics**, each with a Learn tab, worked Examples,
  guided Practice, and a full Quiz — notation, rhythm & metre, scales & keys,
  intervals, chords & harmony, dynamics/tempo/articulation, texture, melody,
  form & structure, accompaniment techniques, transposition, instruments &
  voices, musical vocabulary, listening & aural skills, and genre & style.
- A **Notation Trainer** with unlimited, self-checking practice: note names
  in treble, bass and alto clef (on-stave or with ledger lines, naturals-only
  or with sharps/flats), clef recognition, key-signature recognition,
  interval naming and note/rest values — every answer comes with a worked
  explanation.
- Real SVG **staff notation** engraved from vector outlines (correctly
  positioned notes, ledger lines, key signatures for all three clefs, chords,
  beams, ties and slurs), an **interactive circle of fifths** with correctly
  spelled scales in every key, and a small **Web Audio synth** for the
  Listening Lab (play intervals, chords, scales and cadences and try to
  identify them by ear).
- A **question bank of 300+ questions** across multiple formats: multiple
  choice, true/false, typing, notation identification, interval/chord/cadence
  identification, drag-and-drop ordering, and term-to-definition matching —
  each tagged with a difficulty (⭐ to ⭐⭐⭐⭐⭐) and a full explanation.
- **300+ flashcards** with a real spread of difficulty, a subset with an
  engraved staff or rhythm visual on the card itself (clefs, note values,
  ledger lines, ties, slurs, accidentals, key signatures), a **Mistake Bank**
  with one-tap retry, a **Daily Challenge**, a **timed Mock Exam** with a
  topic breakdown and revision suggestions, and a **Study Mode** that mixes
  lessons/flashcards/quiz questions into a focused session.
- **XP, 8 named levels, daily + correct-answer streaks, 14 badges**, a
  **Progress** page with topic mastery bars, strongest/weakest topics and a
  7-day XP chart, and a **Recently studied** panel on Home — all built with
  plain CSS/SVG, no charting library.
- **AQA / Eduqas exam-board mode**: toggle a board on the Home page or in
  Settings to see a plain-language summary of that board's areas of study and
  assessment weighting, layered on top of the general theory. This is a
  simplified **revision summary only** — it is clearly labelled as such
  throughout the app, and you should always check your own exam board's
  current official specification for exact, up-to-date requirements before
  an exam.
- **Dark mode, reduced-motion mode, sound on/off, difficulty preference, and
  a full progress reset**, all in Settings. Fully responsive from phone to
  desktop.

## A couple of honest notes

- The exam-board sections are intentionally kept high-level and are labelled
  as general summaries — they're a revision aid, not a replacement for the
  official AQA / Eduqas specification documents. AQA (8271) and Eduqas
  (C660QS) are always kept as separate modes with their own content; general
  theory questions and cards are shared, board-specific ones are not.
- The question bank and flashcard deck are a strong, curated set covering
  every topic requested, built and checked so that every answer is verifiable
  and every explanation is accurate — rather than a much larger set of
  uneven quality. An earlier version of the flashcard deck included several
  hundred cards auto-generated from quiz questions; many of those had no real
  answer on their own or gave the answer away in the prompt, so they were
  removed in favour of the curated cards here. It's easy to extend later by
  adding more objects to the `js/content-quiz-*.js` or
  `js/content-flashcards*.js` files, which all follow a simple, consistent
  shape.
- The Listening Lab currently has 8 audio-identification questions
  (intervals, triads, scales). This is an area earmarked for more content in
  a future pass, alongside further flashcards and quiz questions per the
  original content brief.
