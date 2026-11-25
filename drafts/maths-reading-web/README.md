# Maths and reading learning drafts (readable source)

Source for the two hidden draft pages on yaanstep.com (`maths-draft.html`, `reading-draft.html`). Plain TypeScript with no framework. Not the React app in the rest of this repo.

- `src/`: puzzle generation, chapters and lessons, points, reading content, voice choice, storage, plus unit tests (`*.test.ts`).
- `web/`: page logic (`app.ts` maths, `reading.ts` reading) and HTML templates.
- `build.sh`: bundles each page into one HTML file (`web/index.html`, `web/reading.html`) with esbuild. These built files and the bundles are not committed.
- Tests: `npm test` (Node 22 or newer, runs TypeScript directly).

Last source state matches the hidden drafts as of commit e0c091c in yaanstep-website (24 Nov 2026). Status: drafts, reviews open (Jira SCRUM-476 to 480, QA SCRUM-484). The name "Yaanstep Sprouts" is a working name and must not appear on public pages.
