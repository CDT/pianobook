const note = (beat, pitch, duration = 1) => ({ beat, notes: [pitch], duration, velocity: 76, melody: true })

const canonMelody = [
  note(0, 'F#5'), note(1, 'E5'), note(2, 'D5'), note(3, 'C#5'),
  note(4, 'B4'), note(5, 'A4'), note(6, 'B4'), note(7, 'C#5'),
  note(8, 'D5'), note(9, 'C#5'), note(10, 'B4'), note(11, 'A4'),
  note(12, 'G4'), note(13, 'F#4'), note(14, 'G4'), note(15, 'E4'),
]

const canonBass = ['D3', 'A2', 'B2', 'F#2', 'G2', 'D2', 'G2', 'A2', 'D3', 'A2', 'B2', 'F#2', 'G2', 'D2', 'G2', 'A2']
  .map((pitch, beat) => ({ beat, notes: [pitch], duration: 0.9, velocity: 48 }))

const habaneraMelody = [
  note(0, 'D6', 0.5), note(0.5, 'C#6', 0.5),
  note(1, 'C6', 1 / 3), note(4 / 3, 'C6', 1 / 3), note(5 / 3, 'C6', 1 / 3),
  note(2, 'B5', 0.5), note(2.5, 'Bb5', 0.5), note(3, 'A5', 0.5),
  note(3.5, 'A5', 0.25), note(3.75, 'A5', 0.25), note(4, 'Ab5', 0.5), note(4.5, 'G5', 0.5),
  note(5, 'F5', 1 / 6), note(31 / 6, 'G5', 1 / 6), note(16 / 3, 'F5', 1 / 6),
  note(5.5, 'E5', 0.25), note(5.75, 'F5', 0.25), note(6, 'G5', 0.5), note(6.5, 'F5', 0.5), note(7, 'E5', 0.5),
  note(8, 'D6', 0.5), note(8.5, 'C#6', 0.5),
  note(9, 'C6', 1 / 3), note(28 / 3, 'C6', 1 / 3), note(29 / 3, 'C6', 1 / 3),
  note(10, 'B5', 0.5), note(10.5, 'Bb5', 0.5),
  note(11, 'A5', 0.25), note(11.25, 'A5', 0.25), note(11.75, 'A5', 0.25),
  note(12, 'G5', 0.5), note(12.5, 'F5', 0.5),
  note(13, 'E5', 1 / 6), note(79 / 6, 'F5', 1 / 6), note(40 / 3, 'E5', 1 / 6),
  note(13.5, 'D5', 0.25), note(13.75, 'E5', 0.25), note(14, 'F5', 0.5), note(14.5, 'E5', 0.5), note(15, 'D5'),
]

const habaneraChords = [
  ['D2', 'A2', 'D3', 'F3'], ['D2', 'A2', 'D3', 'F3'], ['D2', 'A2', 'D3', 'F3'], ['D2', 'A2', 'D3', 'F3'],
  ['G2', 'D3', 'G3', 'Bb3'], ['G2', 'D3', 'G3', 'Bb3'], ['A2', 'E3', 'G3', 'C#4'], ['D2', 'A2', 'D3', 'F3'],
]

const habaneraBass = habaneraChords.flatMap(([root, ...chord], bar) => {
  const beat = bar * 2
  return [
    { beat, notes: [root], duration: 0.55, velocity: 50 },
    { beat: beat + 0.75, notes: chord, duration: 0.2, velocity: 38 },
    { beat: beat + 1, notes: chord, duration: 0.35, velocity: 42 },
    { beat: beat + 1.5, notes: chord, duration: 0.35, velocity: 38 },
  ]
})

const minuetMelody = [
  note(0, 'G5'), note(1, 'G5', 0.75), note(1.75, 'F5', 0.25),
  note(2, 'Eb5', 0.25), note(2.25, 'F5', 0.25), note(2.5, 'G5', 0.25), note(2.75, 'Ab5', 0.25),
  note(3, 'Bb5', 0.5), note(3.5, 'G5', 0.5), note(4, 'Eb6', 0.5), note(4.5, 'Bb5', 0.5), note(5, 'G6', 0.5),
  note(6, 'F5'), note(7, 'F5', 0.75), note(7.75, 'G5', 0.25),
  note(8, 'F5', 0.25), note(8.25, 'Eb5', 0.25), note(8.5, 'D5', 0.25), note(8.75, 'C5', 0.25),
  note(9, 'Bb4', 0.5), note(9.5, 'D5', 0.5), note(10, 'F5', 0.5), note(10.5, 'D5', 0.5), note(11, 'Bb5', 0.5),
  note(12, 'Eb5'), note(13, 'Eb5'),
  note(14, 'F5', 0.25), note(14.25, 'Eb5', 0.25), note(14.5, 'D5', 0.25), note(14.75, 'Eb5', 0.25),
  note(15, 'F5', 0.5), note(15.5, 'G5', 0.5), note(16, 'Ab5', 0.5), note(16.5, 'Bb5', 0.5), note(17, 'C6', 0.5),
  note(18, 'F5'), note(19, 'F5', 0.875), note(19.875, 'G5', 0.125),
  note(20, 'F5', 0.25), note(20.25, 'E5', 0.25), note(20.5, 'F5', 0.25), note(20.75, 'G5', 0.25), note(21, 'Eb5', 2),
]

const minuetChords = [
  ['Eb3', 'Bb3', 'Eb4', 'Bb3', 'G4', 'Bb3'], ['Eb3', 'Bb3', 'Eb4', 'Bb3', 'G4', 'Bb3'],
  ['Bb2', 'F3', 'Bb3', 'F3', 'D4', 'F3'], ['Bb2', 'F3', 'Bb3', 'F3', 'D4', 'F3'],
  ['C3', 'G3', 'C4', 'G3', 'Eb4', 'G3'], ['Ab2', 'Eb3', 'Ab3', 'Eb3', 'C4', 'Eb3'],
  ['Bb2', 'F3', 'Bb3', 'F3', 'D4', 'F3'], ['Eb3', 'Bb3', 'Eb4', 'Bb3', 'G4', 'Bb3'],
]

const minuetBass = minuetChords.flatMap((pitches, bar) => pitches.map((pitch, index) => ({
  beat: bar * 3 + index * 0.5,
  notes: [pitch],
  duration: 0.42,
  velocity: index === 0 ? 48 : 34,
})))

export const demoPieces = [
  {
    id: 'canon', title: 'Canon in D', composer: 'Johann Pachelbel', key: 'D major', meter: 4, meterLabel: '4/4', tempo: 52,
    character: 'Andante · steady and luminous', totalBeats: 16, melody: canonMelody, events: [...canonBass, ...canonMelody],
    sourceUrl: 'https://imslp.org/wiki/Canon_and_Gigue_in_D_major%2C_P.37_(Pachelbel%2C_Johann)',
  },
  {
    id: 'habanera', title: 'Habanera', subtitle: 'from Carmen', composer: 'Georges Bizet', key: 'D minor', meter: 2, meterLabel: '2/4', tempo: 72,
    character: 'Allegretto quasi andantino · with poise', totalBeats: 16, melody: habaneraMelody, events: [...habaneraBass, ...habaneraMelody],
    sourceUrl: 'https://imslp.org/wiki/Carmen_(Bizet%2C_Georges)',
  },
  {
    id: 'minuet', title: 'Minuet', subtitle: 'from L’Arlésienne Suite No. 2', composer: 'Georges Bizet · suite arranged by Ernest Guiraud', key: 'E♭ major', meter: 3, meterLabel: '3/4', tempo: 76,
    character: 'Andantino quasi allegretto · graceful', totalBeats: 24, melody: minuetMelody, events: [...minuetBass, ...minuetMelody],
    sourceUrl: 'https://imslp.org/wiki/L%27Arl%C3%A9sienne_Suite_No.2_(Bizet%2C_Georges)',
  },
]
