const noteOffsets = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }

function frequency(note) {
  const match = note.match(/^([A-G](?:#|b)?)(\d)$/)
  if (!match) return 220
  const midi = (Number(match[2]) + 1) * 12 + noteOffsets[match[1]]
  return 440 * 2 ** ((midi - 69) / 12)
}

export class PianoEngine {
  constructor() {
    this.context = null
    this.nodes = []
  }

  async ready() {
    if (!this.context) this.context = new AudioContext()
    if (this.context.state === 'suspended') await this.context.resume()
  }

  stop() {
    this.nodes.forEach((node) => {
      try { node.stop() } catch { /* already stopped */ }
    })
    this.nodes = []
  }

  playNote(note, time, duration = 0.45, volume = 0.17) {
    const ctx = this.context
    const gain = ctx.createGain()
    const body = ctx.createOscillator()
    const overtone = ctx.createOscillator()

    body.type = 'triangle'
    overtone.type = 'sine'
    body.frequency.value = frequency(note)
    overtone.frequency.value = frequency(note) * 2

    const attack = 0.015
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(volume, time + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

    body.connect(gain)
    overtone.connect(gain)
    gain.connect(ctx.destination)
    body.start(time)
    overtone.start(time)
    body.stop(time + duration + 0.03)
    overtone.stop(time + duration + 0.03)
    this.nodes.push(body, overtone)
  }

  schedule(chords, sequence, tempo) {
    this.stop()
    const subdivision = sequence.length === 8 ? 0.5 : 1
    const stepSeconds = (60 / tempo) * subdivision
    const start = this.context.currentTime + 0.08
    let step = 0

    chords.forEach((chord) => {
      sequence.forEach((noteIndex) => {
        this.playNote(chord.notes[noteIndex], start + step * stepSeconds, stepSeconds * 0.82)
        step += 1
      })
    })

    return { startDelay: 80, stepMs: stepSeconds * 1000, totalSteps: step }
  }
}
