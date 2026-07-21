import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  LoaderCircle,
  Maximize2,
  Moon,
  Pause,
  Play,
  Search,
  Sun,
  Volume2,
} from 'lucide-react'
import { PianoEngine } from './audio.js'
import { PaginatedPianoScore } from './PianoScore.jsx'
import { canonInD } from './lessons/index.js'
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
  if (window.location.hash === '#/canon-in-d') return 'canon'
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
  const pausedIdRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)
  const [pausedId, setPausedId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [error, setError] = useState(null)
  const [activeBeat, setActiveBeat] = useState(-1)

  const stop = (stopAudio = true) => {
    request.current += 1
    clearInterval(timer.current)
    if (stopAudio) engine.current?.stop()
    playingIdRef.current = null
    pausedIdRef.current = null
    setPlayingId(null)
    setPausedId(null)
    setActiveBeat(-1)
  }

  const pause = () => {
    if (!playingIdRef.current) return
    clearInterval(timer.current)
    engine.current?.stop()
    pausedIdRef.current = playingIdRef.current
    playingIdRef.current = null
    setPausedId(pausedIdRef.current)
    setPlayingId(null)
  }

  useEffect(() => () => {
    clearInterval(timer.current)
    engine.current?.dispose()
  }, [])

  const play = async (id, events, tempo, requestedBeat) => {
    if (playingIdRef.current === id && requestedBeat === undefined) {
      pause()
      return
    }
    const offsetBeat = requestedBeat ?? (pausedIdRef.current === id ? Math.max(0, activeBeat) : 0)
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

    const schedule = engine.current.scheduleEvents(events, tempo, offsetBeat)
    playingIdRef.current = id
    setPlayingId(id)
    setActiveBeat(offsetBeat)
    timer.current = setInterval(() => {
      const elapsedSeconds = engine.current.currentTime - schedule.startTime
      const beat = schedule.offsetBeat + Math.max(0, elapsedSeconds / (schedule.beatMs / 1000))
      if (beat >= schedule.totalBeats) {
        clearInterval(timer.current)
        setActiveBeat(schedule.totalBeats)
        timer.current = setTimeout(() => stop(false), schedule.tailSeconds * 1000)
      } else setActiveBeat(Math.floor(beat * 4) / 4)
    }, 60)
  }

  return { play, pause, stop, playingId, pausedId, loadingId, error, activeBeat }
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

function CanonLearningStage({ piece, stage, player }) {
  const togetherId = `${stage.id}-together`
  const rightId = `${stage.id}-right`
  const leftId = `${stage.id}-left`
  const activeComparisonIndex = stage.comparisonLayers.findIndex((_, index) => player.playingId === `${stage.id}-comparison-${index}`)
  const activeComparison = activeComparisonIndex === -1 ? null : stage.comparisonLayers[activeComparisonIndex]
  const activeHand = player.playingId === rightId
    ? { id: rightId, events: stage.layers.right }
    : player.playingId === leftId
      ? { id: leftId, events: stage.layers.left }
      : null
  const playback = activeComparison
    ? { id: `${stage.id}-comparison-${activeComparisonIndex}`, events: activeComparison.events }
    : activeHand ?? { id: togetherId, events: stage.layers.together }
  const displayScore = activeComparison?.score ?? stage.score
  const displayMeasures = activeComparison ? `${activeComparison.start}–${activeComparison.end}` : stage.measures
  const playing = player.playingId === playback.id
  return (
    <article className="ode-layer memory-workbench">
      <div className="ode-layer-copy">
        <span className="ode-layer-number">{String(stage.number).padStart(2, '0')}</span>
        <p className="eyebrow">{stage.phase} · MEASURES {stage.measures}</p>
        <h2>{stage.title}</h2>
        <p>{stage.body}</p>
        <div className="relationship-logic">
          <div><b>Form</b><span>{stage.form}</span></div>
          <div><b>Harmony</b><span>{stage.harmony}</span></div>
          <div><b>Voices</b><span>{stage.voices}</span></div>
          <div><b>Explain it</b><span>{stage.question}</span></div>
        </div>
        <div className="insight"><Volume2 size={17} /><span><strong>Listen for:</strong> {stage.listenFor}</span></div>
      </div>
      <div className="ode-layer-score">
        <div className="workbench-head">
          <span>MUSICAL CHAPTER {String(stage.number).padStart(2, '0')}</span>
          <small>measures {stage.measures}</small>
        </div>
        <div className="comparison-listens" aria-label="Compare related passages">
          <span>COMPARE THE RELATIONSHIP</span>
          <div>{stage.comparisonLayers.map((comparison, index) => (
            <PlayButton
              id={`${stage.id}-comparison-${index}`}
              player={player}
              events={comparison.events}
              tempo={piece.tempo}
              label={`${comparison.label} · mm. ${comparison.start}–${comparison.end}`}
              key={`${comparison.start}-${comparison.end}`}
            />
          ))}</div>
        </div>
        <div className="hand-listens" aria-label="Listen by musical layer">
          <PlayButton id={rightId} player={player} events={stage.layers.right} tempo={piece.tempo} label="Hear upper voices" />
          <PlayButton id={leftId} player={player} events={stage.layers.left} tempo={piece.tempo} label="Hear the ground" />
          <PlayButton id={togetherId} player={player} events={stage.layers.together} tempo={piece.tempo} label="Hear together" />
        </div>
        <PaginatedPianoScore
          key={`${stage.id}-${displayMeasures}`}
          score={displayScore}
          activeBeat={player.activeBeat}
          playing={playing}
          title={`${piece.title} · measures ${displayMeasures}`}
          onTogglePlayback={() => player.play(playback.id, playback.events, piece.tempo)}
          onStop={player.stop}
          onSeek={(beat) => player.play(playback.id, playback.events, piece.tempo, beat)}
        />
      </div>
    </article>
  )
}

function CanonMemoryPath({ piece, player }) {
  const [selected, setSelected] = useState(0)
  const stage = piece.learningStages[selected]

  return (
    <>
      <section className="memory-path-intro">
        <div>
          <p className="eyebrow">THE MUSICAL MAP</p>
          <h2>Three chapters. One connected argument.</h2>
        </div>
        <p>Understand the piece through form, harmony, and voice-leading. Each chapter covers a large musical function, while the comparisons reveal how Pachelbel transforms the same underlying ground.</p>
      </section>
      <nav className="memory-map" aria-label="Canon in D musical chapters">
        {piece.learningStages.map((item, index) => (
          <button
            className={selected === index ? 'active' : ''}
            onClick={() => { player.stop(); setSelected(index) }}
            aria-current={selected === index ? 'step' : undefined}
            key={item.id}
          >
            <span>{String(item.number).padStart(2, '0')}</span>
            <small>{item.phase}</small>
            <b>mm. {item.measures}</b>
          </button>
        ))}
      </nav>
      <section className="ode-layers">
        <CanonLearningStage piece={piece} stage={stage} player={player} />
        <div className="memory-next">
          <button onClick={() => { player.stop(); setSelected((current) => Math.max(0, current - 1)) }} disabled={selected === 0}><ArrowLeft size={14} /> Previous chapter</button>
          <span>Chapter {selected + 1} of {piece.learningStages.length}</span>
          <button onClick={() => { player.stop(); setSelected((current) => Math.min(piece.learningStages.length - 1, current + 1)) }} disabled={selected === piece.learningStages.length - 1}>Next chapter <ArrowRight size={14} /></button>
        </div>
      </section>
    </>
  )
}

function CanonFullScore({ piece, player, scoreRef }) {
  const id = 'canon-full-score'
  return (
    <section className="full-score-reference">
      <div className="full-score-copy">
        <p className="eyebrow">REFERENCE</p>
        <h2>The complete score</h2>
        <p>Use this to check joins and practise longer runs after the individual cards are secure.</p>
      </div>
      <div className="ode-layer-score">
        <div className="workbench-head">
          <span>COMPLETE ARRANGEMENT</span>
          <div className="score-actions">
            <small>{Math.ceil(piece.totalBeats / 4)} measures</small>
            <CompactPlayButton id={id} player={player} events={piece.events} tempo={piece.tempo} title={`${piece.title} complete score`} />
          </div>
        </div>
        <PaginatedPianoScore
          ref={scoreRef}
          score={piece.scores.whole}
          activeBeat={player.activeBeat}
          playing={player.playingId === id}
          title={`${piece.title} complete score`}
          onTogglePlayback={() => player.play(id, piece.events, piece.tempo)}
          onStop={player.stop}
          onSeek={(beat) => player.play(id, piece.events, piece.tempo, beat)}
        />
      </div>
    </section>
  )
}

function CanonPage({ player }) {
  const piece = canonInD
  const fullScore = useRef(null)
  return (
    <main className="piece-page">
      <header className="piece-introduction">
        <a className="back-link" href="#/"><ArrowLeft size={14} /> Music library</a>
        <div className="piece-introduction-grid">
          <div><p className="eyebrow">PIECE 01 · MUSICAL ANALYSIS</p><h1>{piece.title}</h1><p className="piece-byline">{piece.composer}</p></div>
          <div className="piece-introduction-copy">
            <p>Understand the piece through its recurring ground, evolving voices, and large-scale form. The score becomes three connected musical chapters rather than a sequence of isolated passages.</p>
            <div className="piece-page-meta"><span>{piece.key}</span><span>4 / 4</span><span>{piece.tempo} bpm</span><span>3 musical chapters</span></div>
            <div className="piece-introduction-actions">
              <PlayButton id="canon-full" player={player} events={piece.events} tempo={piece.tempo} label="Hear the canon" />
              <button className="sheet-music-button" onClick={() => fullScore.current?.openFullscreen()}>
                <Maximize2 size={16} /> View full sheet music
              </button>
            </div>
          </div>
        </div>
      </header>
      <CanonMemoryPath piece={piece} player={player} />
      <CanonFullScore piece={piece} player={player} scoreRef={fullScore} />
      <p className="piece-source"><a href={piece.sourceUrl} target="_blank" rel="noreferrer">Canonical line source · Mutopia</a></p>
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
      {route === 'canon' && <CanonPage player={player} />}
      {route === 'library' && <LibraryPage player={player} />}
      <footer><Logo /><p>One beautiful piece at a time.</p><a href="#/">Music library <ArrowRight size={13} /></a></footer>
    </div>
  )
}

export default App
