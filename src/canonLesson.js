const event = (beat, notes, duration = 0.9, velocity = 65) => ({ beat, notes: Array.isArray(notes) ? notes : [notes], duration, velocity })

const chordData = [
  { name: 'D', roman: 'I', root: 'D2', notes: ['D', 'F♯', 'A'], piano: ['D3', 'F#3', 'A3'] },
  { name: 'A', roman: 'V', root: 'A2', notes: ['A', 'C♯', 'E'], piano: ['A3', 'C#4', 'E4'] },
  { name: 'Bm', roman: 'vi', root: 'B2', notes: ['B', 'D', 'F♯'], piano: ['B3', 'D4', 'F#4'] },
  { name: 'F♯m', roman: 'iii', root: 'F#2', notes: ['F♯', 'A', 'C♯'], piano: ['F#3', 'A3', 'C#4'] },
  { name: 'G', roman: 'IV', root: 'G2', notes: ['G', 'B', 'D'], piano: ['G3', 'B3', 'D4'] },
  { name: 'D', roman: 'I', root: 'D2', notes: ['D', 'F♯', 'A'], piano: ['D3', 'F#3', 'A3'] },
  { name: 'G', roman: 'IV', root: 'G2', notes: ['G', 'B', 'D'], piano: ['G3', 'B3', 'D4'] },
  { name: 'A', roman: 'V', root: 'A2', notes: ['A', 'C♯', 'E'], piano: ['A3', 'C#4', 'E4'] },
]

const melodyPitches = ['F#5', 'E5', 'D5', 'C#5', 'B4', 'A4', 'B4', 'C#5', 'D5', 'C#5', 'B4', 'A4', 'G4', 'F#4', 'G4', 'E4']
const levels = [7, 6, 5, 4, 3, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1, 0]
const melody = melodyPitches.map((pitch, beat) => event(beat, pitch, 0.86, beat % 4 === 0 ? 78 : 68))
const bass = chordData.map((chord, index) => event(index, chord.root, 0.92, 58))
const harmony = chordData.map((chord, index) => event(index, chord.piano, 0.9, 50))
const rhythm = chordData.flatMap((chord, chordIndex) => [
  event(chordIndex, chord.piano[0], 0.46, 55),
  event(chordIndex + 0.5, chord.piano[2], 0.42, 46),
])

const repeat = (events, times, cycleBeats = 8) => Array.from({ length: times }, (_, cycle) =>
  events.map((item) => ({ ...item, beat: item.beat + cycle * cycleBeats })),
).flat()

export const canon = {
  tempo: 55,
  chords: chordData,
  melodyNotes: melodyPitches.map((pitch, index) => ({ pitch, label: pitch.replace(/\d/g, ''), level: levels[index] })),
  layers: {
    bass,
    harmony: [...bass, ...harmony],
    rhythm: [...bass, ...rhythm],
    melody,
    full: [...repeat(bass, 2), ...repeat(rhythm, 2), ...melody],
  },
}

export const lessonSteps = [
  {
    id: 'bass', nav: 'Bass', kicker: 'LAYER 01 · THE FOUNDATION', title: 'Eight notes hold up the whole piece.',
    body: 'The lowest voice repeats one descending loop. It is so dependable that the melody can wander freely above it.',
    listenFor: 'the gravitational pull from D down toward A, then the clean reset.', label: 'THE GROUND BASS', caption: 'one root on every beat', layer: 'bass', shortLabel: 'the bass',
  },
  {
    id: 'harmony', nav: 'Chords', kicker: 'LAYER 02 · THE HARMONY', title: 'Each bass note becomes a room.',
    body: 'Stack two notes above every root and the famous progression appears. The Roman numerals reveal a reusable harmonic route—not just eight chord names.',
    listenFor: 'how vi darkens the loop and IV opens it again.', label: 'THE EIGHT-CHORD LOOP', caption: 'I – V – vi – iii – IV – I – IV – V', layer: 'harmony', shortLabel: 'the chords',
  },
  {
    id: 'rhythm', nav: 'Rhythm', kicker: 'LAYER 03 · THE CURRENT', title: 'Break the blocks into a flowing pulse.',
    body: 'The harmony does not need to change. Four light notes inside each chord create forward motion while the bass stays calm underneath.',
    listenFor: 'an even current, with just enough weight on each new chord.', label: 'EIGHTH-NOTE FLOW', caption: '1 & 2 & 3 & 4 & · repeat', layer: 'rhythm', shortLabel: 'the rhythm',
  },
  {
    id: 'melody', nav: 'Melody', kicker: 'LAYER 04 · THE VOICE', title: 'The melody falls, answers, and falls again.',
    body: 'Forget note names for a moment. Hear the contour: a long descent, a small recovery, then a softer descent that settles lower than it began.',
    listenFor: 'direction before detail—where the line leans and where it breathes.', label: 'MELODY CONTOUR', caption: 'follow the shape from left to right', layer: 'melody', shortLabel: 'the melody',
  },
  {
    id: 'whole', nav: 'Whole', kicker: 'LAYER 05 · THE ARCHITECTURE', title: 'Three simple jobs become one rich sound.',
    body: 'Bass gives stability. Broken chords give motion. Melody gives meaning. The beauty is not hidden in any single layer—it lives in their balance.',
    listenFor: 'each violin entering in turn, then the variations growing from quarters to eighths and sixteenths.', label: 'COMPLETE SCORE', caption: '225 beats · all four original parts', layer: 'complete', shortLabel: 'the full Canon',
  },
]
