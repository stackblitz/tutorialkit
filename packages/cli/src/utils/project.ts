import { randomValueFromArray } from './random.js';
import { adjectives, nouns } from './words.js';

export function generateProjectName() {
  const adjective = randomValueFromArray(adjectives);
  const noun = randomValueFromArray(nouns);

  return `${adjective}-${noun}`;
}
