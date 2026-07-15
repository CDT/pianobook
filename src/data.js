export const keys = {
  C: {
    label: 'C major',
    chords: [
      { name: 'C', roman: 'I', notes: ['C3', 'E3', 'G3'], color: 'clay' },
      { name: 'Am', roman: 'vi', notes: ['A2', 'C3', 'E3'], color: 'rose' },
      { name: 'F', roman: 'IV', notes: ['F2', 'A2', 'C3'], color: 'sage' },
      { name: 'G', roman: 'V', notes: ['G2', 'B2', 'D3'], color: 'gold' },
    ],
  },
  G: {
    label: 'G major',
    chords: [
      { name: 'G', roman: 'I', notes: ['G2', 'B2', 'D3'], color: 'clay' },
      { name: 'Em', roman: 'vi', notes: ['E2', 'G2', 'B2'], color: 'rose' },
      { name: 'C', roman: 'IV', notes: ['C3', 'E3', 'G3'], color: 'sage' },
      { name: 'D', roman: 'V', notes: ['D3', 'F#3', 'A3'], color: 'gold' },
    ],
  },
  F: {
    label: 'F major',
    chords: [
      { name: 'F', roman: 'I', notes: ['F2', 'A2', 'C3'], color: 'clay' },
      { name: 'Dm', roman: 'vi', notes: ['D3', 'F3', 'A3'], color: 'rose' },
      { name: 'Bb', roman: 'IV', notes: ['Bb2', 'D3', 'F3'], color: 'sage' },
      { name: 'C', roman: 'V', notes: ['C3', 'E3', 'G3'], color: 'gold' },
    ],
  },
  D: {
    label: 'D major',
    chords: [
      { name: 'D', roman: 'I', notes: ['D3', 'F#3', 'A3'], color: 'clay' },
      { name: 'Bm', roman: 'vi', notes: ['B2', 'D3', 'F#3'], color: 'rose' },
      { name: 'G', roman: 'IV', notes: ['G2', 'B2', 'D3'], color: 'sage' },
      { name: 'A', roman: 'V', notes: ['A2', 'C#3', 'E3'], color: 'gold' },
    ],
  },
}

export const patterns = [
  {
    id: 'roots',
    short: '01',
    name: 'Root notes',
    subtitle: 'Steady & grounded',
    description: 'Play the root on every beat. The simplest way to feel harmonic movement clearly.',
    sequence: [0, 0, 0, 0],
    beats: ['Root', 'Root', 'Root', 'Root'],
    level: 'Foundation',
  },
  {
    id: 'fifths',
    short: '02',
    name: 'Root + fifth',
    subtitle: 'Open & spacious',
    description: 'Alternate the root and fifth for a wide, confident foundation that never feels crowded.',
    sequence: [0, 2, 0, 2],
    beats: ['Root', 'Fifth', 'Root', 'Fifth'],
    level: 'Essential',
  },
  {
    id: 'broken',
    short: '03',
    name: 'Broken chord',
    subtitle: 'Warm & flowing',
    description: 'Unfold each chord one note at a time. This familiar shape turns harmony into motion.',
    sequence: [0, 1, 2, 1],
    beats: ['Root', 'Third', 'Fifth', 'Third'],
    level: 'Musical',
  },
  {
    id: 'rolling',
    short: '04',
    name: 'Rolling eighths',
    subtitle: 'Lush & cinematic',
    description: 'Double the motion with a repeating eight-note figure for an expressive, modern texture.',
    sequence: [0, 1, 2, 1, 0, 1, 2, 1],
    beats: ['1', '&', '2', '&', '3', '&', '4', '&'],
    level: 'Expansive',
  },
]

export const chapters = [
  { number: '01', title: 'The foundation', detail: 'Make harmony move', active: true },
  { number: '02', title: 'Add color', detail: 'Sevenths & tensions' },
  { number: '03', title: 'Create motion', detail: 'Rhythm & groove' },
  { number: '04', title: 'Shape a song', detail: 'Intro to ending' },
]
