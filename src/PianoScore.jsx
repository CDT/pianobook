import { useEffect, useMemo, useRef, useState } from 'react'

const MEASURE_BEATS = 4
const MEASURE_WIDTH = 340
const SCORE_MARGIN = 18

function vexKey(pitch) {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/)
  if (!match) return 'b/4'
  const [, letter, accidental, octave] = match
  return `${letter.toLowerCase()}${accidental}/${octave}`
}

function notationBeats(event) {
  if (event.duration <= 0.15) return 0.125
  if (event.duration <= 0.3) return 0.25
  if (event.duration <= 0.6) return 0.5
  if (event.duration <= 0.85) return 0.75
  if (event.duration <= 1.25) return 1
  if (event.duration <= 1.75) return 1.5
  if (event.duration <= 2.5) return 2
  return 4
}

function durationCode(duration) {
  if (duration === 0.125) return { code: '32', dotted: false }
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
  const values = [4, 2, 1, 0.75, 0.5, 0.25, 0.125]
  while (remaining > 0.001) {
    const value = values.find((candidate) => candidate <= remaining + 0.001) || 0.125
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

function createNotes(events, clef, stemDirection, StaveNote, Dot) {
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
    return { beat: event.beat, note }
  })
}

function wholeRest(clef, StaveNote) {
  return new StaveNote({ clef, keys: [clef === 'treble' ? 'b/4' : 'd/3'], duration: 'wr' })
}

function interpolatePlayhead(positions, beat) {
  if (!positions.length) return null
  const exact = positions.find((position) => Math.abs(position.beat - beat) < 0.001)
  if (exact) return exact.x
  const before = [...positions].reverse().find((position) => position.beat < beat)
  const after = positions.find((position) => position.beat > beat)
  if (!before) return positions[0].x
  if (!after) return before.x + (beat - before.beat) * 58
  const progress = (beat - before.beat) / (after.beat - before.beat)
  return before.x + (after.x - before.x) * progress
}

export default function PianoScore({ score, activeBeat, playing, title, measureWidth = MEASURE_WIDTH, scale = 1, showLabel = true, showTimeSignature = true }) {
  const scoreRoot = useRef(null)
  const [beatPositions, setBeatPositions] = useState([])
  const measureCount = score.totalBeats / MEASURE_BEATS
  const width = SCORE_MARGIN * 2 + measureCount * measureWidth

  useEffect(() => {
    const root = scoreRoot.current
    if (!root) return
    root.replaceChildren()

    let cancelled = false

    const engrave = async () => {
      const { Beam, Dot, Formatter, Renderer, Stave, StaveConnector, StaveNote, Stem, VexFlow, Voice } = await import('vexflow/bravura')
      await VexFlow.loadFonts('Bravura', 'Academico')
      VexFlow.setFonts('Bravura', 'Academico')
      if (cancelled) return
      const renderer = new Renderer(root, Renderer.Backends.SVG)
      renderer.resize(width, 245)
      const context = renderer.getContext()
      const positions = []
      const trackingClef = score.trebleVoices.length ? 'treble' : 'bass'

      for (let measure = 0; measure < measureCount; measure += 1) {
      const x = SCORE_MARGIN + measure * measureWidth
      const trebleStave = new Stave(x, 22, measureWidth)
      const bassStave = new Stave(x, 126, measureWidth)
      if (measure === 0) {
        trebleStave.addClef('treble').addKeySignature(score.keySignature ?? 'D')
        bassStave.addClef('bass').addKeySignature(score.keySignature ?? 'D')
        if (showTimeSignature) {
          trebleStave.addTimeSignature('4/4')
          bassStave.addTimeSignature('4/4')
        }
      }
      trebleStave.setContext(context).draw()
      bassStave.setContext(context).draw()

      if (measure === 0) {
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
          const entries = createNotes(eventsForMeasure(events, measure), clef, direction, StaveNote, Dot)
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

        if (clef === trackingClef) {
          const trackingVoice = measureVoices[0]
          trackingVoice.entries.forEach(({ beat, note }) => positions.push({ beat, x: note.getAbsoluteX() }))
        }
        }

        drawStaffVoices(score.trebleVoices, trebleStave, 'treble')
        drawStaffVoices(score.bassVoices, bassStave, 'bass')
        if (measure === measureCount - 1) {
          const trackingStave = trackingClef === 'treble' ? trebleStave : bassStave
          positions.push({ beat: score.totalBeats, x: trackingStave.getNoteEndX() })
        }
      }

      setBeatPositions(positions.sort((a, b) => a.beat - b.beat))
    }

    engrave().catch((error) => console.error('Unable to engrave piano score', error))
    return () => { cancelled = true }
  }, [measureCount, measureWidth, score, showTimeSignature, width])

  const normalizedBeat = activeBeat === score.totalBeats ? activeBeat : activeBeat % score.totalBeats
  const playheadX = useMemo(() => interpolatePlayhead(beatPositions, normalizedBeat), [beatPositions, normalizedBeat])

  return (
    <div className="piano-score" aria-label={`${title} piano sheet music`}>
      {showLabel && <div className="score-label"><span>PIANO SCORE</span><small>properly voiced · {score.keySignature === 'C' ? 'C major' : 'D major'} · 4/4</small></div>}
      <div className="score-scroll">
        <div className="engraved-score-viewport" style={{ width: `${width * scale}px`, height: `${245 * scale}px` }}>
          <div className="engraved-score-scale" style={{ width: `${width}px`, transform: `scale(${scale})` }}>
            <div className="engraved-score" ref={scoreRoot} style={{ width: `${width}px` }} />
            {playing && playheadX !== null && <i className="engraved-playhead" style={{ left: `${playheadX}px` }} />}
          </div>
        </div>
      </div>
    </div>
  )
}

const PAGE_BEATS = 16

function sliceScore(score, startBeat, pageBeats) {
  const sliceVoices = (voices) => voices.map((voice) => voice
    .filter((event) => event.beat >= startBeat && event.beat < startBeat + pageBeats)
    .map((event) => ({ ...event, beat: event.beat - startBeat })))
  return {
    totalBeats: pageBeats,
    keySignature: score.keySignature,
    trebleVoices: sliceVoices(score.trebleVoices),
    bassVoices: sliceVoices(score.bassVoices),
  }
}

const OPEN_SCORE_STAFF_GAP = 92
const OPEN_SCORE_TOP = 18

function OpenScoreSystem({ score, activeBeat, playing, title, measureWidths, scale, showTimeSignature }) {
  const scoreRoot = useRef(null)
  const [beatPositions, setBeatPositions] = useState([])
  const staves = useMemo(() => [
    ...score.trebleVoices.map((events) => ({ clef: 'treble', events })),
    ...score.bassVoices.map((events) => ({ clef: 'bass', events })),
  ], [score])
  const measureCount = score.totalBeats / MEASURE_BEATS
  const width = SCORE_MARGIN * 2 + measureWidths.reduce((total, measureWidth) => total + measureWidth, 0)
  const height = OPEN_SCORE_TOP + staves.length * OPEN_SCORE_STAFF_GAP

  useEffect(() => {
    const root = scoreRoot.current
    if (!root) return
    root.replaceChildren()
    let cancelled = false

    const engrave = async () => {
      const { Beam, Dot, Formatter, Renderer, Stave, StaveConnector, StaveNote, VexFlow, Voice } = await import('vexflow/bravura')
      await VexFlow.loadFonts('Bravura', 'Academico')
      VexFlow.setFonts('Bravura', 'Academico')
      if (cancelled) return

      const renderer = new Renderer(root, Renderer.Backends.SVG)
      renderer.resize(width, height)
      const context = renderer.getContext()
      const positions = []
      let measureX = SCORE_MARGIN

      for (let measure = 0; measure < measureCount; measure += 1) {
        const x = measureX
        const measureWidth = measureWidths[measure]
        const measureStaves = staves.map((staff, staffIndex) => {
          const stave = new Stave(x, OPEN_SCORE_TOP + staffIndex * OPEN_SCORE_STAFF_GAP, measureWidth)
          if (measure === 0) {
            stave.addClef(staff.clef).addKeySignature(score.keySignature ?? 'D')
            if (showTimeSignature) stave.addTimeSignature('4/4')
          }
          stave.setContext(context).draw()
          return stave
        })

        if (measure === 0 && measureStaves.length > 1) {
          new StaveConnector(measureStaves[0], measureStaves.at(-1)).setType('singleLeft').setContext(context).draw()
        }

        staves.forEach((staff, staffIndex) => {
          const entries = createNotes(eventsForMeasure(staff.events, measure), staff.clef, undefined, StaveNote, Dot)
          const voice = new Voice('4/4').addTickables(entries.map((entry) => entry.note))
          const beams = Beam.generateBeams(entries.map((entry) => entry.note))
          new Formatter().joinVoices([voice]).formatToStave([voice], measureStaves[staffIndex])
          voice.draw(context, measureStaves[staffIndex])
          beams.forEach((beam) => beam.setContext(context).draw())

          if (staffIndex === staves.length - 1) {
            entries.forEach(({ beat, note }) => positions.push({ beat, x: note.getAbsoluteX() }))
          }
        })

        if (measure === measureCount - 1) {
          positions.push({ beat: score.totalBeats, x: measureStaves.at(-1).getNoteEndX() })
        }
        measureX += measureWidth
      }

      setBeatPositions(positions.sort((a, b) => a.beat - b.beat))
    }

    engrave().catch((error) => console.error('Unable to engrave full score', error))
    return () => { cancelled = true }
  }, [height, measureCount, measureWidths, score, showTimeSignature, staves, width])

  const normalizedBeat = activeBeat === score.totalBeats ? activeBeat : activeBeat % score.totalBeats
  const playheadX = useMemo(() => interpolatePlayhead(beatPositions, normalizedBeat), [beatPositions, normalizedBeat])

  return (
    <div className="open-score" aria-label={`${title} sheet music`}>
      <div className="score-scroll">
        <div className="engraved-score-viewport" style={{ width: `${width * scale}px`, height: `${height * scale}px` }}>
          <div className="engraved-score-scale" style={{ width: `${width}px`, height: `${height}px`, transform: `scale(${scale})` }}>
            <div className="engraved-open-score" ref={scoreRoot} style={{ width: `${width}px`, height: `${height}px` }} />
            {playing && playheadX !== null && <i className="engraved-playhead" style={{ left: `${playheadX}px` }} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function buildFullScoreSystems(score, zoom) {
  const voices = [...score.trebleVoices, ...score.bassVoices]
  const measureCount = score.totalBeats / MEASURE_BEATS
  const widths = Array.from({ length: measureCount }, (_, measure) => {
    const startBeat = measure * MEASURE_BEATS
    const endBeat = startBeat + MEASURE_BEATS
    const density = Math.max(1, ...voices.map((voice) => voice.filter((event) => event.beat >= startBeat && event.beat < endBeat).length))
    return Math.min(680, Math.max(280, 180 + density * 16))
  })
  const widthBudget = 1300 / zoom
  const systems = []
  let startMeasure = 0

  while (startMeasure < measureCount) {
    let endMeasure = startMeasure
    let usedWidth = 0
    while (endMeasure < measureCount) {
      const nextWidth = widths[endMeasure]
      if (endMeasure > startMeasure && usedWidth + nextWidth > widthBudget) break
      usedWidth += nextWidth
      endMeasure += 1
    }
    const startBeat = startMeasure * MEASURE_BEATS
    const systemBeats = (endMeasure - startMeasure) * MEASURE_BEATS
    systems.push({
      startBeat,
      pageBeats: systemBeats,
      measureWidths: widths.slice(startMeasure, endMeasure),
      score: sliceScore(score, startBeat, systemBeats),
    })
    startMeasure = endMeasure
  }

  return systems
}

export function FullPianoScore({ score, activeBeat, playing, title, zoom }) {
  const scoreRoot = useRef(null)
  const systems = useMemo(() => buildFullScoreSystems(score, zoom), [score, zoom])
  const activeSystemIndex = systems.findIndex((system) => activeBeat < system.startBeat + system.pageBeats)
  const activeSystem = activeSystemIndex === -1 ? systems.length - 1 : activeSystemIndex

  useEffect(() => {
    if (!playing) return
    scoreRoot.current?.querySelector(`[data-score-system="${activeSystem}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeSystem, playing])

  return (
    <div className="full-piano-score" ref={scoreRoot}>
      {systems.map((system, index) => {
        const systemPlaying = playing && index === activeSystem
        return (
          <section className={`full-score-system ${systemPlaying ? 'playing' : ''}`} data-score-system={index} key={system.startBeat}>
            <OpenScoreSystem
              score={system.score}
              activeBeat={Math.max(0, activeBeat - system.startBeat)}
              playing={systemPlaying}
              title={`${title}, system ${index + 1}`}
              measureWidths={system.measureWidths}
              scale={zoom}
              showTimeSignature={index === 0}
            />
          </section>
        )
      })}
    </div>
  )
}

export function PaginatedPianoScore({ score, activeBeat, playing, title }) {
  const pageCount = Math.ceil(score.totalBeats / PAGE_BEATS)
  const [page, setPage] = useState(0)
  const wasPlaying = useRef(false)

  useEffect(() => {
    if (playing) setPage(Math.min(pageCount - 1, Math.floor(activeBeat / PAGE_BEATS)))
    else if (wasPlaying.current) setPage(0)
    wasPlaying.current = playing
  }, [activeBeat, pageCount, playing])

  const pageStart = page * PAGE_BEATS
  const pageBeats = Math.min(PAGE_BEATS, score.totalBeats - pageStart)
  const pageScore = useMemo(() => sliceScore(score, pageStart, pageBeats), [pageBeats, pageStart, score])

  return (
    <div className="paginated-score">
      <div className="score-pagination">
        <span>MEASURES {page * 4 + 1}–{page * 4 + pageBeats / 4}</span>
        <div>
          <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>Previous</button>
          <small>{page + 1} / {pageCount}</small>
          <button onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} disabled={page === pageCount - 1}>Next</button>
        </div>
      </div>
      <PianoScore score={pageScore} activeBeat={Math.max(0, activeBeat - pageStart)} playing={playing} title={title} />
    </div>
  )
}
