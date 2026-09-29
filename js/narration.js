/* ============================================================
   Perfect 9th — narration.js
   The spoken-narration layer for the welcome intro.

   Real narration audio (recorded via ElevenLabs) lives in
   assets/audio/intro/ — see assets/audio/intro/README.md for the
   exact file list. If a clip is ever missing (the project currently
   ships without intro-14-beforewebegin.mp3 — see that README), the
   matching line simply plays with no sound and normal on-screen
   timing; nothing breaks and nothing is faked. There is deliberately
   no synthesised/text-to-speech fallback — every spoken line is a
   real recorded performance, or it is silent.

   Timing is driven by the ACTUAL audio, not an assumed duration: a
   caller that wants to wait for a line to finish speaking awaits
   `whenEnded`, which resolves on the real 'ended' event of the
   <audio> element (or resolves immediately if nothing is playing —
   e.g. the file is missing, or the browser blocked autoplay).
   ============================================================ */

const NARRATION_BASE_PATH = 'assets/audio/intro/';

/** The full script, in order. `text` is always shown on screen; `file` is
    a real recorded line and is allowed to not exist yet. */
const NARRATION_LINES = [
  { id: 'welcome', file: 'intro-01-welcome.mp3', text: 'Welcome.' },
  { id: 'arrived', file: 'intro-02-arrived.mp3', text: 'You\u2019ve arrived at The Perfect 9th.' },
  { id: 'wondering', file: 'intro-03-wondering.mp3', text: 'You\u2019re probably wondering why you\u2019re here.' },
  { id: 'obvious', file: 'intro-04-obvious.mp3', text: 'The answer is fairly obvious.' },
  { id: 'grade9', file: 'intro-05-grade9.mp3', text: 'You\u2019re here for the Grade 9.' },
  { id: 'fair', file: 'intro-06-fair.mp3', text: 'Fair enough.' },
  { id: 'quote', file: 'intro-07-quote.mp3', text: '\u201cLet\u2019s make Grade 9 look less terrifying.\u201d' },
  { id: 'joke1', file: 'intro-08-ambitious.mp3', text: 'Ambitious.' },
  { id: 'joke2', file: 'intro-09-movingon.mp3', text: 'Moving on.' },
  { id: 'begin', file: 'intro-10-begin.mp3', text: 'Let\u2019s begin.' },
  { id: 'title', file: 'intro-11-title.mp3', text: 'The Perfect 9th.' },
  { id: 'subtitle', file: 'intro-12-subtitle.mp3', text: 'Your shortcut to Grade 9.' },
  { id: 'subtitle2', file: 'intro-13-subtitle2.mp3', text: 'Music GCSE. Sorted.' },
  { id: 'before_we_begin', file: 'intro-14-beforewebegin.mp3', text: 'Before we begin\u2026' },
  { id: 'lets_get_set_up', file: 'intro-15-getyousetup.mp3', text: 'Let\u2019s get you set up.' },
  { id: 'first_things_first', file: 'intro-16-firstthingsfirst.mp3', text: 'First things first.' },
  { id: 'choose_identity', file: 'intro-17-chooseidentity.mp3', text: 'Choose your identity.' },
  { id: 'now_tell_us', file: 'intro-18-nowtellus.mp3', text: 'Now tell us what to call you.' },
  // this clip says only "Nice to meet you." — the person's name is inserted as
  // on-screen text afterwards and is never spoken, since it can't be pre-recorded
  { id: 'nice_to_meet', file: 'intro-19-nicetomeetyou.mp3', text: null },
  { id: 'entering', file: 'intro-20-entering.mp3', text: 'Entering the system.' },
  { id: 'lets_get_started', file: 'intro-21-getstarted.mp3', text: 'Let\u2019s get started.' }
];
const NARRATION_BY_ID = Object.fromEntries(NARRATION_LINES.map(l => [l.id, l]));

/** Narrator: plays the real recorded line for an id, if the audio exists and
    sound is enabled. Never throws, never hangs, never fakes a voice. */
const Narrator = {
  _current: null,
  _currentFinish: null,

  isEnabled() { try { return typeof AudioLab !== 'undefined' && AudioLab.isEnabled(); } catch (e) { return false; } },

  /** Stops whatever is currently speaking and immediately resolves its
      whenEnded promise — otherwise skipping mid-line would leave a caller
      awaiting an 'ended' event that a manual pause() never fires. */
  stop() {
    if (this._current) { try { this._current.pause(); } catch (e) { /* ignore */ } }
    if (this._currentFinish) { try { this._currentFinish(); } catch (e) { /* ignore */ } }
    this._current = null;
    this._currentFinish = null;
  },

  /** speak(id) -> { played, whenEnded }.
      `played` is true once playback has actually started (metadata loaded
      without error) — it does NOT wait for the clip to finish.
      `whenEnded` is a Promise that resolves on the real 'ended' event of
      the audio element, or resolves immediately if the file is missing,
      fails to load, or autoplay was blocked. Callers that want their
      visuals to stay in sync with the real spoken line should await
      `whenEnded` rather than guessing a duration. Nothing here ever
      rejects — a broken or absent clip degrades to silence, not an error. */
  speak(id) {
    const line = NARRATION_BY_ID[id];
    if (!line || !line.file || !this.isEnabled()) return { played: false, whenEnded: Promise.resolve() };
    this.stop();

    let resolveEnded;
    const whenEnded = new Promise(resolve => { resolveEnded = resolve; });
    let settled = false;
    const finishOnce = () => { if (!settled) { settled = true; resolveEnded(); } };

    try {
      const audio = new Audio(NARRATION_BASE_PATH + line.file);
      this._current = audio;
      this._currentFinish = finishOnce;
      audio.addEventListener('ended', finishOnce);
      audio.addEventListener('error', finishOnce);
      // a stalled/never-resolving load (rather than a clean 404) shouldn't hang the intro forever
      const safetyNet = setTimeout(finishOnce, 20000);
      audio.addEventListener('ended', () => clearTimeout(safetyNet));
      audio.addEventListener('error', () => clearTimeout(safetyNet));
      const playPromise = audio.play();
      if (playPromise && playPromise.catch) playPromise.catch(finishOnce); // e.g. autoplay blocked
      return { played: true, whenEnded };
    } catch (e) {
      finishOnce();
      return { played: false, whenEnded };
    }
  }
};
