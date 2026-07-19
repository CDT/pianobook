import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  LoaderCircle,
  Moon,
  Pause,
  Play,
  Search,
  Sun,
  Volume2,
} from 'lucide-react'
import { PianoEngine } from './audio.js'
import { PaginatedPianoScore } from './PianoScore.jsx'
import {
  canonInD,
  canonInDSimplified,
  odeToJoy,
  preludeInC,
} from './lessons/index.js'
import { libraryPieces } from './library.js'

const THEME_KEY = 'pianobook-theme'
const THEME_COLORS = { light: '#f4f1e9', dark: '#171a18' }

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('#theme-color')?.setAttribute('content', THEME_COLORS[theme])
}

function getStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getRoute() {
  if (window.location.hash === '#/ode-to-joy') return 'ode'
  if (window.location.hash === '#/prelude-in-c') return 'prelude'
  if (window.location.hash === '#/canon-in-d') return 'canon'
  if (window.location.hash === '#/canon-in-d-intermediate') return 'canon-study'
  return 'library'
}

function Logo() {
  return (
    <a className="brand" href="#/" aria-label="Piano Book library">
      <span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span>
      <span><strong>Piano Book</strong><small>Learn music from the inside out</small></span>
    </a>
  )
}

function Header({ theme, onTheme, route }) {
  return (
    <header className="site-header simple-header">
      <Logo />
      <nav aria-label="Main navigation">
        <a className={route === 'library' ? 'current' : ''} href="#/">Music library</a>
        {route !== 'library' && <span>Piece dissection</span>}
      </nav>
      <div className="header-buttons">
        <button onClick={onTheme} aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}

function usePianoPlayer() {
  const engine = useRef(null)
  const timer = useRef(null)
  const request = useRef(0)
  const playingIdRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [error, setError] = useState(null)
  const [activeBeat, setActiveBeat] = useState(-1)

  const stop = (stopAudio = true) => {
    request.current += 1
    clearInterval(timer.current)
    if (stopAudio) engine.current?.stop()
    playingIdRef.current = null
    setPlayingId(null)
    setActiveBeat(-1)
  }

  useEffect(() => () => {
    clearInterval(timer.current)
    engine.current?.dispose()
  }, [])

  const play = async (id, events, tempo) => {
    if (playingIdRef.current === id) {
      stop()
      return
    }
    stop()
    const playRequest = ++request.current
    setError(null)
    if (!engine.current) engine.current = new PianoEngine()
    try {
      if (!engine.current.isReady) setLoadingId(id)
      const eventsPromise = typeof events === 'function' ? events() : Promise.resolve(events)
      const [, resolvedEvents] = await Promise.all([engine.current.ready(), eventsPromise])
      events = resolvedEvents
    } catch (error) {
      console.error('Unable to load piano audio', error)
      engine.current?.dispose()
      engine.current = null
      if (playRequest === request.current) {
        setLoadingId(null)
        setError({ id, message: 'Piano audio couldn’t load. Check your connection and try again.' })
      }
      return
    }
    if (playRequest !== request.current) return
    setLoadingId(null)

    const schedule = engine.current.scheduleEvents(events, tempo)
    playingIdRef.current = id
    setPlayingId(id)
    setActiveBeat(0)
    timer.current = setInterval(() => {
      const elapsedSeconds = engine.current.currentTime - schedule.startTime
      const beat = Math.max(0, elapsedSeconds / (schedule.beatMs / 1000))
      if (beat >= schedule.totalBeats) {
        clearInterval(timer.current)
        setActiveBeat(schedule.totalBeats)
        timer.current = setTimeout(() => stop(false), schedule.tailSeconds * 1000)
      } else setActiveBeat(Math.floor(beat * 2) / 2)
    }, 60)
  }

  return { play, playingId, loadingId, error, activeBeat }
}

function PlayButton({ id, player, events, tempo, label = 'Listen' }) {
  const playing = player.playingId === id
  const loading = player.loadingId === id
  return (
    <button className="play-control" onClick={() => player.play(id, events, tempo)} disabled={loading}>
      <span>{loading ? <LoaderCircle className="spinner" size={18} /> : playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</span>
      {loading ? 'Preparing piano…' : playing ? 'Pause' : player.error?.id === id ? 'Try audio again' : label}
    </button>
  )
}

function CompactPlayButton({ id, player, events, tempo, title }) {
  const playing = player.playingId === id
  const loading = player.loadingId === id
  const failed = player.error?.id === id
  return (
    <button
      className="compact-play"
      onClick={() => player.play(id, events, tempo)}
      disabled={loading}
      aria-label={loading ? `Preparing ${title}` : playing ? `Pause ${title}` : failed ? `Retry audio for ${title}` : `Play ${title}`}
      title={failed ? 'Audio unavailable — try again' : undefined}
    >
      {loading
        ? <LoaderCircle className="spinner" size={16} />
        : playing
          ? <Pause size={15} fill="currentColor" />
          : <Play size={15} fill="currentColor" />}
    </button>
  )
}

function LibraryPage({ player }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const visiblePieces = normalizedQuery
    ? libraryPieces.filter((piece) => [piece.title, piece.composer, piece.description, ...piece.meta].join(' ').toLowerCase().includes(normalizedQuery))
    : libraryPieces

  return (
    <main className="library-page">
      <header className="library-intro">
        <p className="eyebrow">MUSIC LIBRARY</p>
        <h1>Choose a piece.<br /><em>See how it works.</em></h1>
        <p>Listen first. Then open the piece and take it apart from the bass upward.</p>
      </header>
      <div className="library-search">
        <Search size={18} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search title, composer, level…" aria-label="Search music library" />
        <span>{visiblePieces.length} {visiblePieces.length === 1 ? 'piece' : 'pieces'}</span>
      </div>
      <div className="library-grid">
        <div className="library-list-head" aria-hidden="true"><span>No.</span><span>Piece</span><span>About</span><span>Details</span><span>Listen</span><span>Lesson</span></div>
        {visiblePieces.map((piece) => {
          const playing = player.playingId === piece.playId
          const title = <><h2>{piece.title}</h2><span>{piece.composer}</span></>
          return (
            <article className={`library-card ${playing ? 'playing' : ''}`} key={piece.number}>
              <span className="library-number">{piece.number}</span>
              {piece.route ? <a href={piece.route} className="library-card-title">{title}</a> : <div className="library-card-title">{title}</div>}
              <p>{piece.description}</p>
              <div className="library-card-meta">{piece.meta.map((item) => <span key={item}>{item}</span>)}</div>
              {piece.events ? <CompactPlayButton id={piece.playId} player={player} events={piece.events} tempo={piece.tempo} title={piece.title} /> : <span className="library-empty">—</span>}
              {piece.route ? <a className="library-open" href={piece.route}>Open <ChevronRight size={14} /></a> : <span className="library-status">Listed</span>}
            </article>
          )
        })}
        {visiblePieces.length === 0 && <p className="library-no-results">No pieces match “{query}”.</p>}
      </div>
    </main>
  )
}

function OdeStep({ step, index, player }) {
  const playing = player.playingId === step.id
  return (
    <article className="ode-layer">
      <div className="ode-layer-copy">
        <span className="ode-layer-number">{String(index + 1).padStart(2, '0')}</span><p className="eyebrow">{step.kicker}</p><h2>{step.title}</h2><p>{step.body}</p>
        <div className="insight"><Volume2 size={17} /><span><strong>Listen for:</strong> {step.listenFor}</span></div>
        <PlayButton id={step.id} player={player} events={odeToJoy.layers[step.layer]} tempo={odeToJoy.tempo} label={`Play ${step.label.toLowerCase()}`} />
      </div>
      <div className="ode-layer-score">
        <div className="workbench-head">
          <span>{step.label}</span>
          <div className="score-actions">
            <small>{odeToJoy.totalBeats / 4} measures</small>
            <CompactPlayButton id={step.id} player={player} events={odeToJoy.layers[step.layer]} tempo={odeToJoy.tempo} title={`Ode to Joy ${step.label}`} />
          </div>
        </div>
        <PaginatedPianoScore score={odeToJoy.scores[step.score]} activeBeat={player.activeBeat} playing={playing} title={`Ode to Joy ${step.label}`} />
      </div>
    </article>
  )
}

function OdePage({ player }) {
  return (
    <main className="piece-page">
      <header className="piece-introduction">
        <a className="back-link" href="#/"><ArrowLeft size={14} /> Music library</a>
        <div className="piece-introduction-grid">
          <div><p className="eyebrow">PIECE 03 · DISSECTION</p><h1>{odeToJoy.title}</h1><p className="piece-byline">{odeToJoy.composer}</p></div>
          <div className="piece-introduction-copy">
            <p>Start with two grounding bass notes, turn them into harmony, trace the stepwise melody, and finally balance both hands in the complete texture.</p>
            <div className="piece-page-meta"><span>{odeToJoy.key}</span><span>4 / 4</span><span>{odeToJoy.tempo} bpm</span><span>{odeToJoy.steps.length} layers</span></div>
            <PlayButton id="ode-full" player={player} events={odeToJoy.events} tempo={odeToJoy.tempo} label="Hear the piece" />
          </div>
        </div>
      </header>
      <nav className="layer-index" aria-label="Lesson layers">{odeToJoy.steps.map((step, index) => <span key={step.id}><b>{index + 1}</b>{step.kicker.replace('THE ', '')}</span>)}</nav>
      <section className="ode-layers">{odeToJoy.steps.map((step, index) => <OdeStep step={step} index={index} player={player} key={step.id} />)}</section>
      <p className="piece-source"><a href={odeToJoy.sourceUrl} target="_blank" rel="noreferrer">Public-domain score source · Mutopia</a></p>
    </main>
  )
}

function PreludeStep({ step, index, player }) {
  const playing = player.playingId === step.id
  return (
    <article className="ode-layer">
      <div className="ode-layer-copy">
        <span className="ode-layer-number">{String(index + 1).padStart(2, '0')}</span><p className="eyebrow">{step.kicker}</p><h2>{step.title}</h2><p>{step.body}</p>
        <div className="insight"><Volume2 size={17} /><span><strong>Listen for:</strong> {step.listenFor}</span></div>
        <PlayButton id={step.id} player={player} events={preludeInC.layers[step.layer]} tempo={preludeInC.tempo} label={`Play ${step.label.toLowerCase()}`} />
      </div>
      <div className="ode-layer-score">
        <div className="workbench-head">
          <span>{step.label}</span>
          <div className="score-actions">
            <small>{preludeInC.totalBeats / 4} measures</small>
            <CompactPlayButton id={step.id} player={player} events={preludeInC.layers[step.layer]} tempo={preludeInC.tempo} title={`${preludeInC.title} ${step.label}`} />
          </div>
        </div>
        <PaginatedPianoScore score={preludeInC.scores[step.score]} activeBeat={player.activeBeat} playing={playing} title={`${preludeInC.title} ${step.label}`} />
      </div>
    </article>
  )
}

function PreludePage({ player }) {
  return (
    <main className="piece-page">
      <header className="piece-introduction">
        <a className="back-link" href="#/"><ArrowLeft size={14} /> Music library</a>
        <div className="piece-introduction-grid">
          <div><p className="eyebrow">PIECE 04 · DISSECTION</p><h1>{preludeInC.title}</h1><p className="piece-byline">{preludeInC.composer} · {preludeInC.opus}</p></div>
          <div className="piece-introduction-copy">
            <p>Hold the foundation, learn the repeating arpeggio cell, then follow Bach’s complete 35-measure harmonic journey from stillness through tension and home again.</p>
            <div className="piece-page-meta"><span>{preludeInC.key}</span><span>4 / 4</span><span>{preludeInC.tempo} bpm</span><span>{preludeInC.steps.length} layers</span></div>
            <PlayButton id="prelude-full" player={player} events={preludeInC.events} tempo={preludeInC.tempo} label="Hear the piece" />
          </div>
        </div>
      </header>
      <nav className="layer-index" aria-label="Lesson layers">{preludeInC.steps.map((step, index) => <span key={step.id}><b>{index + 1}</b>{step.kicker.replace('THE ', '')}</span>)}</nav>
      <section className="ode-layers">{preludeInC.steps.map((step, index) => <PreludeStep step={step} index={index} player={player} key={step.id} />)}</section>
      <p className="piece-source"><a href={preludeInC.sourceUrl} target="_blank" rel="noreferrer">Public-domain score source · Mutopia</a></p>
    </main>
  )
}

function CanonStep({ piece, step, index, player }) {
  const playing = player.playingId === step.id
  return (
    <article className="ode-layer">
      <div className="ode-layer-copy">
        <span className="ode-layer-number">{String(index + 1).padStart(2, '0')}</span><p className="eyebrow">{step.kicker}</p><h2>{step.title}</h2><p>{step.body}</p>
        <div className="insight"><Volume2 size={17} /><span><strong>Listen for:</strong> {step.listenFor}</span></div>
        <PlayButton id={step.id} player={player} events={piece.layers[step.layer]} tempo={piece.tempo} label={`Play ${step.label.toLowerCase()}`} />
      </div>
      <div className="ode-layer-score">
        <div className="workbench-head">
          <span>{step.label}</span>
          <div className="score-actions">
            <small>{piece.totalBeats / 4} measures</small>
            <CompactPlayButton id={step.id} player={player} events={piece.layers[step.layer]} tempo={piece.tempo} title={`${piece.title} ${step.label}`} />
          </div>
        </div>
        <PaginatedPianoScore score={piece.scores[step.score]} activeBeat={player.activeBeat} playing={playing} title={`${piece.title} ${step.label}`} />
      </div>
    </article>
  )
}

function CanonPage({ player, piece = canonInD, study = false }) {
  return (
    <main className="piece-page">
      <header className="piece-introduction">
        <a className="back-link" href="#/"><ArrowLeft size={14} /> Music library</a>
        <div className="piece-introduction-grid">
          <div><p className="eyebrow">{study ? 'PIECE 01 · INTERMEDIATE STUDY' : 'PIECE 02 · COMPLETE PIANO TRANSCRIPTION'}</p><h1>{piece.title}</h1><p className="piece-byline">{piece.composer}</p></div>
          <div className="piece-introduction-copy">
            <p>{study ? 'This shorter piano study uses Pachelbel’s famous ground-bass progression with a newly written broken-chord texture.' : 'This piano transcription preserves Pachelbel’s real canon: three identical violin entries, beginning two measures apart, over the complete repeating continuo bass.'}</p>
            <div className="piece-page-meta"><span>{piece.key}</span><span>4 / 4</span><span>{piece.tempo} bpm</span><span>{study ? 'Intermediate study' : 'Complete canon'}</span></div>
            <PlayButton id={study ? 'canon-study-full' : 'canon-full'} player={player} events={piece.events} tempo={piece.tempo} label={study ? 'Hear the piano study' : 'Hear the real canon'} />
          </div>
        </div>
      </header>
      <nav className="layer-index" aria-label="Lesson layers">{piece.steps.map((step, index) => <span key={step.id}><b>{index + 1}</b>{step.kicker.replace('THE ', '')}</span>)}</nav>
      <section className="ode-layers">{piece.steps.map((step, index) => <CanonStep piece={piece} step={step} index={index} player={player} key={step.id} />)}</section>
      <p className="piece-source"><a href={piece.sourceUrl} target="_blank" rel="noreferrer">{study ? 'Based on Pachelbel’s original Canon' : 'Canonical line source · Mutopia'}</a></p>
    </main>
  )
}

function App() {
  const [theme, setTheme] = useState(getStoredTheme)
  const [route, setRoute] = useState(getRoute)
  const player = usePianoPlayer()

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const onRoute = () => { setRoute(getRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onRoute)
    return () => window.removeEventListener('hashchange', onRoute)
  }, [])

  return (
    <div id="top">
      <Header theme={theme} onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} route={route} />
      {player.error && <p className="audio-error" role="alert">{player.error.message}</p>}
      {route === 'ode' && <OdePage player={player} />}
      {route === 'prelude' && <PreludePage player={player} />}
      {route === 'canon' && <CanonPage player={player} />}
      {route === 'canon-study' && <CanonPage player={player} piece={canonInDSimplified} study />}
      {route === 'library' && <LibraryPage player={player} />}
      <footer><Logo /><p>One beautiful piece at a time.</p><a href="#/">Music library <ArrowRight size={13} /></a></footer>
    </div>
  )
}

export default App
