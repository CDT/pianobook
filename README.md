# Piano Book

Piano Book is an interactive, frontend-only library for learning piano pieces from the inside out.

Choose a piece from the library, listen to it, and study its musical jobs from the foundation upward.

## What is included

The current application includes:

- A compact, searchable music library
- A complete Canon in D transcription covering the continuo, subject, canon entries, and full texture
- Sampled-piano playback with synchronized, paginated sheet music
- Responsive layouts and persistent light/dark themes

## Technology

- React
- Vite
- Plain CSS
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
