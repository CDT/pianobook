import { odeToJoy } from './odeLesson.js'
import { preludeInC } from './preludeLesson.js'
import { canonInD, canonInDSimplified } from './canonLesson.js'

const catalog = [
  ['Minuet in G Major', 'Christian Petzold', 'Baroque dance', 'Beginner'],
  ['Musette in D Major', 'Johann Sebastian Bach', 'Baroque dance', 'Beginner'],
  ['Jesu, Joy of Man’s Desiring', 'Johann Sebastian Bach', 'Chorale', 'Intermediate'],
  ['Air on the G String', 'Johann Sebastian Bach', 'Orchestral air', 'Intermediate'],
  ['Sheep May Safely Graze', 'Johann Sebastian Bach', 'Pastoral aria', 'Intermediate'],
  ['Minuet in G Minor', 'Christian Petzold', 'Baroque dance', 'Beginner'],
  ['Solfeggietto', 'C. P. E. Bach', 'Keyboard study', 'Intermediate'],
  ['Sonata in C Major, K. 545', 'Wolfgang Amadeus Mozart', 'Classical sonata', 'Intermediate'],
  ['Rondo alla Turca', 'Wolfgang Amadeus Mozart', 'Classical rondo', 'Advanced'],
  ['Eine kleine Nachtmusik', 'Wolfgang Amadeus Mozart', 'Serenade', 'Intermediate'],
  ['Ah vous dirai-je, Maman', 'Wolfgang Amadeus Mozart', 'Theme and variations', 'Intermediate'],
  ['Für Elise', 'Ludwig van Beethoven', 'Bagatelle', 'Intermediate'],
  ['Moonlight Sonata', 'Ludwig van Beethoven', 'Piano sonata', 'Intermediate'],
  ['Pathétique Sonata', 'Ludwig van Beethoven', 'Piano sonata', 'Advanced'],
  ['Minuet in G Major, WoO 10', 'Ludwig van Beethoven', 'Classical dance', 'Beginner'],
  ['Ecossaise in G Major', 'Ludwig van Beethoven', 'Country dance', 'Beginner'],
  ['Symphony No. 5 Theme', 'Ludwig van Beethoven', 'Symphonic theme', 'Beginner'],
  ['The Blue Danube', 'Johann Strauss II', 'Waltz', 'Intermediate'],
  ['Radetzky March', 'Johann Strauss I', 'March', 'Intermediate'],
  ['Brahms’ Lullaby', 'Johannes Brahms', 'Lullaby', 'Beginner'],
  ['Hungarian Dance No. 5', 'Johannes Brahms', 'Romantic dance', 'Advanced'],
  ['Waltz in A-flat Major', 'Johannes Brahms', 'Waltz', 'Intermediate'],
  ['Spring Song', 'Felix Mendelssohn', 'Song without words', 'Intermediate'],
  ['Wedding March', 'Felix Mendelssohn', 'Incidental music', 'Intermediate'],
  ['Traumerei', 'Robert Schumann', 'Character piece', 'Intermediate'],
  ['The Happy Farmer', 'Robert Schumann', 'Character piece', 'Beginner'],
  ['Melody, Op. 68 No. 1', 'Robert Schumann', 'Character piece', 'Beginner'],
  ['Clair de lune', 'Claude Debussy', 'Impressionist piece', 'Advanced'],
  ['The Little Shepherd', 'Claude Debussy', 'Character piece', 'Intermediate'],
  ['Arabesque No. 1', 'Claude Debussy', 'Impressionist piece', 'Advanced'],
  ['Gymnopédie No. 1', 'Erik Satie', 'Impressionist miniature', 'Intermediate'],
  ['Gnossienne No. 1', 'Erik Satie', 'Piano miniature', 'Intermediate'],
  ['The Entertainer', 'Scott Joplin', 'Ragtime', 'Intermediate'],
  ['Maple Leaf Rag', 'Scott Joplin', 'Ragtime', 'Advanced'],
  ['The Easy Winners', 'Scott Joplin', 'Ragtime', 'Intermediate'],
  ['Morning Mood', 'Edvard Grieg', 'Orchestral miniature', 'Beginner'],
  ['In the Hall of the Mountain King', 'Edvard Grieg', 'Orchestral theme', 'Intermediate'],
  ['Arietta, Op. 12 No. 1', 'Edvard Grieg', 'Lyric piece', 'Intermediate'],
  ['New World Symphony Theme', 'Antonín Dvořák', 'Symphonic theme', 'Beginner'],
  ['Humoresque No. 7', 'Antonín Dvořák', 'Character piece', 'Intermediate'],
  ['Swan Lake Theme', 'Pyotr Ilyich Tchaikovsky', 'Ballet theme', 'Intermediate'],
  ['Dance of the Sugar Plum Fairy', 'Pyotr Ilyich Tchaikovsky', 'Ballet dance', 'Intermediate'],
  ['Morning Prayer', 'Pyotr Ilyich Tchaikovsky', 'Children’s album', 'Beginner'],
  ['Waltz of the Flowers', 'Pyotr Ilyich Tchaikovsky', 'Ballet waltz', 'Intermediate'],
  ['Prelude in E Minor', 'Frédéric Chopin', 'Romantic prelude', 'Intermediate'],
  ['Waltz in A Minor', 'Frédéric Chopin', 'Romantic waltz', 'Intermediate'],
  ['Nocturne in E-flat Major', 'Frédéric Chopin', 'Nocturne', 'Advanced'],
]

const catalogPieces = catalog.map(([title, composer, form, level]) => ({
  title,
  composer,
  description: form,
  meta: [level, 'Catalog'],
}))

const canonStudy = {
  route: '#/canon-in-d-intermediate', title: 'Canon in D — Piano Study', composer: canonInDSimplified.composer,
  description: 'A shorter intermediate study based on Pachelbel’s ground-bass progression.',
  meta: [canonInDSimplified.key, 'Intermediate', `${canonInDSimplified.tempo} bpm`],
  playId: 'canon-study-full', events: canonInDSimplified.events, tempo: canonInDSimplified.tempo,
}

const preludePiece = {
  route: '#/prelude-in-c', title: preludeInC.title, composer: preludeInC.composer,
  description: 'Unfold Bach’s complete harmonic journey through one endlessly flowing pattern.',
  meta: [preludeInC.key, `${preludeInC.steps.length} layers`, `${preludeInC.tempo} bpm`],
  playId: 'prelude-full', events: preludeInC.events, tempo: preludeInC.tempo,
}

const orderedPieces = [
  canonStudy,
  {
    route: '#/canon-in-d', title: canonInD.title, composer: canonInD.composer,
    description: 'Hear Pachelbel’s authentic three-part canon over its repeating continuo bass.',
    meta: [canonInD.key, 'Complete canon', `${canonInD.tempo} bpm`],
    playId: 'canon-full', events: canonInD.events, tempo: canonInD.tempo,
  },
  {
    route: '#/ode-to-joy',
    title: odeToJoy.title,
    composer: odeToJoy.composer,
    description: 'Discover how a stepwise melody and two dependable chords create an anthem.',
    meta: [odeToJoy.key, `${odeToJoy.steps.length} layers`, `${odeToJoy.tempo} bpm`],
    playId: 'ode-full',
    events: odeToJoy.events,
    tempo: odeToJoy.tempo,
  },
  catalogPieces[0],
  preludePiece,
  ...catalogPieces.slice(1),
]

export const libraryPieces = orderedPieces.map((piece, index) => ({
  ...piece,
  number: String(index + 1).padStart(2, '0'),
}))
