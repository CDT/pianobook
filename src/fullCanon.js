import { parseMidi } from 'midi-file'
import fullCanonMidiUrl from './assets/canon-per-3-violini-e-basso.mid?url'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const TRACK_VELOCITY = { 1: 0.82, 2: 0.74, 3: 0.68, 4: 0.62 }

let fullCanonPromise

function noteName(noteNumber) {
  return `${NOTE_NAMES[noteNumber % 12]}${Math.floor(noteNumber / 12) - 1}`
}

function midiToEvents(bytes) {
  const midi = parseMidi(bytes)
  const ticksPerBeat = midi.header.ticksPerBeat
  const events = []

  midi.tracks.forEach((track, trackIndex) => {
    if (trackIndex === 0) return
    const activeNotes = new Map()
    let tick = 0

    track.forEach((midiEvent) => {
      tick += midiEvent.deltaTime
      const isNoteOn = midiEvent.type === 'noteOn' && midiEvent.velocity > 0
      const isNoteOff = midiEvent.type === 'noteOff' || (midiEvent.type === 'noteOn' && midiEvent.velocity === 0)
      if (!isNoteOn && !isNoteOff) return

      const key = `${midiEvent.channel}:${midiEvent.noteNumber}`
      if (isNoteOn) {
        const starts = activeNotes.get(key) || []
        starts.push({ tick, velocity: midiEvent.velocity })
        activeNotes.set(key, starts)
        return
      }

      const starts = activeNotes.get(key)
      if (!starts?.length) return
      const start = starts.shift()
      const durationTicks = Math.max(1, tick - start.tick)
      const velocity = Math.max(28, Math.min(92, Math.round(start.velocity * TRACK_VELOCITY[trackIndex])))
      events.push({
        beat: start.tick / ticksPerBeat,
        notes: [noteName(midiEvent.noteNumber)],
        duration: durationTicks / ticksPerBeat,
        velocity,
      })
    })
  })

  return events.sort((a, b) => a.beat - b.beat)
}

export function loadFullCanon() {
  if (!fullCanonPromise) {
    fullCanonPromise = fetch(fullCanonMidiUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load the complete score (${response.status})`)
        return response.arrayBuffer()
      })
      .then((buffer) => midiToEvents(new Uint8Array(buffer)))
  }
  return fullCanonPromise
}

export const FULL_CANON_BEATS = 225
export const FULL_CANON_SOURCE = 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047'
