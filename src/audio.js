import { CacheStorage, SplendidGrandPiano } from 'smplr'

// Recorded pitches nearest to every note used by the four lesson keys.
// smplr pitch-shifts between these samples for accidentals such as F♯ and B♭.
const LESSON_SAMPLE_PITCHES = [40, 43, 45, 48, 52, 55, 57]

function cachedStorage() {
  if (!window.isSecureContext || !('caches' in window)) return null

  try {
    return CacheStorage('pianobook-grand-piano-v1')
  } catch {
    return null
  }
}

export class PianoEngine {
  constructor(onLoadProgress) {
    this.context = null
    this.piano = null
    this.readyPromise = null
    this.isReady = false
    this.onLoadProgress = onLoadProgress
  }

  async ready() {
    if (!this.context) this.context = new AudioContext()
    if (this.context.state === 'suspended') await this.context.resume()

    if (!this.piano) {
      const storage = cachedStorage()
      this.piano = SplendidGrandPiano(this.context, {
        volume: 88,
        velocity: 78,
        decayTime: 1.15,
        notesToLoad: {
          notes: LESSON_SAMPLE_PITCHES,
          velocityRange: [41, 84],
        },
        onLoadProgress: this.onLoadProgress,
        ...(storage ? { storage } : {}),
      })
      this.readyPromise = this.piano.ready
    }

    await this.readyPromise
    this.isReady = true
  }

  stop() {
    this.piano?.stop()
  }

  schedule(chords, sequence, tempo, subdivision = sequence.length === 8 ? 0.5 : 1) {
    this.stop()
    const stepSeconds = (60 / tempo) * subdivision
    const start = this.context.currentTime + 0.12
    let step = 0

    chords.forEach((chord, chordIndex) => {
      sequence.forEach((noteIndex, noteStep) => {
        const isDownbeat = noteStep === 0
        const velocity = isDownbeat ? 82 : 58 + ((chordIndex + noteStep) % 3) * 3
        this.piano.start({
          note: chord.notes[noteIndex],
          time: start + step * stepSeconds,
          duration: Math.max(0.65, stepSeconds * 1.35),
          velocity,
        })
        step += 1
      })
    })

    return { startDelay: 120, stepMs: stepSeconds * 1000, totalSteps: step }
  }

  dispose() {
    this.piano?.dispose()
    this.piano = null
    this.context?.close()
    this.context = null
    this.readyPromise = null
    this.isReady = false
  }
}
