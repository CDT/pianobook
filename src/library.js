import {
  canonInD,
} from './lessons/index.js'

export const libraryPieces = [
  {
    number: '02',
    route: '#/canon-in-d', title: canonInD.title, composer: canonInD.composer,
    description: 'Hear Pachelbel’s authentic three-part canon over its repeating continuo bass.',
    meta: [canonInD.key, 'Complete canon', `${canonInD.tempo} bpm`],
    playId: 'canon-full', events: canonInD.events, tempo: canonInD.tempo,
  },
]
