const event = (beat, notes, duration = 0.22, velocity = 58) => ({
  beat,
  notes: Array.isArray(notes) ? notes : [notes],
  duration,
  velocity,
})

// Bass, inner voice, and the three ascending notes of each arpeggio cell.
const harmonies = [
  ['C3', 'E3', 'G3', 'C4', 'E4'], ['C3', 'D3', 'A3', 'D4', 'F4'],
  ['B2', 'D3', 'G3', 'D4', 'F4'], ['C3', 'E3', 'G3', 'C4', 'E4'],
  ['C3', 'E3', 'A3', 'E4', 'A4'], ['C3', 'D3', 'F#3', 'A3', 'D4'],
  ['B2', 'D3', 'G3', 'D4', 'G4'], ['B2', 'C3', 'E3', 'G3', 'C4'],
  ['A2', 'C3', 'E3', 'G3', 'C4'], ['D3', 'A3', 'D4', 'F#4', 'C5'],
  ['G2', 'B2', 'D3', 'G3', 'B3'], ['G2', 'Bb2', 'E3', 'G3', 'C#4'],
  ['F2', 'A2', 'D3', 'A3', 'D4'], ['F2', 'Ab2', 'D3', 'F3', 'B3'],
  ['E2', 'G2', 'C3', 'G3', 'C4'], ['E2', 'F2', 'A2', 'C3', 'F3'],
  ['D2', 'F2', 'A2', 'C3', 'F3'], ['G2', 'D3', 'G3', 'B3', 'F4'],
  ['C2', 'E2', 'G2', 'C3', 'E3'], ['C2', 'G2', 'Bb2', 'C3', 'E3'],
  ['F2', 'A2', 'C3', 'E3', 'A3'], ['F#2', 'C3', 'A3', 'C4', 'Eb4'],
  ['Ab2', 'F3', 'B3', 'C4', 'D4'], ['G2', 'F3', 'G3', 'B3', 'D4'],
  ['G2', 'E3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'C4', 'F4'],
  ['G2', 'D3', 'G3', 'B3', 'F4'], ['G2', 'Eb3', 'A3', 'C4', 'F#4'],
  ['G2', 'E3', 'G3', 'C4', 'G4'], ['G2', 'D3', 'G3', 'C4', 'F4'],
  ['G2', 'D3', 'G3', 'B3', 'F4'], ['C2', 'C3', 'G3', 'Bb3', 'E4'],
]

const arpeggio = harmonies.flatMap(([bass, inner, ...upper], bar) => [0, 2].flatMap((half) => [
  event(bar * 4 + half, bass, 1.95, 48),
  event(bar * 4 + half + 0.25, inner, 1.7, 50),
  ...[0, 1].flatMap((repeat) => upper.map((note, index) =>
    event(bar * 4 + half + 0.5 + repeat * 0.75 + index * 0.25, note, 0.23, 60),
  )),
]))

const flourish = [
  'C2', 'C3', 'F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'C4', 'A3', 'F3', 'A3', 'F3', 'D3', 'F3', 'D3',
  'C2', 'B2', 'G3', 'B3', 'D4', 'F4', 'D4', 'B3', 'D4', 'B3', 'G3', 'B3', 'D3', 'F3', 'E3', 'D3',
].map((note, index) => event(128 + index * 0.25, note, 0.23, index % 4 === 0 ? 54 : 64))

const finalChord = event(136, ['C2', 'C3', 'E3', 'G3', 'C4'], 3.8, 64)
const whole = [...arpeggio, ...flourish, finalChord]
const bass = harmonies.flatMap((notes, bar) => [0, 2].map((half) => event(bar * 4 + half, notes[0], 1.95, 50)))
const upper = arpeggio.filter((item) => item.duration < 0.3)
const bassScore = [...bass, event(128, 'C2', 3.8, 50), event(132, 'C2', 3.8, 50), finalChord]
const upperScore = [...upper, ...flourish, event(136, ['E3', 'G3', 'C4'], 3.8, 64)]

export const preludeInC = {
  title: 'Prelude in C Major', composer: 'Johann Sebastian Bach', opus: 'BWV 846',
  key: 'C major', tempo: 66, totalBeats: 140,
  events: whole,
  layers: { bass: bassScore, pattern: upper, whole },
  scores: {
    bass: { totalBeats: 140, keySignature: 'C', trebleVoices: [], bassVoices: [bassScore] },
    pattern: { totalBeats: 140, keySignature: 'C', trebleVoices: [upperScore], bassVoices: [] },
    whole: { totalBeats: 140, keySignature: 'C', trebleVoices: [upperScore], bassVoices: [bassScore] },
  },
  steps: [
    { id: 'prelude-bass', score: 'bass', layer: 'bass', kicker: 'THE FOUNDATION', label: 'BASS LINE', title: 'A slow bass journey carries the harmony.', body: 'Bach changes the foundation beneath an almost unchanging surface. Follow the bass alone and hear the piece travel away from C, linger over G, and finally come home.', listenFor: 'the long dominant pedal near the end and its release into C.' },
    { id: 'prelude-pattern', score: 'pattern', layer: 'pattern', kicker: 'THE PATTERN', label: 'ARPEGGIO FIGURE', title: 'One small gesture creates continuous motion.', body: 'Each half-measure unfolds the same rising three-note shape twice. The fingering sensation stays steady while the notes—and therefore the harmony—keep changing.', listenFor: 'the repeated shape connecting every chord into one continuous breath.' },
    { id: 'prelude-whole', score: 'whole', layer: 'whole', kicker: 'THE WHOLE', label: 'COMPLETE TEXTURE', title: 'Let harmony emerge from an even touch.', body: 'The bass and inner voice sustain beneath the flowing upper notes. Keep every sixteenth calm and equal so the changing color speaks without extra emphasis.', listenFor: 'chromatic tension gathering before the final flourish and C-major chord.' },
  ],
  sourceUrl: 'https://www.mutopiaproject.org/ftp/BachJS/BWV846/wtk1-prelude1/wtk1-prelude1-a4.pdf',
}
