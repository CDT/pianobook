const event = (beat, notes, duration = 0.46, velocity = 58) => ({
  beat,
  notes: Array.isArray(notes) ? notes : [notes],
  duration,
  velocity,
})

const progression = [
  { root: 'D2', chord: ['D3', 'F#3', 'A3'], pattern: ['F#4', 'A4', 'D5', 'A4'] },
  { root: 'A2', chord: ['C#3', 'E3', 'A3'], pattern: ['E4', 'A4', 'C#5', 'A4'] },
  { root: 'B2', chord: ['B2', 'D3', 'F#3'], pattern: ['F#4', 'B4', 'D5', 'B4'] },
  { root: 'F#2', chord: ['C#3', 'F#3', 'A3'], pattern: ['C#4', 'F#4', 'A4', 'F#4'] },
  { root: 'G2', chord: ['B2', 'D3', 'G3'], pattern: ['D4', 'G4', 'B4', 'G4'] },
  { root: 'D2', chord: ['A2', 'D3', 'F#3'], pattern: ['A3', 'D4', 'F#4', 'D4'] },
  { root: 'G2', chord: ['B2', 'D3', 'G3'], pattern: ['B3', 'D4', 'G4', 'D4'] },
  { root: 'A2', chord: ['C#3', 'E3', 'A3'], pattern: ['A3', 'C#4', 'E4', 'A4'] },
]

const bass = Array.from({ length: 4 }, (_, cycle) => progression.map((harmony, index) =>
  event(cycle * 16 + index * 2, harmony.root, 1.9, cycle === 0 ? 52 : 48),
)).flat()

const chords = Array.from({ length: 4 }, (_, cycle) => progression.map((harmony, index) =>
  event(cycle * 16 + index * 2, harmony.chord, 1.9, 46 + cycle * 2),
)).flat()

const pattern = Array.from({ length: 4 }, (_, cycle) => progression.flatMap((harmony, index) => {
  const start = cycle * 16 + index * 2
  const notes = cycle < 2
    ? [...harmony.pattern, ...harmony.pattern]
    : [...harmony.pattern, ...harmony.pattern.slice(1), harmony.pattern[0]]
  return notes.map((note, noteIndex) => event(start + noteIndex * 0.25, note, 0.23, 58 + cycle * 3))
})).flat()

const finalChord = event(64, ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'], 3.8, 66)
const finalBass = event(64, ['D2', 'A2'], 3.8, 62)
const finalTreble = event(64, ['D3', 'F#3', 'A3', 'D4'], 3.8, 66)
const whole = [...bass, ...pattern, finalChord]

export const canonInDSimplified = {
  title: 'Canon in D', composer: 'Johann Pachelbel', key: 'D major',
  arrangement: 'Intermediate piano arrangement', tempo: 72, totalBeats: 68,
  events: whole,
  layers: { bass, harmony: [...bass, ...chords], pattern, whole },
  scores: {
    bass: { totalBeats: 68, keySignature: 'D', trebleVoices: [], bassVoices: [[...bass, finalBass]] },
    harmony: { totalBeats: 68, keySignature: 'D', trebleVoices: [[...chords, finalTreble]], bassVoices: [[...bass, finalBass]] },
    pattern: { totalBeats: 68, keySignature: 'D', trebleVoices: [[...pattern, finalTreble]], bassVoices: [] },
    whole: { totalBeats: 68, keySignature: 'D', trebleVoices: [[...pattern, finalTreble]], bassVoices: [[...bass, finalBass]] },
  },
  steps: [
    { id: 'canon-bass', score: 'bass', layer: 'bass', kicker: 'THE GROUND', label: 'GROUND BASS', title: 'Eight notes hold the entire piece together.', body: 'The left hand repeats D–A–B–F♯–G–D–G–A. Learn it as one calm loop: home, departure, deepening, and return.', listenFor: 'the same bass cycle continuing while everything above it changes.' },
    { id: 'canon-harmony', score: 'harmony', layer: 'harmony', kicker: 'THE HARMONY', label: 'CHORD SHAPES', title: 'Each bass note opens into a chord.', body: 'Compact triads turn the ground into the famous Canon progression. Keep these shapes close to the keys; they are the harmonic map for the flowing version.', listenFor: 'how B minor and F♯ minor darken the middle of each cycle.' },
    { id: 'canon-pattern', score: 'pattern', layer: 'pattern', kicker: 'THE PIANO FIGURE', label: 'RIGHT-HAND PATTERN', title: 'Broken chords make the arrangement sing.', body: 'The right hand rolls through chord tones in even sixteenth-note groups. Shape the highest note gently and let the wrist guide each repeating figure.', listenFor: 'a melodic top line emerging from notes that also spell the harmony.' },
    { id: 'canon-whole', score: 'whole', layer: 'whole', kicker: 'THE WHOLE', label: 'PIANO ARRANGEMENT', title: 'Build intensity without rushing.', body: 'This intermediate piano version repeats the ground four times, gradually brightening the right hand before settling on a broad final D-major chord.', listenFor: 'four waves of the same progression, each feeling more expansive.' },
  ],
  sourceUrl: 'https://imslp.org/wiki/Canon_and_Gigue_in_D_major,_P.37_(Pachelbel,_Johann)',
}

const canonLineData = [[0,'D5',2],[2,'C#5',2],[4,'B4',2],[6,'A4',2],[8,'G4',2],[10,'F#4',2],[12,'G4',2],[14,'B4',2],[16,'F#4',2],[18,'A3',2],[20,'D4',2],[22,'F#4',2],[24,'B4',2],[26,'D5',2],[28,'B4',2],[30,'C#5',2],[32,'F#5',2],[34,'E5',2],[36,'D5',2],[38,'C#5',2],[40,'B4',2],[42,'A4',2],[44,'B4',2],[46,'C#5',1],[47,'C#5',1],[48,'D5',.5],[48.5,'C#5',.5],[49,'D5',.5],[49.5,'D4',.5],[50,'C#4',.5],[50.5,'A4',.5],[51,'E4',.5],[51.5,'F#4',.5],[52,'D4',.5],[52.5,'D5',.5],[53,'C#5',.5],[53.5,'B4',.5],[54,'C#5',.5],[54.5,'F#4',.5],[55,'A4',.5],[55.5,'B4',.5],[56,'G4',.5],[56.5,'F#4',.5],[57,'E4',.5],[57.5,'G4',.5],[58,'F#4',.5],[58.5,'E4',.5],[59,'D4',.5],[59.5,'C#5',.5],[60,'B4',.5],[60.5,'A4',.5],[61,'G4',.5],[61.5,'F#4',.5],[62,'E4',.5],[62.5,'G4',.5],[63,'F#4',.5],[63.5,'E4',.5],[64,'D4',1],[72,'C#4',2],[74,'B3',2],[76,'A3',2],[78,'G3',2],[80,'F#3',2],[82,'G3',2],[84,'F#3',2],[86,'A3',2],[88,'E4',1],[89,'E4',1],[90,'D4',1],[91,'D4',1],[92,'C#4',1],[93,'C#4',1],[94,'B3',1],[95,'B3',1],[96,'A3',1],[97,'A3',1],[98,'G3',1],[99,'G3',1],[100,'A3',1],[101,'A3',1],[102,'B3',1],[103,'B4',1],[104,'E5',2],[106,'D5',2],[108,'C#5',2],[110,'B4',2],[112,'A4',2],[114,'G4',2],[116,'A4',2],[118,'F#4',2],[120,'G4',1.5],[121.5,'G4',.5],[122,'G4',.5],[122.5,'A4',.5],[123,'G4',.5],[123.5,'F#4',.5],[124,'E4',1.5],[125.5,'E4',.5],[126,'E4',.5],[126.5,'F#4',.5],[127,'E4',.5],[127.5,'D4',.5],[128,'C#4',1.5],[129.5,'A3',1.5],[131,'G3',2],[133,'C#4',.5],[133.5,'B3',.5],[134,'A3',1],[135,'C#4',3],[138,'B4',3],[141,'F#4',3],[144,'C#4',1],[145,'B3',1],[146,'A3',1],[147,'B3',1],[148,'E4',2],[150,'B3',2],[152,'A3',1],[153,'A4',1],[154,'B4',1],[155,'F#4',1],[156,'E4',1],[157,'G4',1],[158,'D4',1],[159,'F#4',1],[160,'C#4',1],[161,'E4',1],[162,'B3',1],[163,'D4',1],[164,'A3',1],[165,'C#4',1],[166,'G3',1],[167,'B3',1],[168,'C#4',1],[169,'A3',1],[170,'B3',1],[171,'F#3',1],[172,'G3',4]]

const FULL_CANON_DATA = 'QE4ICEwICEoICEkICEcICEUICEcICEkICEoICEkICEcICEUICEMICEIICEMICEAICD4EBEIEBEUEBEMEBEIEBD4EBEIEBEAEBD4EBDsEBD4EBEUEBEMEBEcEBEUEBEMEBEIEBD4EBEAEBEkEBEoEBE4EBFEEBEUEBEcEBEMEBEUEBEIEBD4EBEoEBEoGBkkCAkoCAkkCAkoCAj4CAj0CAkUCAkACAkICAj4CAkoCAkkCAkcCAkkCAk4CAlECAlMCAk8CAk4CAkwCAk8CAk4CAkwCAkoCAkkCAkcCAkUCAkMCAkICAkACAkMCAkICAkACAj4CAkACAkICAkMCAkUCAkACAkUCAkMCAkICAkcCAkUCAkMCAkUCAkMCAkICAkACAj4CAjsCAkcCAkkCAkoCAkkCAkcCAkUCAkMCAkICAkACAkcCAkUCAkcCAkUCAkMCAkIEBE4EBEwIDEoEBE4ICFMICFEICFMICFUICFYEBEoEBEkIDEcEBEoICEoMDEoEBEoEBE8EBEwEBFEEBFECAk4BAU8BAVECAk4BAU8BAVEBAUUBAUcBAUkBAUoBAUwBAU4BAU8BAU4CAkoBAUwBAU4CAkIBAUMBAUUBAUcBAUUBAUMBAUUBAUIBAUMBAUUBAUMCAkcBAUUBAUMCAkIBAUABAUIBAUABAT4BAUABAUIBAUMBAUUBAUcBAUMCAkcBAUUBAUcCAkkBAUoBAUUBAUcBAUkBAUoBAUwBAU4BAU8BAVEBAU4CAkoBAUwBAU4CAkwBAUoBAUwBAUkBAUoBAUwBAU4BAUwBAUoBAUkBAUoCAkcBAUkBAUoCAj4BAUABAUIBAUMBAUIBAUABAUIBAUoBAUkBAUoBAUcCAkoBAUkBAUcCAkUBAUMBAUUBAUMBAUIBAUMBAUUBAUcBAUkBAUoBAUcCAkoBAUkBAUoCAkkBAUcBAUkBAUoBAUwBAUoBAUkBAUoBAUcBAUkBAUoECEkECEcECEoECD4ECD4ECD4ECEAEDEUECEUECEIECEUECEMECEIECEMECEwEBE4CAkICAkMCAkICAkACAkwCAk4CAkwCAkoCAkICAj4CAkcCAkUCAjkCAjcCAjkCAjsCAkcCAkkCAkcCAkUCAjkCAjcCAjkCAjsCAkcCAkUCAkcCAkkCAj0CAjsCAj0CAj4CAkoCAkwCAkoCAkkCAj0CAj4CAj0CAjsCAkcCAkUCAkcCAkkCAj0CAkICAkACAj4CAkoCAkwCAk8CAk4CAkICAkUCAk4CAkoCAk8CAk4CAk8CAkwCAkUCAkMCAkUCAkICAkUCAkUCAkUCAkUCAkUCAkUCAkUCAkICAkICAkICAkICAkICAkICAkUCAkUCAkMCAkMCAkMCAkoCAkoCAkoCAkoCAkoCAkoCAkoCAkcCAkcCAkUCAkUCAkwCAkkCAkUCAk4CAk4CAk4CAkwCAkwCAkwCAkwCAkoCAkoCAkoCAkoCAlECAlECAlECAlECAlMCAlMCAlMCAlMCAlECAlECAlECAlECAlMCAlMCAlMCAlMCAlUCAkkCAkkCAkkCAkoCAj4BAUABAUICAj4CAj0CAkkBAUoBAUwCAkkCAkcCAjsBAT0BAT4CAjsCAj0CAkUBAUMBAUICAkACAj4CAkMBAUIBAUACAkMCAkICAj4BAUABAUICAkUCAkMCAkcBAUUBAUMCAkICAkACAkUBAUMBAUICAkACAkICAkoBAUkBAUoCAkICAkUCAkUBAUcBAUkCAkUCAkICAkoBAUwBAU4CAkoCAk4CAk4BAUwBAUoCAkkCAkcCAkcBAUUBAUcCAkkCAkoCAk4BAUwBAUoCAk4CAk8CAkoBAUkBAUcCAkcCAkUCAkACAkUCAkUCAkUMDEUEBD4MDEUEBEMICEUICEMEBD4EBD4GBj0CAj4EBEoEBEkICEcICEUICD4GBkACAkIICEcICEAGBkACAkIGBk4CAk4CAk8CAk4CAkwCAkoGBkoCAkoCAkwCAkoCAkkCAkcICEoICEoCAkgCAkcCAkgCAkUGBkUCAkUGBlECAlECAlMCAlECAk8CAk4GBk4CAk4CAk8CAk4CAkwCAkoCAkgCAkcCAkgCAkUGBkUCAkMEBEoEBEkGBkkCAkoEBEoICEkICEcICEUICEMICEIKCkACAkAICEIEBE4ICEwEBEoEBFYICFQEBFMICFYEBFEEBFMICFEICFEICEUGBkMCAkIICE4GBkwCAkoMDEoEBEoICEkICEoEBD4EBD0EBEkEBEcEBDsEBDkEBEUEBEMEBE8EBE4EBEIEBEAEBEcEBEAEBEwEBE4EBEIEBEAEBEwEBEoEBD4EBD0EBEkEBEcEBFMEBFEEBEUEBEMGBkwCAkUEBEUEBEUI'

function decodeCanonLine(encoded) {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0))
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const notes = []
  let units = 0
  for (let index = 0; index < bytes.length; index += 3) {
    units += bytes[index]
    const midi = bytes[index + 1]
    notes.push([units / 8, `${names[midi % 12]}${Math.floor(midi / 12) - 1}`, bytes[index + 2] / 8])
  }
  return notes
}

const fullCanonLine = decodeCanonLine(FULL_CANON_DATA)
const sourceCanonLine = fullCanonLine.length ? fullCanonLine : canonLineData
const canonVoice = (offset, velocity) => sourceCanonLine
  .filter(([beat, , duration]) => beat + offset + duration <= 225)
  .map(([beat, note, duration]) =>
  event(beat + offset, note, duration * 0.96, velocity),
)
const firstVoice = canonVoice(0, 68)
const secondVoice = canonVoice(8, 60)
const thirdVoice = canonVoice(16, 55)
const realBass = Array.from({ length: 225 }, (_, beat) =>
  event(beat, progression[beat % progression.length].root, 0.95, 48),
)
const canonVoices = [...firstVoice, ...secondVoice, ...thirdVoice]
const realWhole = [...realBass, ...canonVoices]

export const canonInD = {
  title: 'Canon in D', composer: 'Johann Pachelbel', key: 'D major',
  arrangement: 'Complete canon · piano transcription', tempo: 56, totalBeats: 228,
  events: realWhole,
  layers: { bass: realBass, subject: firstVoice, entries: canonVoices, whole: realWhole },
  scores: {
    bass: { totalBeats: 228, keySignature: 'D', trebleVoices: [], bassVoices: [realBass] },
    subject: { totalBeats: 228, keySignature: 'D', trebleVoices: [firstVoice], bassVoices: [] },
    entries: { totalBeats: 228, keySignature: 'D', trebleVoices: [firstVoice, secondVoice, thirdVoice], bassVoices: [] },
    whole: { totalBeats: 228, keySignature: 'D', trebleVoices: [firstVoice, secondVoice, thirdVoice], bassVoices: [realBass] },
  },
  steps: [
    { id: 'canon-real-bass', score: 'bass', layer: 'bass', kicker: 'THE CONTINUO', label: 'ORIGINAL BASS', title: 'The ground bass repeats without changing.', body: 'Pachelbel’s continuo cycles through D–A–B–F♯–G–D–G–A beneath the complete composition. On piano, keep it quiet, regular, and independent.', listenFor: 'the eight-note ground acting as a fixed floor beneath every variation.' },
    { id: 'canon-subject', score: 'subject', layer: 'subject', kicker: 'THE SUBJECT', label: 'CANON SUBJECT', title: 'One violin line contains the whole unfolding story.', body: 'This is the authentic melodic line from the score, transferred to the piano. Its values gradually move from broad half notes into quicker figuration and a final cadence.', listenFor: 'the melody becoming more active while the harmonic cycle stays the same.' },
    { id: 'canon-entries', score: 'entries', layer: 'entries', kicker: 'THE CANON', label: 'THREE ENTRIES', title: 'The same line enters three times.', body: 'The second and third voices begin two measures apart. That strict imitation—not merely the familiar chord progression—is what makes the piece a canon.', listenFor: 'each new entry echoing the first while older voices continue independently.' },
    { id: 'canon-real-whole', score: 'whole', layer: 'whole', kicker: 'THE PIANO VERSION', label: 'COMPLETE CANON', title: 'Four original parts become one piano texture.', body: 'This transcription preserves all three canonical voices and the continuo bass. Bring out whichever entry carries the newest idea, while keeping the ground unobtrusive.', listenFor: 'real counterpoint: four independent lines sharing one harmonic foundation.' },
  ],
  sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047',
}
