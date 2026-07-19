import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play, Square, ZoomIn, ZoomOut } from 'lucide-react'

const MEASURE_BEATS = 4
const MEASURE_WIDTH = 340
const SCORE_MARGIN = 18
const PRINT_MEASURE_WIDTH = 379
const PRINT_MEASURES_PER_SYSTEM = 2
const PRINT_SYSTEM_HEIGHT = 210

function vexKey(pitch) {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/)
  if (!match) return 'b/4'
  const [, letter, accidental, octave] = match
  return `${letter.toLowerCase()}${accidental}/${octave}`
}

function notationBeats(event) {
  if (event.duration <= 0.3) return 0.25
  if (event.duration <= 0.6) return 0.5
  if (event.duration <= 0.85) return 0.75
  if (event.duration <= 1.25) return 1
  if (event.duration <= 1.75) return 1.5
  if (event.duration <= 2.5) return 2
  return 4
}

function durationCode(duration) {
  if (duration === 0.25) return { code: '16', dotted: false }
  if (duration === 0.5) return { code: '8', dotted: false }
  if (duration === 0.75) return { code: '8', dotted: true }
  if (duration === 1) return { code: 'q', dotted: false }
  if (duration === 1.5) return { code: 'q', dotted: true }
  if (duration === 2) return { code: 'h', dotted: false }
  return { code: 'w', dotted: false }
}

function restEvents(beat, duration) {
  const rests = []
  let cursor = beat
  let remaining = duration
  const values = [4, 2, 1, 0.75, 0.5, 0.25]
  while (remaining > 0.001) {
    const value = values.find((candidate) => candidate <= remaining + 0.001) || 0.25
    rests.push({ beat: cursor, duration: value, notes: [], isRest: true })
    cursor += value
    remaining -= value
  }
  return rests
}

function eventsForMeasure(events, measure) {
  const startBeat = measure * MEASURE_BEATS
  const endBeat = startBeat + MEASURE_BEATS
  const measureEvents = events
    .filter((event) => event.beat >= startBeat && event.beat < endBeat)
    .sort((a, b) => a.beat - b.beat)
  const completeEvents = []
  let cursor = startBeat

  measureEvents.forEach((event) => {
    if (event.beat > cursor + 0.001) completeEvents.push(...restEvents(cursor, event.beat - cursor))
    const duration = Math.min(notationBeats(event), endBeat - event.beat)
    completeEvents.push({ ...event, duration })
    cursor = Math.max(cursor, event.beat + duration)
  })
  if (cursor < endBeat - 0.001) completeEvents.push(...restEvents(cursor, endBeat - cursor))
  return completeEvents
}

function createNotes(events, clef, stemDirection, StaveNote, Dot, Accidental, keySignature) {
  const accidentalState = new Map()
  const keyAccidentals = keySignature === 'D' ? { C: '#', F: '#' } : {}

  return events.map((event) => {
    const duration = durationCode(event.duration)
    const note = new StaveNote({
      clef,
      keys: event.isRest ? [clef === 'treble' ? 'b/4' : 'd/3'] : event.notes.map(vexKey),
      duration: `${duration.code}${event.isRest ? 'r' : ''}`,
      dots: duration.dotted ? 1 : 0,
      autoStem: stemDirection === undefined,
      ...(stemDirection === undefined ? {} : { stemDirection }),
    })
    if (duration.dotted) Dot.buildAndAttach([note], { all: true })
    if (!event.isRest) event.notes.forEach((pitch, noteIndex) => {
      const match = pitch.match(/^([A-G])([#b]?)(\d)$/)
      if (!match) return
      const [, letter, accidental, octave] = match
      const pitchKey = `${letter}${octave}`
      const currentAccidental = accidentalState.has(pitchKey) ? accidentalState.get(pitchKey) : (keyAccidentals[letter] ?? '')
      if (accidental !== currentAccidental) note.addModifier(new Accidental(accidental || 'n'), noteIndex)
      accidentalState.set(pitchKey, accidental)
    })
    return { beat: event.beat, note, isRest: event.isRest }
  })
}

function wholeRest(clef, StaveNote) {
  return new StaveNote({ clef, keys: [clef === 'treble' ? 'b/4' : 'd/3'], duration: 'wr' })
}

function interpolatePlayhead(positions, beat) {
  if (!positions.length) return null
  const exact = positions.find((position) => Math.abs(position.beat - beat) < 0.001)
  if (exact) return exact
  const before = [...positions].reverse().find((position) => position.beat < beat)
  const after = positions.find((position) => position.beat > beat)
  if (!before) return positions[0]
  if (!after) return { ...before, x: before.x + (beat - before.beat) * 58 }
  if (before.y !== after.y) return before
  const progress = (beat - before.beat) / (after.beat - before.beat)
  return { x: before.x + (after.x - before.x) * progress, y: before.y }
}

export default function PianoScore({ score, activeBeat, playing, title, printLayout = false, beatOffset = 0, onSeek }) {
  const scoreRoot = useRef(null)
  const [beatPositions, setBeatPositions] = useState([])
  const [noteTargets, setNoteTargets] = useState([])
  const measureCount = score.totalBeats / MEASURE_BEATS
  const measuresPerSystem = printLayout ? PRINT_MEASURES_PER_SYSTEM : measureCount
  const measureWidth = printLayout ? PRINT_MEASURE_WIDTH : MEASURE_WIDTH
  const systemCount = Math.ceil(measureCount / measuresPerSystem)
  const width = SCORE_MARGIN * 2 + measuresPerSystem * measureWidth
  const height = printLayout ? systemCount * PRINT_SYSTEM_HEIGHT + 20 : 245

  useEffect(() => {
    const root = scoreRoot.current
    if (!root) return
    root.replaceChildren()

    let cancelled = false

    const engrave = async () => {
      const { Accidental, Beam, Dot, Formatter, Renderer, Stave, StaveConnector, StaveNote, Stem, VexFlow, Voice } = await import('vexflow/bravura')
      await VexFlow.loadFonts('Bravura', 'Academico')
      VexFlow.setFonts('Bravura', 'Academico')
      if (cancelled) return
      const renderer = new Renderer(root, Renderer.Backends.SVG)
      renderer.resize(width, height)
      const context = renderer.getContext()
      const positions = []
      const targets = []
      const trackingClef = score.trebleVoices.length ? 'treble' : 'bass'

      for (let measure = 0; measure < measureCount; measure += 1) {
      const system = Math.floor(measure / measuresPerSystem)
      const measureInSystem = measure % measuresPerSystem
      const x = SCORE_MARGIN + measureInSystem * measureWidth
      const y = 22 + system * PRINT_SYSTEM_HEIGHT
      const trebleStave = new Stave(x, y, measureWidth)
      const bassStave = new Stave(x, y + 104, measureWidth)
      if (measure === 0 || (printLayout && measureInSystem === 0)) {
        trebleStave.addClef('treble').addKeySignature(score.keySignature ?? 'D')
        bassStave.addClef('bass').addKeySignature(score.keySignature ?? 'D')
        if (measure === 0) {
          trebleStave.addTimeSignature('4/4')
          bassStave.addTimeSignature('4/4')
        }
      }
      trebleStave.setContext(context).draw()
      bassStave.setContext(context).draw()

      if (measure === 0 || (printLayout && measureInSystem === 0)) {
        new StaveConnector(trebleStave, bassStave).setType('brace').setContext(context).draw()
        new StaveConnector(trebleStave, bassStave).setType('singleLeft').setContext(context).draw()
      }

        const drawStaffVoices = (voiceEvents, stave, clef) => {
        if (!voiceEvents.length) {
          const restVoice = new Voice('4/4').addTickables([wholeRest(clef, StaveNote)])
          new Formatter().joinVoices([restVoice]).formatToStave([restVoice], stave)
          restVoice.draw(context, stave)
          return
        }

        const measureVoices = voiceEvents.map((events, voiceIndex) => {
          const direction = voiceEvents.length > 1 ? (voiceIndex === 0 ? Stem.UP : Stem.DOWN) : undefined
          const entries = createNotes(eventsForMeasure(events, measure), clef, direction, StaveNote, Dot, Accidental, score.keySignature)
          const voice = new Voice('4/4').addTickables(entries.map((entry) => entry.note))
          const beamOptions = direction === undefined ? undefined : { stemDirection: direction }
          const beams = Beam.generateBeams(entries.map((entry) => entry.note), beamOptions)
          return { beams, entries, voice }
        })
        const voices = measureVoices.map((item) => item.voice)
        new Formatter().joinVoices(voices).formatToStave(voices, stave, { alignRests: true })
        measureVoices.forEach(({ beams, voice }) => {
          voice.draw(context, stave)
          beams.forEach((beam) => beam.setContext(context).draw())
        })

        measureVoices[0].entries.forEach(({ beat, note, isRest }) => {
          if (isRest) return
          note.getYs().forEach((noteY, noteIndex) => targets.push({
            beat,
            noteIndex,
            x: note.getAbsoluteX(),
            y: noteY,
          }))
        })

        if (clef === trackingClef) {
          const trackingVoice = measureVoices[0]
          trackingVoice.entries.forEach(({ beat, note }) => positions.push({ beat, x: note.getAbsoluteX(), y }))
        }
        }

        drawStaffVoices(score.trebleVoices, trebleStave, 'treble')
        drawStaffVoices(score.bassVoices, bassStave, 'bass')
        if (measure === measureCount - 1) {
          const trackingStave = trackingClef === 'treble' ? trebleStave : bassStave
          positions.push({ beat: score.totalBeats, x: trackingStave.getNoteEndX(), y })
        }
      }

      setBeatPositions(positions.sort((a, b) => a.beat - b.beat))
      setNoteTargets(targets)
    }

    engrave().catch((error) => console.error('Unable to engrave piano score', error))
    return () => { cancelled = true }
  }, [height, measureCount, measureWidth, measuresPerSystem, printLayout, score, width])

  const normalizedBeat = activeBeat === score.totalBeats ? activeBeat : activeBeat % score.totalBeats
  const playheadX = useMemo(() => interpolatePlayhead(beatPositions, normalizedBeat), [beatPositions, normalizedBeat])

  return (
    <div className={`piano-score${printLayout ? ' piano-score-print' : ''}`} aria-label={`${title} piano sheet music`}>
      <div className="score-label"><span>PIANO SCORE</span><small>properly voiced · {score.keySignature === 'C' ? 'C major' : 'D major'} · 4/4</small></div>
      <div className="score-scroll">
        <div className="engraved-score" ref={scoreRoot} style={{ width: `${width}px`, height: `${height}px` }} />
        {onSeek && noteTargets.map((target) => <button
          className="score-note-target"
          key={`${target.beat}-${target.y}-${target.noteIndex}`}
          style={{ left: `${target.x}px`, top: `${target.y}px` }}
          onClick={() => onSeek(beatOffset + target.beat)}
          aria-label={`Play from beat ${beatOffset + target.beat + 1}`}
          title="Play from this note"
        />)}
        {playing && playheadX !== null && <i className="engraved-playhead" style={{ left: `${playheadX.x ?? playheadX}px`, top: `${(playheadX.y ?? 22) - 4}px`, height: '184px' }} />}
      </div>
    </div>
  )
}

const PAGE_BEATS = 16
const PRINT_PAGE_BEATS = 32

function scoreSlice(score, startBeat, beatCount) {
  const sliceVoices = (voices) => voices.map((voice) => voice
    .filter((event) => event.beat >= startBeat && event.beat < startBeat + beatCount)
    .map((event) => ({ ...event, beat: event.beat - startBeat })))
  return {
    totalBeats: beatCount,
    keySignature: score.keySignature,
    trebleVoices: sliceVoices(score.trebleVoices),
    bassVoices: sliceVoices(score.bassVoices),
  }
}

function PrintedPianoScore({ score, activeBeat, playing, title, onSeek }) {
  const printPageCount = Math.ceil(score.totalBeats / PRINT_PAGE_BEATS)
  const pages = useMemo(() => Array.from({ length: printPageCount }, (_, index) => {
    const pageStart = index * PRINT_PAGE_BEATS
    const pageBeats = Math.min(PRINT_PAGE_BEATS, score.totalBeats - pageStart)
    return {
      pageStart,
      pageBeats,
      score: scoreSlice(score, pageStart, pageBeats),
    }
  }), [printPageCount, score])

  return (
    <div className="printed-score" aria-label={`Full score for ${title}`}>
      {pages.map(({ pageStart, pageBeats, score: pageScore }, index) => {
        const isActivePage = activeBeat >= pageStart && activeBeat <= pageStart + pageBeats
        return (
          <section className="printed-score-page" key={pageStart}>
            <header><span>{title}</span><small>Page {index + 1} / {printPageCount}</small></header>
            <PianoScore score={pageScore} activeBeat={Math.max(0, activeBeat - pageStart)} playing={playing && isActivePage} title={title} printLayout beatOffset={pageStart} onSeek={onSeek} />
          </section>
        )
      })}
    </div>
  )
}

export function PaginatedPianoScore({ score, activeBeat, playing, title, onTogglePlayback, onStop, onSeek }) {
  const pageCount = Math.ceil(score.totalBeats / PAGE_BEATS)
  const [page, setPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const scoreViewer = useRef(null)
  const wasPlaying = useRef(false)

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === scoreViewer.current)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (playing) setPage(Math.min(pageCount - 1, Math.floor(activeBeat / PAGE_BEATS)))
    else if (wasPlaying.current) setPage(0)
    wasPlaying.current = playing
  }, [activeBeat, pageCount, playing])

  const pageStart = page * PAGE_BEATS
  const pageBeats = Math.min(PAGE_BEATS, score.totalBeats - pageStart)
  const pageScore = useMemo(() => scoreSlice(score, pageStart, pageBeats), [pageBeats, pageStart, score])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === scoreViewer.current) await document.exitFullscreen()
    else await scoreViewer.current?.requestFullscreen()
  }

  const changeZoom = (amount) => setZoom((current) => Math.min(1.5, Math.max(0.5, current + amount)))

  return (
    <div className="paginated-score" ref={scoreViewer}>
      <div className="score-pagination">
        <span>MEASURES {page * 4 + 1}–{page * 4 + pageBeats / 4}</span>
        <div>
          {isFullscreen && <div className="score-transport" role="group" aria-label="Score playback controls">
            <button onClick={onTogglePlayback} aria-label={playing ? 'Pause score' : 'Play score'} title={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </button>
            <button onClick={onStop} disabled={!playing && activeBeat <= 0} aria-label="Stop score" title="Stop"><Square size={13} fill="currentColor" /></button>
          </div>}
          {isFullscreen && <div className="score-zoom" role="group" aria-label="Score zoom controls">
            <button onClick={() => changeZoom(-0.25)} disabled={zoom <= 0.5} aria-label="Zoom out" title="Zoom out"><ZoomOut size={15} /></button>
            <button className="score-zoom-value" onClick={() => setZoom(1)} aria-label={`Reset zoom from ${Math.round(zoom * 100)} percent`} title="Reset zoom">{Math.round(zoom * 100)}%</button>
            <button onClick={() => changeZoom(0.25)} disabled={zoom >= 1.5} aria-label="Zoom in" title="Zoom in"><ZoomIn size={15} /></button>
          </div>}
          {!isFullscreen && <>
            <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>Previous</button>
            <small>{page + 1} / {pageCount}</small>
            <button onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} disabled={page === pageCount - 1}>Next</button>
          </>}
          <button className="score-fullscreen" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen sheet music' : 'View sheet music fullscreen'} title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>
      {isFullscreen
        ? <div className="printed-score-zoom" style={{ zoom }}><PrintedPianoScore score={score} activeBeat={activeBeat} playing={playing} title={title} onSeek={onSeek} /></div>
        : <PianoScore score={pageScore} activeBeat={Math.max(0, activeBeat - pageStart)} playing={playing} title={title} beatOffset={pageStart} onSeek={onSeek} />}
    </div>
  )
}
