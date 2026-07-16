import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
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
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import { PianoEngine } from './audio.js'
import { course, lessons } from './course.js'
import { keys, patterns } from './data.js'
import { demoPieces } from './demoMusic.js'

const PROGRESS_KEY = 'pianobook-progress-v1'
const CURRENT_LESSON_KEY = 'pianobook-current-lesson'

function storedLessonIndex() {
  const savedId = localStorage.getItem(CURRENT_LESSON_KEY)
  const index = lessons.findIndex((lesson) => lesson.id === savedId)
  return index >= 0 ? index : 0
}

function storedProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')
    return new Set(Array.isArray(saved) ? saved.filter((id) => lessons.some((lesson) => lesson.id === id)) : [])
  } catch {
    return new Set()
  }
}

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Piano Book home">
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <span className="brand-copy">
        <strong>Piano Book</strong>
        <small>Play beautifully, simply.</small>
      </span>
    </a>
  )
}

function Header({ menuOpen, setMenuOpen, theme, toggleTheme, completedCount }) {
  const percent = Math.round((completedCount / lessons.length) * 100)

  return (
    <header className="site-header">
      <Logo />
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <a className="active" href="#course" onClick={() => setMenuOpen(false)}>Lessons</a>
        <a href="#formulas" onClick={() => setMenuOpen(false)}>Formulas</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>Practice</a>
        <a href="#demo-music" onClick={() => setMenuOpen(false)}>Demos</a>
      </nav>
      <div className="header-actions">
        <div className="header-progress" aria-label={`Course progress: ${percent} percent`}>
          <span>YOUR PROGRESS</span>
          <div className="progress-track"><i style={{ width: `${percent}%` }} /></div>
          <strong>{percent}%</strong>
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

function ChapterRail({ currentLesson, completed, onNavigate }) {
  return (
    <aside className="chapter-rail" aria-label="Course chapters">
      <p className="eyebrow">THE COURSE · {lessons.length} LESSONS</p>
      <div className="chapter-list">
        {course.map((chapter) => {
          const active = chapter.id === currentLesson.chapterId
          const chapterComplete = chapter.lessons.every((lesson) => completed.has(lesson.id))

          return (
            <div className={`chapter ${active ? 'active' : ''}`} key={chapter.id}>
              <button className="chapter-heading" onClick={() => onNavigate(chapter.lessons[0].id)} aria-expanded={active}>
                <div className="chapter-number">
                  {chapterComplete ? <Check size={14} /> : active ? <span className="pulse-dot" /> : chapter.number}
                </div>
                <div>
                  <strong>{chapter.title}</strong>
                  <span>{chapter.detail}</span>
                </div>
                {active && <span className="chapter-state">NOW</span>}
              </button>
              {active && (
                <div className="rail-lessons">
                  {chapter.lessons.map((lesson, index) => (
                    <button
                      className={lesson.id === currentLesson.id ? 'current' : ''}
                      onClick={() => onNavigate(lesson.id)}
                      key={lesson.id}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {lesson.title} {lesson.accent}
                      {completed.has(lesson.id) && <CheckCircle2 size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="rail-note">
        <Sparkles size={18} />
        <p><strong>A little each day.</strong><br />Ten focused minutes beats an hour once a week.</p>
      </div>
    </aside>
  )
}

function MobileCourseNav({ lessonIndex, completed, onSelectLesson }) {
  return (
    <div className="mobile-course-nav" aria-label="Choose a lesson">
      <div>
        <span>COURSE LESSON</span>
        <strong>{lessonIndex + 1} of {lessons.length}</strong>
      </div>
      <div className="mobile-lesson-select">
        <select value={lessonIndex} onChange={(event) => onSelectLesson(Number(event.target.value))} aria-label="Current course lesson">
          {lessons.map((lesson, index) => (
            <option key={lesson.id} value={index}>
              {completed.has(lesson.id) ? '✓ ' : ''}{index + 1}. {lesson.title} {lesson.accent}
            </option>
          ))}
        </select>
        <ChevronDown size={16} />
      </div>
    </div>
  )
}

function LessonHero({ lesson }) {
  return (
    <section className="lesson-hero" id="lesson">
      <div className="hero-meta">
        <span>CHAPTER {lesson.chapterNumber}</span><i /><span>LESSON {lesson.lessonNumber}</span>
        <span className="duration"><BookOpen size={14} /> {lesson.duration} MIN</span>
      </div>
      <h1>{lesson.title}<br /><em>{lesson.accent}</em></h1>
      <p>{lesson.intro}</p>
      <div className="hero-rule"><span>Today’s idea</span><i /><strong>{lesson.idea}</strong></div>
    </section>
  )
}

function PatternPicker({ availablePatterns, selectedId, onSelect, lesson }) {
  return (
    <section className="pattern-picker" id="formulas">
      <div className="section-heading">
        <div><span className="step-label">STEP 1</span><h2>{lesson.pickerTitle}</h2></div>
        <p>{lesson.pickerCopy}</p>
      </div>
      <div className={`pattern-grid pattern-count-${availablePatterns.length}`}>
        {availablePatterns.map((pattern) => (
          <button
            className={`pattern-card ${selectedId === pattern.id ? 'selected' : ''}`}
            key={pattern.id}
            onClick={() => onSelect(pattern.id)}
            aria-pressed={selectedId === pattern.id}
            data-testid={`pattern-${pattern.id}`}
          >
            <span className="pattern-index">{pattern.short}</span>
            <span className="pattern-icon" aria-hidden="true">
              {pattern.sequence.map((note, index) => <i key={index} style={{ height: `${10 + note * 7}px` }} />)}
            </span>
            <strong>{pattern.name}</strong><small>{pattern.subtitle}</small>
            {selectedId === pattern.id && <span className="selected-check"><Check size={13} /></span>}
          </button>
        ))}
      </div>
    </section>
  )
}

function BeatDiagram({ pattern, activeBeat, playing }) {
  return (
    <div className="beat-diagram" aria-label={`${pattern.name} note pattern`}>
      {pattern.sequence.map((note, index) => (
        <div className={`beat ${playing && activeBeat === index ? 'active' : ''}`} key={index}>
          <span className="beat-note" style={{ '--note-level': note }}><i /></span>
          <small>{pattern.beats[index]}</small>
        </div>
      ))}
    </div>
  )
}

function ChordProgression({ chords, activeChord, isPlaying, meter }) {
  return (
    <div className="chord-progression">
      {chords.map((chord, index) => (
        <div className={`chord-card ${chord.color} ${isPlaying && activeChord === index ? 'active' : ''}`} key={`${chord.name}-${index}`}>
          <span className="roman">{chord.roman}</span><strong>{chord.name}</strong>
          <span className="chord-notes">{chord.notes.map((note) => note.replace(/\d/g, '')).join(' · ')}</span>
          <div className="beat-dots" aria-hidden="true">
            {Array.from({ length: meter }, (_, dot) => <i key={dot} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function normalizePitch(note) {
  const pitch = note?.replace(/\d/g, '')
  return { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }[pitch] || pitch
}

function Keyboard({ activeNote, handHint }) {
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2']
  const blackKeys = [
    { name: 'C#', left: 5.1 }, { name: 'D#', left: 12.3 }, { name: 'F#', left: 26.5 }, { name: 'G#', left: 33.7 }, { name: 'A#', left: 40.8 },
    { name: 'C#2', left: 55.1 }, { name: 'D#2', left: 62.3 }, { name: 'F#2', left: 76.5 }, { name: 'G#2', left: 83.7 }, { name: 'A#2', left: 90.8 },
  ]
  const activePitch = normalizePitch(activeNote)

  return (
    <div className="keyboard-wrap">
      <div className="keyboard" aria-label={activeNote ? `Currently playing ${activeNote}` : 'Piano keyboard'}>
        {whiteKeys.map((key, index) => <span className={`white-key ${activePitch === key.replace(/\d/g, '') ? 'active' : ''}`} key={`${key}-${index}`} />)}
        {blackKeys.map((key) => (
          <span
            className={`black-key ${activePitch === key.name.replace(/\d/g, '') ? 'active' : ''}`}
            style={{ left: `${key.left}%` }}
            key={key.name}
          />
        ))}
      </div>
      <div className="hand-hint"><span>LH</span> {handHint}</div>
    </div>
  )
}

function PracticeStudio({ keyName, setKeyName, tempo, setTempo, pattern, lesson }) {
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
    playbackRequest.current += 1
    timers.current.forEach((timer) => clearTimeout(timer))
    timers.current = []
    engine.current?.stop()
    setIsPlaying(false)
    setActiveStep(-1)
  }, [keyName, tempo, pattern.id, lesson.id])

  const startPlayback = async () => {
    if (isPlaying) {
      clearPlayback()
      return
    }
    if (!engine.current) engine.current = new PianoEngine((progress) => setLoadProgress(progress))
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

    if (request !== playbackRequest.current) return

    const schedule = engine.current.schedule(chords, pattern.sequence, tempo, pattern.subdivision)
    setIsPlaying(true)
    for (let step = 0; step < schedule.totalSteps; step += 1) {
      timers.current.push(setTimeout(() => setActiveStep(step), schedule.startDelay + step * schedule.stepMs))
    }
    timers.current.push(setTimeout(clearPlayback, schedule.startDelay + schedule.totalSteps * schedule.stepMs + 120))
  }

  return (
    <section className="studio" aria-label="Interactive practice studio">
      <div className="studio-topline">
        <div><span className="step-label light">STEP 2</span><h2>{lesson.studioTitle}</h2></div>
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
            <input type="range" min="52" max="108" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} aria-label="Tempo" />
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

      <ChordProgression chords={chords} activeChord={activeChord} isPlaying={isPlaying} meter={pattern.meter || 4} />
      <Keyboard activeNote={activeNote} handHint={lesson.handHint} />

      <div className="transport">
        <button className="reset-button" onClick={clearPlayback} aria-label="Reset practice"><RotateCcw size={17} /></button>
        <button className={`play-button ${isPlaying ? 'playing' : ''}`} onClick={startPlayback} data-testid="play-practice" disabled={audioStatus === 'loading'}>
          <span>
            {audioStatus === 'loading' ? <LoaderCircle className="loading-icon" size={20} /> : isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </span>
          {audioStatus === 'loading'
            ? `Loading grand piano${loadProgress.total ? ` · ${Math.round((loadProgress.loaded / loadProgress.total) * 100)}%` : '…'}`
            : isPlaying ? 'Stop playback' : audioStatus === 'error' ? 'Retry piano audio' : 'Play the formula'}
        </button>
        <div className={`listen-note ${audioStatus}`} role="status" aria-live="polite">
          <Headphones size={17} />
          {audioStatus === 'loading' && <span>Preparing <strong>two dynamic layers</strong><br />for a natural piano sound.</span>}
          {audioStatus === 'ready' && <span>Sampled Steinway grand.<br /><strong>Cached for your next session.</strong></span>}
          {audioStatus === 'error' && <span>Samples couldn’t load.<br /><strong>Check your connection and retry.</strong></span>}
          {audioStatus === 'idle' && <span>Listen for the <strong>shape</strong>,<br />not each separate note.</span>}
        </div>
      </div>
    </section>
  )
}

function LearningNotes({ lesson }) {
  return (
    <section className="learning-notes" id="about">
      <article>
        <span className="note-icon"><Volume2 size={20} /></span>
        <div><span className="note-kicker">LISTEN FOR</span><h3>{lesson.listen.title}</h3><p>{lesson.listen.body}</p></div>
      </article>
      <article>
        <span className="note-icon"><Info size={20} /></span>
        <div><span className="note-kicker">PLAYING TIP</span><h3>{lesson.tip.title}</h3><p>{lesson.tip.body}</p></div>
      </article>
    </section>
  )
}

function PracticeChallenge({ lesson, isComplete, onComplete }) {
  const [checked, setChecked] = useState([])
  const allChecked = checked.length === lesson.challenge.length

  const toggle = (index) => {
    setChecked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  return (
    <section className="practice-challenge" aria-labelledby="challenge-title">
      <div className="challenge-heading">
        <span className="challenge-icon"><Trophy size={20} /></span>
        <div><span className="step-label">STEP 3</span><h2 id="challenge-title">Make it yours</h2></div>
        <p>Finish these three small passes. Musical confidence grows through clear, repeatable wins.</p>
      </div>
      <div className="challenge-list">
        {lesson.challenge.map((item, index) => (
          <button className={checked.includes(index) ? 'checked' : ''} onClick={() => toggle(index)} key={item}>
            <span>{checked.includes(index) ? <Check size={15} /> : index + 1}</span>{item}
          </button>
        ))}
      </div>
      <div className="complete-row">
        <p>{isComplete ? 'Lesson saved as complete. You can revisit it anytime.' : allChecked ? 'Beautiful. That is the work.' : 'Tick each pass as you practice, then save the lesson.'}</p>
        <button className={isComplete ? 'is-complete' : ''} onClick={onComplete}>
          <CheckCircle2 size={17} /> {isComplete ? 'Completed' : 'Mark lesson complete'}
        </button>
      </div>
    </section>
  )
}

function LessonNavigation({ previous, next, onNavigate, courseComplete }) {
  return (
    <section className={`lesson-navigation ${courseComplete ? 'course-complete' : ''}`} aria-label="Lesson navigation">
      {previous ? (
        <button className="previous-lesson" onClick={() => onNavigate(previous.id)}>
          <ArrowLeft size={16} /><span><small>PREVIOUS</small>{previous.title} {previous.accent}</span>
        </button>
      ) : <span />}
      {next ? (
        <div className="next-copy">
          <span>UP NEXT · LESSON {next.courseNumber}</span>
          <h2>{next.title} {next.accent}</h2>
          <button onClick={() => onNavigate(next.id)}>NEXT LESSON <ArrowRight size={17} /></button>
        </div>
      ) : (
        <div className="next-copy final-copy">
          <span>{courseComplete ? 'COURSE COMPLETE' : 'FINAL LESSON'}</span>
          <h2>{courseComplete ? 'You built an accompaniment practice.' : 'Mark this lesson complete when it feels like yours.'}</h2>
          <p>{courseComplete ? 'Keep returning, changing keys, and listening more closely. The course ends; the music does not.' : 'Your progress is saved in this browser.'}</p>
        </div>
      )}
    </section>
  )
}

function pitchPosition(pitch) {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/)
  if (!match) return { y: 60, accidental: '' }
  const [, letter, accidental, octave] = match
  const scaleIndex = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }[letter]
  const stepsFromE4 = (Number(octave) - 4) * 7 + scaleIndex - 2
  return { y: 78 - stepsFromE4 * 5, accidental: accidental === 'b' ? '♭' : accidental === '#' ? '♯' : '' }
}

function MusicStaff({ piece, activeNote }) {
  const left = 72
  const width = 824
  const xForBeat = (beat) => left + (beat / piece.totalBeats) * width

  return (
    <svg className="music-staff" viewBox="0 0 930 132" role="img" aria-label={`${piece.title} melody excerpt in ${piece.key}`}>
      <g className="staff-lines">
        {[38, 48, 58, 68, 78].map((y) => <line x1="46" x2="906" y1={y} y2={y} key={y} />)}
      </g>
      <text className="clef" x="47" y="77">𝄞</text>
      <text className="time-signature" x="66" y="52">{piece.meterLabel.split('/')[0]}</text>
      <text className="time-signature" x="66" y="70">{piece.meterLabel.split('/')[1]}</text>
      {Array.from({ length: piece.totalBeats / piece.meter + 1 }, (_, index) => (
        <line className="bar-line" x1={xForBeat(index * piece.meter)} x2={xForBeat(index * piece.meter)} y1="38" y2="78" key={index} />
      ))}
      {piece.melody.map((event, index) => {
        const { y, accidental } = pitchPosition(event.notes[0])
        const x = xForBeat(event.beat + Math.min(event.duration, 0.5) * 0.35)
        const open = event.duration >= 1.5
        const stemUp = y > 53
        return (
          <g className={`score-note ${activeNote === index ? 'active' : ''}`} key={`${event.beat}-${event.notes[0]}-${index}`}>
            {accidental && <text className="accidental" x={x - 13} y={y + 4}>{accidental}</text>}
            {(y >= 83 || y <= 33) && <line className="ledger-line" x1={x - 8} x2={x + 8} y1={y} y2={y} />}
            <ellipse className={open ? 'open' : ''} cx={x} cy={y} rx="5.5" ry="4" transform={`rotate(-18 ${x} ${y})`} />
            <line className="note-stem" x1={stemUp ? x + 5 : x - 5} x2={stemUp ? x + 5 : x - 5} y1={y} y2={stemUp ? y - 25 : y + 25} />
            {event.duration < 0.75 && <path className="note-flag" d={stemUp ? `M ${x + 5} ${y - 25} q 12 7 5 16` : `M ${x - 5} ${y + 25} q -12 -7 -5 -16`} />}
          </g>
        )
      })}
    </svg>
  )
}

function DemoMusic() {
  const [playingId, setPlayingId] = useState(null)
  const [activeNotes, setActiveNotes] = useState({})
  const [audioStatus, setAudioStatus] = useState('idle')
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 })
  const engine = useRef(null)
  const timers = useRef([])
  const playbackRequest = useRef(0)

  const stopPlayback = () => {
    playbackRequest.current += 1
    timers.current.forEach((timer) => clearTimeout(timer))
    timers.current = []
    engine.current?.stop()
    setPlayingId(null)
    setActiveNotes({})
  }

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer))
    engine.current?.dispose()
  }, [])

  const play = async (piece) => {
    if (playingId === piece.id) {
      stopPlayback()
      return
    }
    stopPlayback()
    if (!engine.current) engine.current = new PianoEngine((progress) => setLoadProgress(progress))
    const request = ++playbackRequest.current

    try {
      if (!engine.current.isReady) setAudioStatus('loading')
      await engine.current.ready()
      setAudioStatus('ready')
    } catch (error) {
      console.error('Unable to load demo piano audio', error)
      engine.current?.dispose()
      engine.current = null
      setAudioStatus('error')
      return
    }

    if (request !== playbackRequest.current) return
    const schedule = engine.current.scheduleEvents(piece.events, piece.tempo)
    setPlayingId(piece.id)
    piece.melody.forEach((event, index) => {
      timers.current.push(setTimeout(() => setActiveNotes({ [piece.id]: index }), schedule.startDelay + event.beat * schedule.beatMs))
    })
    timers.current.push(setTimeout(stopPlayback, schedule.startDelay + schedule.totalBeats * schedule.beatMs + 180))
  }

  return (
    <section className="demo-music" id="demo-music" aria-labelledby="demo-music-title">
      <div className="demo-heading">
        <div><span className="eyebrow">LISTENING ROOM</span><h2 id="demo-music-title">Three scores, brought to life.</h2></div>
        <p>Follow the highlighted melody while a learner-friendly piano arrangement plays. Each excerpt preserves the source key, meter, and theme.</p>
      </div>
      <div className="demo-list">
        {demoPieces.map((piece, index) => {
          const playing = playingId === piece.id
          return (
            <article className={`demo-piece ${playing ? 'is-playing' : ''}`} key={piece.id}>
              <div className="demo-number">0{index + 1}</div>
              <div className="demo-copy">
                <span>{piece.key.toUpperCase()} · {piece.meterLabel} · {piece.tempo} BPM</span>
                <h3>{piece.title}{piece.subtitle && <small>{piece.subtitle}</small>}</h3>
                <p>{piece.composer}</p>
                <em>{piece.character}</em>
              </div>
              <div className="score-wrap"><MusicStaff piece={piece} activeNote={activeNotes[piece.id]} /></div>
              <div className="demo-actions">
                <button data-testid={`play-demo-${piece.id}`} onClick={() => play(piece)} disabled={audioStatus === 'loading'} aria-label={`${playing ? 'Stop' : 'Play'} ${piece.title}`}>
                  <span>{audioStatus === 'loading' ? <LoaderCircle className="loading-icon" size={18} /> : playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</span>
                  {audioStatus === 'loading' ? `${loadProgress.total ? Math.round((loadProgress.loaded / loadProgress.total) * 100) : 0}%` : playing ? 'Stop' : 'Listen'}
                </button>
                <a href={piece.sourceUrl} target="_blank" rel="noreferrer">Public-domain score ↗</a>
              </div>
            </article>
          )
        })}
      </div>
      <p className={`demo-status ${audioStatus}`} role="status" aria-live="polite">
        {audioStatus === 'loading' && 'Preparing the sampled grand piano…'}
        {audioStatus === 'ready' && 'Sampled grand piano ready. Select any score to listen.'}
        {audioStatus === 'error' && 'The piano samples could not load. Check your connection and try again.'}
      </p>
    </section>
  )
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(storedLessonIndex)
  const [completed, setCompleted] = useState(storedProgress)
  const currentLesson = lessons[currentIndex]
  const [selectedPatternId, setSelectedPatternId] = useState(() => currentLesson.defaultPattern)
  const [keyName, setKeyName] = useState(() => currentLesson.defaultKey)
  const [tempo, setTempo] = useState(() => currentLesson.tempo)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const pattern = useMemo(() => patterns.find((item) => item.id === selectedPatternId) || patterns[0], [selectedPatternId])

  useEffect(() => {
    document.title = `${currentLesson.title} ${currentLesson.accent} · Piano Book`
  }, [currentLesson])

  const navigate = (lessonId) => {
    const index = lessons.findIndex((lesson) => lesson.id === lessonId)
    if (index < 0) return
    const nextLesson = lessons[index]
    setCurrentIndex(index)
    setSelectedPatternId(nextLesson.defaultPattern)
    setKeyName(nextLesson.defaultKey)
    setTempo(nextLesson.tempo)
    setMenuOpen(false)
    localStorage.setItem(CURRENT_LESSON_KEY, nextLesson.id)
    requestAnimationFrame(() => document.querySelector('#lesson')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const toggleComplete = () => {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(currentLesson.id)) next.delete(currentLesson.id)
      else next.add(currentLesson.id)
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]))
      return next
    })
  }

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
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} theme={theme} toggleTheme={toggleTheme} completedCount={completed.size} />
      <main>
        <div className="course-layout" id="course">
          <ChapterRail currentLesson={currentLesson} completed={completed} onNavigate={navigate} />
          <div className="lesson-content">
            <MobileCourseNav lessonIndex={currentIndex} onSelectLesson={(index) => navigate(lessons[index].id)} completed={completed} />
            <LessonHero lesson={currentLesson} />
            <PatternPicker
              availablePatterns={patterns.filter((item) => currentLesson.patternIds.includes(item.id))}
              selectedId={selectedPatternId}
              onSelect={setSelectedPatternId}
              lesson={currentLesson}
            />
            <PracticeStudio keyName={keyName} setKeyName={setKeyName} tempo={tempo} setTempo={setTempo} pattern={pattern} lesson={currentLesson} />
            <LearningNotes lesson={currentLesson} />
            <PracticeChallenge key={currentLesson.id} lesson={currentLesson} isComplete={completed.has(currentLesson.id)} onComplete={toggleComplete} />
            <LessonNavigation
              previous={lessons[currentIndex - 1]}
              next={lessons[currentIndex + 1]}
              onNavigate={navigate}
              courseComplete={completed.size === lessons.length}
            />
          </div>
        </div>
        <DemoMusic />
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
