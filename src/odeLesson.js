const event = (beat, notes, duration = 0.9, velocity = 65) => ({
  beat,
  notes: Array.isArray(notes) ? notes : [notes],
  duration,
  velocity,
})

const melodyPitches = [
  'F#4', 'F#4', 'G4', 'A4', 'A4', 'G4', 'F#4', 'E4',
  'D4', 'D4', 'E4', 'F#4', 'F#4', 'E4', 'E4',
  'F#4', 'F#4', 'G4', 'A4', 'A4', 'G4', 'F#4', 'E4',
  'D4', 'D4', 'E4', 'F#4', 'E4', 'D4', 'D4',
  'E4', 'E4', 'F#4', 'D4', 'E4', 'F#4', 'G4', 'F#4', 'D4',
  'E4', 'F#4', 'G4', 'F#4', 'E4', 'D4', 'E4', 'A4',
  'F#4', 'F#4', 'G4', 'A4', 'A4', 'G4', 'F#4', 'E4',
  'D4', 'D4', 'E4', 'F#4', 'E4', 'D4', 'D4',
]

const melodyBeats = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13.5, 14,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29.5, 30,
  32, 33, 34, 35, 36, 37, 37.5, 38, 39,
  40, 41, 41.5, 42, 43, 44, 45, 46,
  48, 49, 50, 51, 52, 53, 54, 55,
  56, 57, 58, 59, 60, 61.5, 62,
]

const melodyDurations = {
  12: 1.5,
  13.5: 0.5,
  14: 2,
  28: 1.5,
  29.5: 0.5,
  30: 2,
  37: 0.5,
  37.5: 0.5,
  41: 0.5,
  41.5: 0.5,
  46: 2,
  60: 1.5,
  61.5: 0.5,
  62: 2,
}

const melody = melodyPitches.map((pitch, index) => {
  const beat = melodyBeats[index]
  const duration = melodyDurations[beat] ?? 1
  return event(beat, pitch, duration, beat % 4 === 0 ? 80 : 72)
})

const harmony = [
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'A2', notes: ['A3', 'C#4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
]

const bass = harmony.map((chord, bar) => event(bar * 4, chord.root, 3.8, 52))
const chords = harmony.map((chord, bar) => event(bar * 4, chord.notes, 3.8, 48))
const accompaniment = harmony.flatMap((chord, bar) => Array.from({ length: 8 }, (_, index) =>
  event(bar * 4 + index * 0.5, chord.notes[[0, 2, 1, 2][index % 4]], 0.46, index % 2 === 0 ? 52 : 44),
))

export const odeToJoy = {
  title: 'Ode to Joy',
  composer: 'Ludwig van Beethoven',
  key: 'D major',
  tempo: 92,
  totalBeats: 64,
  events: [...bass, ...accompaniment, ...melody],
  layers: {
    bass,
    harmony: [...bass, ...chords],
    melody,
    whole: [...bass, ...accompaniment, ...melody],
  },
  scores: {
    bass: { totalBeats: 64, trebleVoices: [], bassVoices: [bass] },
    harmony: { totalBeats: 64, trebleVoices: [chords], bassVoices: [bass] },
    melody: { totalBeats: 64, trebleVoices: [melody], bassVoices: [] },
    whole: { totalBeats: 64, trebleVoices: [melody], bassVoices: [accompaniment, bass] },
  },
  steps: [
    {
      id: 'ode-bass', score: 'bass', layer: 'bass', kicker: 'THE FOUNDATION', label: 'BASS NOTES',
      title: 'Two bass notes establish home and away.',
      body: 'D feels settled; A creates a gentle pull back toward D. The left hand changes only once per measure, giving the melody plenty of room.',
      listenFor: 'the difference between rest on D and expectation on A.',
    },
    {
      id: 'ode-harmony', score: 'harmony', layer: 'harmony', kicker: 'THE HARMONY', label: 'CHORD BLOCKS',
      title: 'The bass notes open into two chords.',
      body: 'Most of this arrangement is supported by D major and A major. That small harmonic vocabulary lets you focus on balance and timing.',
      listenFor: 'the chord change as punctuation rather than a dramatic event.',
    },
    {
      id: 'ode-melody', score: 'melody', layer: 'melody', kicker: 'THE MELODY', label: 'MELODY LINE',
      title: 'A famous tune built mostly from neighboring notes.',
      body: 'The line advances one step at a time. Repeated notes make the rhythm clear, while the final descent gives each phrase its sense of arrival.',
      listenFor: 'four-bar questions and answers, not thirty separate notes.',
    },
    {
      id: 'ode-whole', score: 'whole', layer: 'whole', kicker: 'THE WHOLE', label: 'COMPLETE TEXTURE',
      title: 'Keep the accompaniment beneath the singing line.',
      body: 'The broken chord pattern supplies motion, but the melody remains the speaker. Play the right hand warmly and keep the left hand light.',
      listenFor: 'one clear melody floating above an even accompaniment.',
    },
  ],
  sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528',
}
