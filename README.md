# Piano Book

Piano Book is an interactive, frontend-only guide to practical popular-piano accompaniment.

It is designed for pianists who already understand the basics of music theory—including reading staff notation, chords, rhythm, meter, keys, cadences, and chord progressions—and want to turn that knowledge into confident, musical playing.

## What is included

The first course is a complete, four-chapter path for turning chord knowledge into musical left-hand accompaniment:

- 12 concise lessons covering harmony, color, rhythm, touch, arranging, intros, and endings
- 6 reusable accompaniment formulas, including broken chords, rolling eighths, and a three-beat waltz
- Interactive playback in C, D, F, and G major with adjustable tempo
- Lesson-specific listening cues, playing advice, and three-part practice challenges
- Persistent course progress and last-lesson restoration using browser storage
- Responsive course navigation and light/dark themes

The focus is practical popular-piano accompaniment, not advanced classical repertoire. Learners should already be comfortable reading chord symbols and keeping a basic pulse.

## Technology

- React
- Vite
- Tailwind CSS
- GitHub Pages

## Audio

Playback uses `smplr` with a focused set of public-domain Splendid Grand Piano samples. The recordings are downloaded on first play and cached by supported browsers, keeping the application bundle small while providing a much more natural piano sound.

## Live site

[Open Piano Book](https://cdt.is-a.dev/pianobook/)

The trailing slash in `/pianobook/` is intentional. The Vite base path and GitHub Pages deployment both use it.

## Local development

```bash
npm install
npm run dev
```

Create a production build with `npm run build`. The generated site is written to `dist/` and uses `/pianobook/` as its base path for GitHub Pages.

Pushes to `main` are automatically built and published by the included GitHub Pages workflow. Configure the repository's Pages source as **GitHub Actions** before the first deployment.

## Verification

```bash
npm run lint
npm run build
```

The application is frontend-only and does not require environment variables or a backend service.
