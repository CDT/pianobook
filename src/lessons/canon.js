import { canonLeftHand, canonRightHand } from './canonMidi.js'

const TOTAL_BEATS = 210
const completeCanon = [...canonLeftHand, ...canonRightHand]
const notationVoice = (events) => events.map((event, index) => ({
  ...event,
  duration: Math.max(0.25, Math.min(event.duration, (events[index + 1]?.beat ?? TOTAL_BEATS) - event.beat)),
}))
const leftHandScore = notationVoice(canonLeftHand)
const rightHandScore = notationVoice(canonRightHand)

export const canonInD = {
  title: 'Canon in D', composer: 'Johann Pachelbel', key: 'D major',
  arrangement: 'Breezepiano arrangement · complete piano score', tempo: 59, totalBeats: TOTAL_BEATS,
  events: completeCanon,
  layers: {
    bass: canonLeftHand,
    subject: canonRightHand,
    entries: canonRightHand,
    whole: completeCanon,
  },
  scores: {
    bass: { totalBeats: TOTAL_BEATS, keySignature: 'D', trebleVoices: [], bassVoices: [leftHandScore] },
    subject: { totalBeats: TOTAL_BEATS, keySignature: 'D', trebleVoices: [rightHandScore], bassVoices: [] },
    entries: { totalBeats: TOTAL_BEATS, keySignature: 'D', trebleVoices: [rightHandScore], bassVoices: [] },
    whole: { totalBeats: TOTAL_BEATS, keySignature: 'D', trebleVoices: [rightHandScore], bassVoices: [leftHandScore] },
  },
  steps: [
    { id: 'canon-bass', score: 'bass', layer: 'bass', kicker: 'THE LEFT HAND', label: 'PIANO FOUNDATION', title: 'The accompaniment keeps the canon moving.', body: 'This is the complete left-hand part from the Breezepiano MIDI arrangement, including its flowing broken chords, bass movement, and closing cadence.', listenFor: 'the harmony changing beneath the melody while the pulse remains steady.' },
    { id: 'canon-subject', score: 'subject', layer: 'subject', kicker: 'THE RIGHT HAND', label: 'MELODY & FIGURATION', title: 'The familiar canon unfolds above the accompaniment.', body: 'This is the complete right-hand part from the MIDI arrangement. Its texture grows from broad melodic notes into quicker decorative patterns and fuller chords.', listenFor: 'the melody becoming progressively more animated as the piece develops.' },
    { id: 'canon-entries', score: 'entries', layer: 'entries', kicker: 'THE UPPER TEXTURE', label: 'RIGHT-HAND DETAIL', title: 'Melody and inner notes share one hand.', body: 'The arranged upper staff combines the recognizable canon melody with added harmony and pianistic figuration, exactly as encoded in the supplied MIDI performance.', listenFor: 'the main melodic line singing through the denser passagework.' },
    { id: 'canon-whole', score: 'whole', layer: 'whole', kicker: 'THE PIANO VERSION', label: 'COMPLETE ARRANGEMENT', title: 'Both hands form the complete performance.', body: 'The full score and playback now use both tracks from the supplied Breezepiano MIDI, preserving its pitches, rhythms, chords, dynamics, and hand assignment.', listenFor: 'the balance between the singing right hand and the continuous left-hand foundation.' },
  ],
  sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047',
}
