# Draai & Verbind: ANWB wheel prototype

A front-end-only prototype of an interactive touchscreen experience that helps IT colleagues at ANWB connect. Two colleagues walk up, enter their names, spin the wheel and play a short activity (5–10 minutes) from the category it lands on.

Built with Vite + React. No backend: all content and settings live in the browser's `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. The admin screen is behind the small ⚙ in the bottom-right corner (or go to `#/admin`).

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.
One-time setup in the GitHub repo: **Settings → Pages → Source: GitHub Actions**.
The build uses relative paths (`base: './'`) and hash routing, so it works under any repo path.

## Flow

1. Enter two names (left and right of the wheel). Typing suggests colleague profiles; picking one links the profile so personalized questions work. Unknown names work too.
2. Spin (button or tap the wheel). The ANWB logo in the hub spins along.
3. The wheel lands on a category and a random enabled activity from that category opens in a large pop-up: intro (title + description) → activity → "Activiteit voltooid!" with a single score line.
4. Back to the start screen with empty names. After a few minutes without interaction (configurable) the app also resets.

## Categories & activity types

| Category | Example activities |
| --- | --- |
| 🏡 Privé (who colleagues are outside work) | Open gesprek · Hoe goed ken je elkaar? · Wie is het? |
| 💻 Werk (what they work on and are proud of) | Waar ben je trots op? · Elevator pitch (60 s timer) · Wie werkt waaraan? |
| 🚗 ANWB (how ANWB works and what it stands for) | ANWB-quiz (multiple choice + estimates) · Wat betekent de ANWB voor jou? |
| 🤝 Samen (the value of working together) | Beschrijf het! · Duo-memory · Op één lijn |
| 💬 Visie (how colleagues think) | Dilemma's onderweg · Tech-dilemma's · Stellingen |

Activity types (`src/activities/`):

- **quiz**: Kahoot-style tiles, answered together. Estimate questions: each player guesses, closest wins.
- **dilemma**: A/B choice or agree/disagree. Players choose in turn (hidden), then compare and discuss.
- **conversation**: open question cards, `{A}`/`{B}` name placeholders, optional timer.
- **guess**: "What would your colleague pick?" Uses profile answers; falls back to asking the colleague.
- **whoisit**: guess which (non-playing) colleague a hobby, fun fact, project or photo belongs to.
- **describe**: one player describes, the other guesses, against the clock. Keeps a team record.
- **memory**: cooperative memory with a shared move target.
- **sync**: count down and say an answer at the same time. One retry to meet in the middle.

To add a type: create the component, register it in `src/activities/registry.js` and add an editor in `src/admin/ActivityEditors.jsx`.

## Admin

Lightweight tabs for colleagues (team, role, project, hobbies, fun fact, activity photo, this-or-that answers), this-or-that questions, activities, categories, and settings/data (sound, timeouts, JSON export/import, reset to example data).

## Notes

- The default colleagues are real team members, but their teams, projects, hobbies, fun facts and this-or-that answers are **placeholders**. Update them via the admin screen.
- Changing `SEED_VERSION` in `src/data/seed.js` replaces the stored data in every browser with the new example data on next load.
- Please **verify the ANWB quiz facts** before using this with real colleagues.
- Photos are downscaled before saving, but `localStorage` is limited (~5 MB), so keep the number of photos modest.
- Data lives per browser/device; use export/import to move it.
