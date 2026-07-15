# Piano Book

Piano Book is an interactive, frontend-only guide to practical popular-piano accompaniment.

It is designed for pianists who already understand the basics of music theory—including reading staff notation, chords, rhythm, meter, keys, cadences, and chord progressions—and want to turn that knowledge into confident, musical playing.

## Goal

The first milestone is to help learners accompany any melody with a beautiful left-hand chord pattern.

The broader aim is to develop a collection of **piano formulas**: reusable rules and patterns for playing a wide range of popular music. The focus is practical accompaniment, not advanced classical repertoire.

## Technology

- React
- Vite
- Tailwind CSS
- GitHub Pages

The site is a static frontend application and will be deployed to the `/pianobook` path of the repository owner's default GitHub Pages site.

## Local development

```bash
npm install
npm run dev
```

Create a production build with `npm run build`. The generated site is written to `dist/` and uses `/pianobook/` as its base path for GitHub Pages.

Pushes to `main` are automatically built and published by the included GitHub Pages workflow. Configure the repository's Pages source as **GitHub Actions** before the first deployment.

## Status

Piano Book is under active development.
