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
import { odeToJoy } from './odeLesson.js'
import { libraryPieces } from './library.js'

const THEME_KEY = 'pianobook-theme'

function getStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getRoute() {
  if (window.location.hash === '#/ode-to-joy') return 'ode'
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
  const [status, setStatus] = useState('idle')
  const [activeBeat, setActiveBeat] = useState(-1)

  const stop = () => {
    request.current += 1
    clearInterval(timer.current)
    engine.current?.stop()
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
    if (!engine.current) engine.current = new PianoEngine()
    try {
      if (!engine.current.isReady) setStatus('loading')
      const eventsPromise = typeof events === 'function' ? events() : Promise.resolve(events)
      const [, resolvedEvents] = await Promise.all([engine.current.ready(), eventsPromise])
      setStatus('ready')
      events = resolvedEvents
    } catch (error) {
      console.error('Unable to load piano audio', error)
      engine.current?.dispose()
      engine.current = null
      setStatus('error')
      return
    }
    if (playRequest !== request.current) return

    const schedule = engine.current.scheduleEvents(events, tempo)
    playingIdRef.current = id
    setPlayingId(id)
    setActiveBeat(0)
    timer.current = setInterval(() => {
      const elapsedSeconds = engine.current.currentTime - schedule.startTime
      const beat = Math.max(0, elapsedSeconds / (schedule.beatMs / 1000))
      if (beat >= schedule.totalBeats) stop()
      else setActiveBeat(Math.floor(beat * 2) / 2)
    }, 60)
  }

  return { play, playingId, status, activeBeat }
}

function PlayButton({ id, player, events, tempo, label = 'Listen' }) {
  const playing = player.playingId === id
  return (
    <button className="play-control" onClick={() => player.play(id, events, tempo)} disabled={player.status === 'loading'}>
      <span>{player.status === 'loading' ? <LoaderCircle className="spinner" size={18} /> : playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</span>
      {player.status === 'loading' ? 'Preparing piano…' : playing ? 'Pause' : label}
    </button>
  )
}

function CompactPlayButton({ id, player, events, tempo, title }) {
  const playing = player.playingId === id
  return (
    <button
      className="compact-play"
      onClick={() => player.play(id, events, tempo)}
      disabled={player.status === 'loading'}
      aria-label={playing ? `Pause ${title}` : `Play ${title}`}
    >
      {player.status === 'loading'
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
      <div className="ode-layer-score"><div className="workbench-head"><span>{step.label}</span><small>8 measures</small></div><PaginatedPianoScore score={odeToJoy.scores[step.score]} activeBeat={player.activeBeat} playing={playing} title={`Ode to Joy ${step.label}`} /></div>
    </article>
  )
}

function OdePage({ player }) {
  return (
    <main className="piece-page">
      <header className="piece-introduction">
        <a className="back-link" href="#/"><ArrowLeft size={14} /> Music library</a>
        <div className="piece-introduction-grid">
          <div><p className="eyebrow">PIECE 02 · DISSECTION</p><h1>{odeToJoy.title}</h1><p className="piece-byline">{odeToJoy.composer}</p></div>
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

function App() {
  const [theme, setTheme] = useState(getStoredTheme)
  const [route, setRoute] = useState(getRoute)
  const player = usePianoPlayer()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
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
      {route === 'ode' && <OdePage player={player} />}
      {route === 'library' && <LibraryPage player={player} />}
      <footer><Logo /><p>One beautiful piece at a time.</p><a href="#/">Music library <ArrowRight size={13} /></a></footer>
    </div>
  )
}

export default App
