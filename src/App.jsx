import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Headphones,
  Info,
  LoaderCircle,
  Menu,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Volume2,
  X,
} from 'lucide-react'
import { PianoEngine } from './audio.js'
import { chapters, keys, patterns } from './data.js'

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Piano Book home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-copy">
        <strong>Piano Book</strong>
        <small>Play beautifully, simply.</small>
      </span>
    </a>
  )
}

function Header({ menuOpen, setMenuOpen, theme, toggleTheme }) {
  return (
    <header className="site-header">
      <Logo />
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <a className="active" href="#lesson" onClick={() => setMenuOpen(false)}>Lessons</a>
        <a href="#formulas" onClick={() => setMenuOpen(false)}>Formulas</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
      </nav>
      <div className="header-actions">
        <div className="header-progress" aria-label="Course progress: 18 percent">
          <span>YOUR PROGRESS</span>
          <div className="progress-track"><i /></div>
          <strong>18%</strong>
        </div>
        <button
          className="theme-button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}

function ChapterRail() {
  return (
    <aside className="chapter-rail" aria-label="Course chapters">
      <p className="eyebrow">THE COURSE</p>
      <div className="chapter-list">
        {chapters.map((chapter) => (
          <div className={`chapter ${chapter.active ? 'active' : ''}`} key={chapter.number}>
            <div className="chapter-number">
              {chapter.active ? <span className="pulse-dot" /> : chapter.number}
            </div>
            <div>
              <strong>{chapter.title}</strong>
              <span>{chapter.detail}</span>
            </div>
            {chapter.active && <span className="chapter-state">NOW</span>}
          </div>
        ))}
      </div>
      <div className="rail-note">
        <Sparkles size={18} />
        <p><strong>A little each day.</strong><br />Ten focused minutes beats an hour once a week.</p>
      </div>
    </aside>
  )
}

function PatternPicker({ selected, onSelect }) {
  return (
    <div className="pattern-picker" id="formulas">
      <div className="section-heading">
        <div>
          <span className="step-label">STEP 1</span>
          <h2>Choose a formula</h2>
        </div>
        <p>One chord progression. Four completely different moods.</p>
      </div>
      <div className="pattern-grid">
        {patterns.map((pattern, index) => (
          <button
            className={`pattern-card ${selected === index ? 'selected' : ''}`}
            key={pattern.id}
            onClick={() => onSelect(index)}
            aria-pressed={selected === index}
            data-testid={`pattern-${pattern.id}`}
          >
            <span className="pattern-index">{pattern.short}</span>
            <span className="pattern-icon" aria-hidden="true">
              {pattern.sequence.map((note, i) => <i key={i} style={{ height: `${10 + note * 7}px` }} />)}
            </span>
            <strong>{pattern.name}</strong>
            <small>{pattern.subtitle}</small>
            {selected === index && <span className="selected-check"><Check size={13} /></span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function BeatDiagram({ pattern, activeBeat, playing }) {
  return (
    <div className="beat-diagram" aria-label={`${pattern.name} note pattern`}>
      {pattern.sequence.map((note, index) => (
        <div className={`beat ${playing && activeBeat === index ? 'active' : ''}`} key={index}>
          <span className="beat-note" style={{ '--note-level': note }}>
            <i />
          </span>
          <small>{pattern.beats[index]}</small>
        </div>
      ))}
    </div>
  )
}

function ChordProgression({ chords, activeChord, isPlaying }) {
  return (
    <div className="chord-progression">
      {chords.map((chord, index) => (
        <div className={`chord-card ${chord.color} ${isPlaying && activeChord === index ? 'active' : ''}`} key={`${chord.name}-${index}`}>
          <span className="roman">{chord.roman}</span>
          <strong>{chord.name}</strong>
          <span className="chord-notes">{chord.notes.map((note) => note.replace(/\d/g, '')).join(' · ')}</span>
          <div className="beat-dots" aria-hidden="true">
            {[0, 1, 2, 3].map((dot) => <i key={dot} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function Keyboard({ activeNote }) {
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2']
  const blackKeys = [
    { name: 'C#', left: 5.1 }, { name: 'D#', left: 12.3 }, { name: 'F#', left: 26.5 }, { name: 'G#', left: 33.7 }, { name: 'A#', left: 40.8 },
    { name: 'C#2', left: 55.1 }, { name: 'D#2', left: 62.3 }, { name: 'F#2', left: 76.5 }, { name: 'G#2', left: 83.7 }, { name: 'A#2', left: 90.8 },
  ]
  const activePitch = activeNote?.replace(/\d/g, '').replace('b', '#')

  return (
    <div className="keyboard-wrap">
      <div className="keyboard" aria-label={activeNote ? `Currently playing ${activeNote}` : 'Piano keyboard'}>
        {whiteKeys.map((key, index) => (
          <span className={`white-key ${activePitch === key.replace(/\d/g, '') ? 'active' : ''}`} key={`${key}-${index}`} />
        ))}
        {blackKeys.map((key) => (
          <span className={`black-key ${activePitch === key.name.replace(/\d/g, '') ? 'active' : ''}`} style={{ left: `${key.left}%` }} key={key.name} />
        ))}
      </div>
      <div className="hand-hint"><span>LH</span> Keep your wrist soft and let your hand move as one shape.</div>
    </div>
  )
}

function PracticeStudio({ keyName, setKeyName, tempo, setTempo, pattern }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [audioStatus, setAudioStatus] = useState('idle')
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 })
  const engine = useRef(null)
  const timers = useRef([])
  const playbackRequest = useRef(0)
  const chords = keys[keyName].chords
  const activeChord = activeStep < 0 ? -1 : Math.floor(activeStep / pattern.sequence.length)
  const activeBeat = activeStep < 0 ? -1 : activeStep % pattern.sequence.length
  const activeNote = activeChord >= 0 ? chords[activeChord]?.notes[pattern.sequence[activeBeat]] : null

  const clearPlayback = () => {
    playbackRequest.current += 1
    timers.current.forEach((timer) => clearTimeout(timer))
    timers.current = []
    engine.current?.stop()
    setIsPlaying(false)
    setActiveStep(-1)
  }

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer))
    engine.current?.dispose()
  }, [])
  useEffect(() => {
    clearPlayback()
  // The selected musical inputs intentionally reset playback.
  }, [keyName, tempo, pattern.id])

  const startPlayback = async () => {
    if (isPlaying) {
      clearPlayback()
      return
    }
    if (!engine.current) {
      engine.current = new PianoEngine((progress) => setLoadProgress(progress))
    }
    const request = ++playbackRequest.current

    try {
      if (!engine.current.isReady) setAudioStatus('loading')
      await engine.current.ready()
      setAudioStatus('ready')
    } catch (error) {
      console.error('Unable to load the sampled piano', error)
      engine.current.dispose()
      engine.current = null
      setAudioStatus('error')
      return
    }

    // Changing a formula, key, or tempo while samples load cancels autoplay.
    if (request !== playbackRequest.current) return

    const schedule = engine.current.schedule(chords, pattern.sequence, tempo)
    setIsPlaying(true)

    for (let step = 0; step < schedule.totalSteps; step += 1) {
      const timer = setTimeout(() => setActiveStep(step), schedule.startDelay + step * schedule.stepMs)
      timers.current.push(timer)
    }
    timers.current.push(setTimeout(clearPlayback, schedule.startDelay + schedule.totalSteps * schedule.stepMs + 120))
  }

  return (
    <section className="studio" aria-label="Interactive practice studio">
      <div className="studio-topline">
        <div>
          <span className="step-label light">STEP 2</span>
          <h2>Hear it. Then play it.</h2>
        </div>
        <div className="studio-controls">
          <label>
            <span>KEY</span>
            <div className="select-wrap">
              <select value={keyName} onChange={(event) => setKeyName(event.target.value)} aria-label="Practice key">
                {Object.entries(keys).map(([value, key]) => <option value={value} key={value}>{key.label}</option>)}
              </select>
              <ChevronDown size={14} />
            </div>
          </label>
          <label className="tempo-control">
            <span>TEMPO <strong>{tempo}</strong> BPM</span>
            <input
              type="range"
              min="52"
              max="108"
              value={tempo}
              onChange={(event) => setTempo(Number(event.target.value))}
              aria-label="Tempo"
            />
          </label>
        </div>
      </div>

      <div className="formula-summary">
        <div className="formula-copy">
          <span>{pattern.level.toUpperCase()} FORMULA</span>
          <h3>{pattern.name}</h3>
          <p>{pattern.description}</p>
        </div>
        <BeatDiagram pattern={pattern} activeBeat={activeBeat} playing={isPlaying} />
      </div>

      <ChordProgression chords={chords} activeChord={activeChord} isPlaying={isPlaying} />
      <Keyboard activeNote={activeNote} />

      <div className="transport">
        <button className="reset-button" onClick={clearPlayback} aria-label="Reset practice">
          <RotateCcw size={17} />
        </button>
        <button
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={startPlayback}
          data-testid="play-practice"
          disabled={audioStatus === 'loading'}
        >
          <span>
            {audioStatus === 'loading'
              ? <LoaderCircle className="loading-icon" size={20} />
              : isPlaying
                ? <Pause size={20} fill="currentColor" />
                : <Play size={20} fill="currentColor" />}
          </span>
          {audioStatus === 'loading'
            ? `Loading grand piano${loadProgress.total ? ` · ${Math.round((loadProgress.loaded / loadProgress.total) * 100)}%` : '…'}`
            : isPlaying
              ? 'Stop playback'
              : audioStatus === 'error'
                ? 'Retry piano audio'
                : 'Play the formula'}
        </button>
        <div className={`listen-note ${audioStatus}`} role="status" aria-live="polite">
          <Headphones size={17} />
          {audioStatus === 'loading' && <span>Preparing <strong>two dynamic layers</strong><br />for a natural piano sound.</span>}
          {audioStatus === 'ready' && <span>Sampled Steinway grand.<br /><strong>Headphones recommended.</strong></span>}
          {audioStatus === 'error' && <span>Samples couldn’t load.<br /><strong>Check your connection and retry.</strong></span>}
          {audioStatus === 'idle' && <span>Listen for the <strong>shape</strong>,<br />not each separate note.</span>}
        </div>
      </div>
    </section>
  )
}

function LearningNotes() {
  return (
    <section className="learning-notes" id="about">
      <article>
        <span className="note-icon"><Volume2 size={20} /></span>
        <div>
          <span className="note-kicker">LISTEN FOR</span>
          <h3>The bass tells the story.</h3>
          <p>Even when the right hand rests, these four roots make the progression recognizable. Hum the melody while the left hand loops.</p>
        </div>
      </article>
      <article>
        <span className="note-icon"><Info size={20} /></span>
        <div>
          <span className="note-kicker">PLAYING TIP</span>
          <h3>Move early, land softly.</h3>
          <p>As soon as you play beat four, let your eyes and wrist prepare for the next chord. Accuracy comes from calm movement.</p>
        </div>
      </article>
    </section>
  )
}

function NextLesson() {
  return (
    <section className="next-lesson">
      <div className="next-number">02</div>
      <div>
        <span>UP NEXT · ADD COLOR</span>
        <h2>Turn three notes into a richer chord.</h2>
        <p>Meet the seventh—the single note that can make a chord feel warm, wistful, or ready to move.</p>
      </div>
      <button disabled title="Complete this lesson to continue">
        COMING SOON <ArrowRight size={17} />
      </button>
    </section>
  )
}

function App() {
  const [selectedPattern, setSelectedPattern] = useState(2)
  const [keyName, setKeyName] = useState('C')
  const [tempo, setTempo] = useState(72)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const pattern = useMemo(() => patterns[selectedPattern], [selectedPattern])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    document.documentElement.style.colorScheme = nextTheme
    document.querySelector('#theme-color')?.setAttribute('content', nextTheme === 'dark' ? '#171a18' : '#f4f1e9')
    localStorage.setItem('pianobook-theme', nextTheme)
    setTheme(nextTheme)
  }

  return (
    <div id="top">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} theme={theme} toggleTheme={toggleTheme} />
      <main>
        <div className="course-layout" id="lesson">
          <ChapterRail />
          <div className="lesson-content">
            <section className="lesson-hero">
              <div className="hero-meta"><span>CHAPTER 01</span><i /><span>LESSON 01</span><span className="duration"><BookOpen size={14} /> 10 MIN</span></div>
              <h1>Make one chord<br /><em>feel like music.</em></h1>
              <p>You already know the notes. Now let’s give them motion. Four simple left-hand patterns are all you need to turn a chord chart into an accompaniment.</p>
              <div className="hero-rule"><span>Today’s idea</span><i /><strong>Harmony + motion = accompaniment</strong></div>
            </section>

            <PatternPicker selected={selectedPattern} onSelect={setSelectedPattern} />
            <PracticeStudio
              keyName={keyName}
              setKeyName={setKeyName}
              tempo={tempo}
              setTempo={setTempo}
              pattern={pattern}
            />
            <LearningNotes />
            <NextLesson />
          </div>
        </div>
      </main>
      <footer>
        <Logo />
        <p>Music theory you can hear in your hands.</p>
        <span>© 2026 Piano Book</span>
      </footer>
    </div>
  )
}

export default App
