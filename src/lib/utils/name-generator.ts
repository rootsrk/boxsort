// Funky name generator: adjective-animal-noun format
// ~100 words per category = 1,000,000+ unique combinations

const adjectives = [
  'purple', 'golden', 'silver', 'cosmic', 'swift', 'brave', 'quiet', 'wild',
  'gentle', 'fierce', 'happy', 'sleepy', 'sunny', 'misty', 'stormy', 'frozen',
  'blazing', 'ancient', 'modern', 'rustic', 'mystic', 'magic', 'lucky', 'clever',
  'bold', 'calm', 'cool', 'crisp', 'dark', 'deep', 'dusty', 'eager', 'early',
  'easy', 'fair', 'fancy', 'fast', 'fine', 'firm', 'flat', 'free', 'fresh',
  'full', 'fuzzy', 'glad', 'grand', 'great', 'green', 'grey', 'handy', 'hasty',
  'heavy', 'hidden', 'hollow', 'humble', 'icy', 'jade', 'jolly', 'keen', 'kind',
  'large', 'late', 'lazy', 'light', 'lively', 'lone', 'long', 'loud', 'low',
  'lunar', 'mad', 'mega', 'mellow', 'mighty', 'mild', 'mini', 'neat', 'new',
  'noble', 'odd', 'old', 'pale', 'plain', 'prime', 'proud', 'pure', 'quick',
  'rare', 'raw', 'red', 'rich', 'ripe', 'rough', 'round', 'ruby', 'safe', 'sage',
  'shy', 'silent', 'slim', 'slow', 'small', 'smart', 'smooth', 'soft', 'solid',
]

const animals = [
  'tiger', 'falcon', 'dolphin', 'phoenix', 'dragon', 'wolf', 'bear', 'eagle',
  'owl', 'fox', 'hawk', 'lion', 'panther', 'raven', 'shark', 'whale', 'zebra',
  'badger', 'beaver', 'bison', 'buffalo', 'camel', 'cheetah', 'cobra', 'condor',
  'cougar', 'coyote', 'crane', 'crow', 'deer', 'dove', 'duck', 'elk', 'ferret',
  'finch', 'gazelle', 'gecko', 'giraffe', 'goat', 'goose', 'gorilla', 'hare',
  'heron', 'hippo', 'horse', 'hyena', 'ibis', 'iguana', 'impala', 'jackal',
  'jaguar', 'jay', 'koala', 'lemur', 'leopard', 'llama', 'lynx', 'macaw',
  'mammoth', 'manta', 'marten', 'meerkat', 'moose', 'mouse', 'newt', 'orca',
  'otter', 'panda', 'parrot', 'pelican', 'penguin', 'pigeon', 'pony', 'puma',
  'python', 'quail', 'rabbit', 'raccoon', 'ram', 'raptor', 'robin', 'salmon',
  'seal', 'sloth', 'snake', 'sparrow', 'spider', 'squid', 'stag', 'stork',
  'swan', 'swift', 'tapir', 'toucan', 'turtle', 'viper', 'vulture', 'walrus',
]

const nouns = [
  'cloud', 'storm', 'river', 'crystal', 'mountain', 'forest', 'ocean', 'thunder',
  'shadow', 'flame', 'frost', 'wind', 'star', 'moon', 'sun', 'rain', 'snow',
  'wave', 'stone', 'leaf', 'bloom', 'canyon', 'valley', 'peak', 'ridge', 'cave',
  'coast', 'creek', 'delta', 'dune', 'field', 'glade', 'grove', 'harbor', 'haven',
  'island', 'jungle', 'lake', 'marsh', 'meadow', 'mesa', 'oasis', 'plain', 'pond',
  'prairie', 'reef', 'shore', 'spring', 'stream', 'summit', 'swamp', 'trail',
  'tundra', 'vista', 'woods', 'anchor', 'arrow', 'beacon', 'blade', 'bolt',
  'bridge', 'castle', 'comet', 'crown', 'dawn', 'dream', 'echo', 'ember', 'fable',
  'forge', 'garden', 'gate', 'gem', 'glow', 'harbor', 'heart', 'hollow', 'horizon',
  'jewel', 'knight', 'lamp', 'lantern', 'legend', 'light', 'mist', 'night',
  'orbit', 'palace', 'path', 'pearl', 'prism', 'quest', 'realm', 'relic', 'ridge',
  'ring', 'saga', 'spark', 'spirit', 'sprite', 'temple', 'throne', 'tower', 'trail',
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generates a funky name in adjective-animal-noun format
 * e.g., "purple-tiger-cloud", "golden-falcon-river"
 */
export function generateFunkyName(): string {
  const adjective = getRandomElement(adjectives)
  const animal = getRandomElement(animals)
  const noun = getRandomElement(nouns)
  return `${adjective}-${animal}-${noun}`
}

/**
 * Generates multiple unique funky names
 */
export function generateMultipleFunkyNames(count: number): string[] {
  const names = new Set<string>()
  while (names.size < count) {
    names.add(generateFunkyName())
  }
  return Array.from(names)
}

/**
 * Check if a string looks like a funky name (three hyphen-separated words)
 */
export function isFunkyName(name: string): boolean {
  const parts = name.split('-')
  return parts.length === 3 && parts.every((part) => part.length > 0)
}

