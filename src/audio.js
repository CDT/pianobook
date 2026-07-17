import { CacheStorage, SplendidGrandPiano } from 'smplr'

// A focused sample set; smplr pitch-shifts between these recorded pitches.
const LESSON_SAMPLE_PITCHES = [38, 43, 47, 50, 55, 59, 62, 67, 71, 74, 79, 83, 86]

function cachedStorage() {
  if (!window.isSecureContext || !('caches' in window)) return null

  try {
    return CacheStorage('pianobook-grand-piano-v1')
  } catch {
    return null
  }
}

export class PianoEngine {
  constructor() {
    this.context = null
    this.piano = null
    this.readyPromise = null
    this.isReady = false
    this.scheduledStops = []
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
        ...(storage ? { storage } : {}),
      })
      this.readyPromise = this.piano.ready
    }

    await this.readyPromise
    this.isReady = true
  }

  stop() {
    this.scheduledStops.forEach((stopNote) => stopNote())
    this.scheduledStops = []
    this.piano?.stop()
  }

  scheduleEvents(events, tempo) {
    this.stop()
    const beatSeconds = 60 / tempo
    const leadSeconds = events.length > 500 ? 1 : 0.12
    const start = this.context.currentTime + leadSeconds
    let totalBeats = 0

    events.forEach((event) => {
      event.notes.forEach((note) => {
        const stopNote = this.piano.start({
          note,
          time: start + event.beat * beatSeconds,
          duration: Math.max(0.12, event.duration * beatSeconds * 0.92),
          velocity: event.velocity ?? 68,
        })
        this.scheduledStops.push(stopNote)
      })
      totalBeats = Math.max(totalBeats, event.beat + event.duration)
    })

    return {
      startTime: start,
      beatMs: beatSeconds * 1000,
      totalBeats,
    }
  }

  get currentTime() {
    return this.context?.currentTime ?? 0
  }

  dispose() {
    this.stop()
    this.piano?.dispose()
    this.piano = null
    this.context?.close()
    this.context = null
    this.readyPromise = null
    this.isReady = false
    this.scheduledStops = []
  }
}
