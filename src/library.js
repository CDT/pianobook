import {
  canonInD,
} from './lessons/index.js'

export const libraryPieces = [
  {
    number: '01',
    route: '#/canon-in-d', title: canonInD.title, composer: canonInD.composer,
    description: 'Memorize the arrangement by tracing how each musical idea returns and changes.',
    meta: [canonInD.key, 'Beginner memory path', `${canonInD.tempo} bpm`],
    playId: 'canon-full', events: canonInD.events, tempo: canonInD.tempo,
  },
]
