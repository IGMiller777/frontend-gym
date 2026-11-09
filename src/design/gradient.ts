import type { Track } from '../content/tracks'

/** A track's signature gradient, used on cards, headers and step badges. */
export const gradient = (t: Pick<Track, 'colors'>) => `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`
