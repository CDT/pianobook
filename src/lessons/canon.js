import { canonLeftHand, canonRightHand } from './canonMidi.js'

const TOTAL_BEATS = 210
const completeCanon = [...canonLeftHand, ...canonRightHand]

const notationVoice = (events, totalBeats = TOTAL_BEATS) => events.map((event, index) => ({
  ...event,
  duration: Math.max(0.25, Math.min(event.duration, (events[index + 1]?.beat ?? totalBeats) - event.beat)),
}))

function sliceEvents(events, startBeat, endBeat) {
  return events
    .filter((event) => event.beat < endBeat && event.beat + event.duration > startBeat)
    .map((event) => {
      const audibleStart = Math.max(startBeat, event.beat)
      return {
        ...event,
        beat: audibleStart - startBeat,
        duration: Math.min(endBeat, event.beat + event.duration) - audibleStart,
      }
    })
}

function sectionEvents(startMeasure, endMeasure) {
  const startBeat = (startMeasure - 1) * 4
  const endBeat = endMeasure === 53 ? TOTAL_BEATS : endMeasure * 4
  const right = sliceEvents(canonRightHand, startBeat, endBeat)
  const left = sliceEvents(canonLeftHand, startBeat, endBeat)
  return { right, left, together: [...left, ...right], totalBeats: endBeat - startBeat }
}

function sectionScore(section, startMeasure) {
  return {
    totalBeats: section.totalBeats,
    startMeasure,
    keySignature: 'D',
    trebleVoices: [notationVoice(section.right, section.totalBeats)],
    bassVoices: [notationVoice(section.left, section.totalBeats)],
  }
}

const stageContent = [
  {
    phase: 'MAP', title: 'The ground and the first voice', start: 1, end: 4,
    body: 'This is the piece’s DNA: one complete harmony cycle and the bare melodic line. Learn the chord names with the left hand, then sing the right hand away from the piano.',
    reuse: 'The eight-chord ground—D · A · Bm · F♯m · G · D · G · A—will remain your map for the whole piece.',
    change: 'Nothing yet. Establish a dependable reference before learning any decoration.',
    method: 'Play the left hand while saying the chords; then play the melody alone from its contour, not from finger memory.',
    listenFor: 'the right hand descending through the first three measures, then turning upward to lead back to D.',
    pass: 'Name every chord and start either hand from measures 1, 2, 3, or 4 without prompting.',
    comparisons: [{ label: 'The source idea', start: 1, end: 4 }],
  },
  {
    phase: 'LAYER', title: 'The same line gains a voice', start: 5, end: 8,
    body: 'Do not memorize this as four new measures. The upper notes continue the opening contour; your only new work is the added lower voice and the hand shapes it creates.',
    reuse: 'The melodic contour and harmonic timing from measures 1–4.',
    change: 'A second note is added beneath the melody, turning single notes into mostly thirds.',
    method: 'Play measures 1–4, then 5–8. Point out the matching melodic notes before practising the added lower notes.',
    listenFor: 'the original melody still singing as the top note of each interval.',
    pass: 'Move directly from measure 4 into 5 and name which voice is old and which is new.',
    comparisons: [{ label: 'Original line', start: 1, end: 4 }, { label: 'Added voice', start: 5, end: 8 }],
  },
  {
    phase: 'MOTION', title: 'The line begins to flow', start: 9, end: 12,
    body: 'The long-note statement becomes an eighth-note melody. Hear each measure as a destination and its approach rather than eight separate notes.',
    reuse: 'The same four-measure ground and the same arrival points at each harmony change.',
    change: 'Passing notes fill the space between structural melody notes.',
    method: 'Circle the notes that land with each chord. Learn those anchors first, then insert the notes between them.',
    listenFor: 'the anchored melody beneath the quicker surface.',
    pass: 'Play the four anchor notes alone, then restore the complete phrase from memory.',
    comparisons: [{ label: 'Bare statement', start: 1, end: 4 }, { label: 'Flowing version', start: 9, end: 12 }],
  },
  {
    phase: 'SEQUENCE', title: 'A figure, then its harmonized echo', start: 13, end: 20,
    body: 'These eight measures are one lesson, not two blocks. Measures 13–16 introduce the fast figure; measures 17–20 repeat its rhythmic skeleton with harmony added.',
    reuse: 'Measures 17–20 keep the rhythm, direction, and most melodic targets from 13–16.',
    change: 'The return adds lower notes and slightly redirects the inner motion.',
    method: 'Learn 13–16 securely. For 17–20, practise only the added notes, then place them back under the known top line.',
    listenFor: 'the same fast gesture returning with a thicker sound.',
    pass: 'Demonstrate one matching measure from each half, then perform all eight measures without treating measure 17 as a fresh start.',
    comparisons: [{ label: 'Source figure', start: 13, end: 16 }, { label: 'Harmonized echo', start: 17, end: 20 }],
  },
  {
    phase: 'TRANSFER', title: 'Keep the melody; accelerate the ground', start: 21, end: 28,
    body: 'The right-hand phrase in 21–24 returns almost intact in 25–28. The real task in the second half is the left hand, which changes from eighth notes to sixteenths.',
    reuse: 'The right-hand melody and its four-measure shape.',
    change: 'The left hand doubles its activity while the melody stays familiar.',
    method: 'Memorize the right hand once. Compare the two left-hand patterns alone, then reuse the melody over the faster version.',
    listenFor: 'the same melody remaining calm while the accompaniment becomes more active.',
    pass: 'Play the right hand through both halves continuously, then add each left-hand version without relearning the melody.',
    comparisons: [{ label: 'Calm ground', start: 21, end: 24 }, { label: 'Faster ground', start: 25, end: 28 }],
  },
  {
    phase: 'EXPAND', title: 'The melody opens into chords', start: 29, end: 32,
    body: 'The texture broadens into octave and chord shapes. Memorize the top note as the melodic route; treat the remaining notes as the shape beneath it.',
    reuse: 'The chord-cycle landmarks and the singing top line.',
    change: 'Single melodic notes expand into wider vertical shapes.',
    method: 'Play only the highest note of every right-hand event. Once that route is secure, restore each chord from the top downward.',
    listenFor: 'the top voice connecting the wide shapes into one phrase.',
    pass: 'Play the top-note route alone, then rebuild the full texture without losing its direction.',
    comparisons: [{ label: 'Chordal expansion', start: 29, end: 32 }],
  },
  {
    phase: 'ENGINE', title: 'One arpeggio language across two cycles', start: 33, end: 40,
    body: 'Both hands now share continuous sixteenth-note motion. Measures 33–36 establish the keyboard geometry; 37–40 continue the same language higher.',
    reuse: 'The alternating low–middle–high shapes and the uninterrupted pulse.',
    change: 'The second cycle shifts register and extends the same geometry toward the climax.',
    method: 'Block each beat into a chord, learn its hand shape, then unfold it into four notes. Join by beat, not by entire measure.',
    listenFor: 'one chord shape hiding inside every group of four notes.',
    pass: 'Start from any beat-group named at random and continue through the next harmony change.',
    comparisons: [{ label: 'Pattern established', start: 33, end: 36 }, { label: 'Pattern extended', start: 37, end: 40 }],
  },
  {
    phase: 'RETURN', title: 'The fast figure returns at the summit', start: 41, end: 45,
    body: 'The climax is not wholly new. After the rising transition, it recalls the sixteenth-note language from measures 13–20 in a higher, denser register.',
    reuse: 'The rhythmic profile and contours learned in the earlier sequence.',
    change: 'A higher register and added chord tones transform the familiar figure into the high point of the piece.',
    method: 'Compare the earlier figure with the climax before playing. Transfer the old fingering logic, then isolate only the added notes and register shifts.',
    listenFor: 'recognizable earlier gestures transformed into the piece’s high point.',
    pass: 'Enter confidently at measures 41, 42, and 45; then continue into the release stage without stopping.',
    comparisons: [{ label: 'Earlier figure', start: 13, end: 16 }, { label: 'Climactic return', start: 41, end: 45 }],
  },
  {
    phase: 'RELEASE', title: 'Let the summit fall into the cadence', start: 45, end: 53,
    body: 'This stage deliberately overlaps the climax. Measure 45 is the shared launch point; the held A and final A–B–C♯ of measure 46 are the hinge that carries the music into measure 47.',
    reuse: 'Measure 45 is already secure from the previous stage, so the coda begins from a known musical impulse.',
    change: 'Measure 46 releases the fast texture, then the repeating ground breaks into broader chordal gestures and the final D-major arrival.',
    method: 'First loop measures 45–47 as one gesture. Then learn the cadence backward: final chord, 51–52, 49–52, and finally connect from measure 47.',
    listenFor: 'the long A creating space without stopping the phrase; its pickup notes should make measure 47 feel inevitable.',
    pass: 'Play measures 45–47 without a seam, then continue to the end and repeat from measures 49 and 51.',
    comparisons: [{ label: 'The handoff', start: 45, end: 47 }, { label: 'Coda and cadence', start: 47, end: 53 }],
  },
]

const learningStages = stageContent.map((stage, index) => {
  const section = sectionEvents(stage.start, stage.end)
  return {
    ...stage,
    id: `canon-stage-${index + 1}`,
    number: index + 1,
    measures: `${stage.start}–${stage.end}`,
    layers: section,
    comparisonLayers: stage.comparisons.map((comparison) => {
      const comparisonSection = sectionEvents(comparison.start, comparison.end)
      return {
        ...comparison,
        events: comparisonSection.together,
        score: sectionScore(comparisonSection, comparison.start),
      }
    }),
    score: sectionScore(section, stage.start),
  }
})

const leftHandScore = notationVoice(canonLeftHand)
const rightHandScore = notationVoice(canonRightHand)

export const canonInD = {
  title: 'Canon in D', composer: 'Johann Pachelbel', key: 'D major',
  arrangement: 'Breezepiano arrangement · complete piano score', tempo: 59, totalBeats: TOTAL_BEATS,
  events: completeCanon,
  learningStages,
  scores: {
    whole: { totalBeats: TOTAL_BEATS, keySignature: 'D', trebleVoices: [rightHandScore], bassVoices: [leftHandScore] },
  },
  sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047',
}
