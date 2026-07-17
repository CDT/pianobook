import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Headphones,
  Layers3,
  LoaderCircle,
  Menu,
  Moon,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Volume2,
  X,
} from 'lucide-react'
import { PianoEngine } from './audio.js'
import { canon, lessonSteps } from './canonLesson.js'
import { FULL_CANON_SOURCE, loadFullCanon } from './fullCanon.js'

const THEME_KEY = 'pianobook-theme'
const PROGRESS_KEY = 'pianobook-canon-progress'

function getStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Piano Book home">
      <span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span>
      <span><strong>Piano Book</strong><small>Learn music from the inside out</small></span>
    </a>
  )
}

function Header({ theme, onTheme, menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <Logo />
      <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
        <a href="#piece" onClick={() => setMenuOpen(false)}>The piece</a>
        <a href="#dissection" onClick={() => setMenuOpen(false)}>Dissection</a>
        <a href="#practice" onClick={() => setMenuOpen(false)}>Practice</a>
      </nav>
      <div className="header-buttons">
        <button onClick={onTheme} aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}

function useCanonPlayer() {
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

  const play = async (id, events = canon.layers.full) => {
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

    const schedule = engine.current.scheduleEvents(events, canon.tempo)
    const startedAt = performance.now() + schedule.startDelay
    playingIdRef.current = id
    setPlayingId(id)
    setActiveBeat(0)
    timer.current = setInterval(() => {
      const beat = Math.max(0, (performance.now() - startedAt) / schedule.beatMs)
      if (beat >= schedule.totalBeats) {
        stop()
      } else {
        setActiveBeat(Math.floor(beat * 2) / 2)
      }
    }, 60)
  }

  return { play, stop, playingId, status, activeBeat }
}

function PlayButton({ id, player, events, label = 'Listen' }) {
  const playing = player.playingId === id
  return (
    <button className="play-control" onClick={() => player.play(id, events)} disabled={player.status === 'loading'}>
      <span>{player.status === 'loading' ? <LoaderCircle className="spinner" size={18} /> : playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</span>
      {player.status === 'loading' ? 'Preparing piano…' : playing ? 'Pause' : label}
    </button>
  )
}

function Hero({ player }) {
  return (
    <section className="hero" id="piece">
      <div className="hero-copy">
        <p className="eyebrow">CHAPTER 01 · ONE PIECE, FIVE LAYERS</p>
        <h1>Don’t start with theory.<br /><em>Start with music.</em></h1>
        <p className="hero-intro">First, listen to a piece worth knowing. Then we’ll take it apart, all the way down to its eight-note foundation—and rebuild it with your own hands.</p>
        <div className="hero-actions">
          <PlayButton id="hero-full" player={player} events={loadFullCanon} label="Hear the full piece" />
          <a href="#dissection">Take it apart <ArrowDown size={15} /></a>
        </div>
      </div>
      <div className="piece-card" aria-label="Featured piece">
        <div className="piece-number">No. 01</div>
        <div className="piece-orbit"><Music2 size={46} strokeWidth={1.2} /></div>
        <p>JOHANN PACHELBEL · c. 1680</p>
        <h2>Canon<br /><i>in D</i></h2>
        <div className="piece-meta"><span>D MAJOR</span><span>4 / 4</span><span>{canon.tempo} BPM</span><span>≈ 4 MIN</span></div>
      </div>
    </section>
  )
}

function Progression({ activeBeat, playing }) {
  return (
    <div className="progression" aria-label="Canon in D chord progression">
      {canon.chords.map((chord, index) => {
        const active = playing && Math.floor(activeBeat) % canon.chords.length === index
        return (
          <div className={active ? 'active' : ''} key={chord.name}>
            <span>{chord.roman}</span><strong>{chord.name}</strong><small>{chord.notes.join(' · ')}</small>
          </div>
        )
      })}
    </div>
  )
}

function NotePath({ activeBeat, playing }) {
  const notes = canon.melodyNotes
  return (
    <div className="note-path" aria-label="Melody contour">
      <svg viewBox="0 0 800 170" role="img">
        <title>The melody falls, then gently rises</title>
        <path className="guide-path" d={notes.map((note, index) => `${index ? 'L' : 'M'} ${28 + index * 49.5} ${145 - note.level * 18}`).join(' ')} />
        {notes.map((note, index) => (
          <g className={playing && Math.floor(activeBeat) === index ? 'active' : ''} key={`${note.pitch}-${index}`}>
            <circle cx={28 + index * 49.5} cy={145 - note.level * 18} r="7" />
            <text x={28 + index * 49.5} y="164" textAnchor="middle">{note.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function LayerVisual({ type, player, id }) {
  const playing = player.playingId === id
  if (type === 'bass' || type === 'harmony') return <Progression activeBeat={player.activeBeat} playing={playing} />
  if (type === 'rhythm') {
    return (
      <div className="pulse-grid">
        {Array.from({ length: 16 }, (_, index) => <i className={playing && Math.floor(player.activeBeat * 2) === index ? 'active' : ''} key={index}><span>{index % 2 === 0 ? (index / 2) % 4 + 1 : '&'}</span></i>)}
      </div>
    )
  }
  if (type === 'melody') return <NotePath activeBeat={player.activeBeat} playing={playing} />
  return <Progression activeBeat={player.activeBeat} playing={playing} />
}

function LessonStep({ step, index, player, complete, onComplete }) {
  const id = `step-${step.id}`
  const playbackEvents = step.layer === 'complete' ? loadFullCanon : canon.layers[step.layer]
  return (
    <article className={`lesson-step ${complete ? 'complete' : ''}`} id={step.id}>
      <div className="step-index"><span>{String(index + 1).padStart(2, '0')}</span><i /></div>
      <div className="step-copy">
        <p className="eyebrow">{step.kicker}</p>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <div className="insight"><Volume2 size={17} /><span><strong>Listen for:</strong> {step.listenFor}</span></div>
      </div>
      <div className="step-workbench">
        <div className="workbench-head"><span>{step.label}</span><small>{step.caption}</small></div>
        <LayerVisual type={step.id} player={player} id={id} />
        <div className="workbench-actions">
          <PlayButton id={id} player={player} events={playbackEvents} label={`Play ${step.shortLabel}`} />
          <button className="mark-button" onClick={() => onComplete(step.id)}>
            {complete ? <Check size={16} /> : <span />}{complete ? 'Understood' : 'Mark understood'}
          </button>
        </div>
      </div>
    </article>
  )
}

function FinalPractice({ player, completed }) {
  return (
    <section className="final-practice" id="practice">
      <div>
        <p className="eyebrow">PUT THE ROOM BACK TOGETHER</p>
        <h2>Now hear the whole.</h2>
        <p>You know what every floor is doing. Listen once more: anchor in the bass, motion in the inner notes, direction in the melody.</p>
      </div>
      <div className="practice-player">
        <Layers3 size={28} />
        <div><span>{completed} OF {lessonSteps.length} LAYERS EXPLORED</span><strong>Canon in D · complete score</strong></div>
        <PlayButton id="final-full" player={player} events={loadFullCanon} label="Play full Canon" />
        <a className="score-credit" href={FULL_CANON_SOURCE} target="_blank" rel="noreferrer">3 violins and basso · Mutopia CC BY 4.0</a>
      </div>
    </section>
  )
}

function App() {
  const [theme, setTheme] = useState(getStoredTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || [] } catch { return [] }
  })
  const player = useCanonPlayer()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleComplete = (id) => {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div id="top">
      <Header theme={theme} onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero player={player} />
        <section className="method" id="dissection">
          <div><p className="eyebrow">THE PIANO BOOK METHOD</p><h2>Build from the floor up.</h2></div>
          <p>A piece can feel like a wall of sound. We’ll make it transparent—one musical job at a time.</p>
          <div className="method-line">
            {lessonSteps.map((step, index) => <a href={`#${step.id}`} key={step.id}><span>{index + 1}</span>{step.nav}<ChevronRight size={13} /></a>)}
          </div>
        </section>
        <section className="lesson-stack">
          {lessonSteps.map((step, index) => <LessonStep step={step} index={index} player={player} complete={completed.includes(step.id)} onComplete={toggleComplete} key={step.id} />)}
        </section>
        <FinalPractice player={player} completed={completed.length} />
      </main>
      <footer><Logo /><p>One beautiful piece at a time.</p><a href="#top">Back to top <ArrowRight size={13} /></a></footer>
    </div>
  )
}

export default App
