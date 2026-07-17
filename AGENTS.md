# Repository Guidelines

## Project Structure & Module Organization

This repository is a frontend-only React 19 application built with Vite. Application code lives in `src/`: `App.jsx` contains the primary UI, `audio.js` wraps `smplr` playback, `PianoScore.jsx` renders the VexFlow notation, `odeLesson.js` and `library.js` hold lesson and catalog data, and `index.css` contains global styles. `src/main.jsx` is the browser entry point. Root configuration includes `vite.config.js`, `eslint.config.js`, and `index.html`. Production output is generated in `dist/`; do not commit generated files. Deployment is defined in `.github/workflows/deploy.yml`.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency versions from `package-lock.json` (preferred for CI and clean setups).
- `npm run dev` starts the Vite development server with hot reload.
- `npm run lint` checks all JavaScript and JSX with ESLint.
- `npm run build` creates the production site in `dist/`.
- `npm run preview` serves the production build locally for final verification.

The app is hosted under `/pianobook/`. Preserve the `base` setting and trailing-slash redirect in `vite.config.js` when testing routes or deployment changes.

## Coding Style & Naming Conventions

Use ES modules, JSX, two-space indentation, single quotes, and no semicolons, matching the existing source. Name React components in PascalCase, functions and variables in camelCase, and constants in UPPER_SNAKE_CASE. Keep course content and musical pattern data in the dedicated data modules rather than embedding it in UI markup. ESLint enforces recommended JavaScript, React Hooks, and Vite refresh rules; run it before submitting changes.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. Every change must pass `npm run lint` and `npm run build`. Manually verify the affected flows with `npm run dev`, especially responsive navigation, theme persistence, lesson progress in local storage, and audio playback after a user gesture. If adding tests, use `*.test.jsx` beside the relevant module and add the runner command to `package.json`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, sentence-style summaries, for example `Add dark theme and sampled piano audio`. Keep each commit focused. Pull requests should explain the user-visible impact, list verification performed, and link related issues. Include screenshots for visual changes and note any audio, storage, or GitHub Pages behavior affected.
