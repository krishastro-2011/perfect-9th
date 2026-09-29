# Welcome intro — narration audio

These are the real ElevenLabs narration recordings for the first-time
welcome sequence. `js/narration.js` plays them by exact filename — nothing
else needs to change if you re-record or replace any of them, as long as
the filename stays the same.

## ⚠️ One file is missing

**`intro-14-beforewebegin.mp3`** ("Before we begin…") was not included in
the batch that was provided. The intro still works perfectly without it —
that one line just plays silently with normal on-screen timing, exactly
like every other line does before any audio exists — but you'll want to
record/generate that one clip and drop it in here to complete the set.

## The files

| # | Filename | Line | Present? |
|---|---|---|---|
| 1 | `intro-01-welcome.mp3` | "Welcome." | ✅ |
| 2 | `intro-02-arrived.mp3` | "You've arrived at The Perfect 9th." | ✅ |
| 3 | `intro-03-wondering.mp3` | "You're probably wondering why you're here." | ✅ |
| 4 | `intro-04-obvious.mp3` | "The answer is fairly obvious." | ✅ |
| 5 | `intro-05-grade9.mp3` | "You're here for the Grade 9." | ✅ |
| 6 | `intro-06-fair.mp3` | "Fair enough." | ✅ |
| 7 | `intro-07-quote.mp3` | "Let's make Grade 9 look less terrifying." | ✅ |
| 8 | `intro-08-ambitious.mp3` | "Ambitious." | ✅ |
| 9 | `intro-09-movingon.mp3` | "Moving on." | ✅ |
| 10 | `intro-10-begin.mp3` | "Let's begin." | ✅ |
| 11 | `intro-11-title.mp3` | "The Perfect 9th." | ✅ |
| 12 | `intro-12-subtitle.mp3` | "Your shortcut to Grade 9." | ✅ |
| 13 | `intro-13-subtitle2.mp3` | "Music GCSE. Sorted." | ✅ |
| 14 | `intro-14-beforewebegin.mp3` | "Before we begin…" | ❌ **missing** |
| 15 | `intro-15-getyousetup.mp3` | "Let's get you set up." | ✅ |
| 16 | `intro-16-firstthingsfirst.mp3` | "First things first." | ✅ |
| 17 | `intro-17-chooseidentity.mp3` | "Choose your identity." | ✅ |
| 18 | `intro-18-nowtellus.mp3` | "Now tell us what to call you." | ✅ |
| 19 | `intro-19-nicetomeetyou.mp3` | **"Nice to meet you."** (name is never spoken — see below) | ✅ |
| 20 | `intro-20-entering.mp3` | "Entering the system." | ✅ |
| 21 | `intro-21-getstarted.mp3` | "Let's get started." | ✅ |

**Note on file #19:** the person's username is different every time, so it
can't be pre-recorded. The clip says only "Nice to meet you." — the name
itself always appears as on-screen text straight afterwards
("Nice to meet you, Alex.") and is never spoken.

## How timing works

The intro doesn't guess how long a clip is — it waits for each recording's
real `ended` event before moving on (with a short minimum "reading time"
floor under it, and a small breathing pause after). Swap any file for a
re-recorded version of any length and the pacing simply follows it; no
timing numbers need to change in the code.

## Format / path

Files are MP3, read from `assets/audio/intro/` (a path relative to
`index.html`, since this project runs by opening the file directly rather
than from a server). If a clip is ever missing or fails to load, that line
plays with no sound — never a synthesised voice standing in for it.
