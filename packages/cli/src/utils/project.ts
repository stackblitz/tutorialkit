import { randomValueFromArray } from './random';
import { adjectives, nouns } from './words';

export function generateProjectName() {
  const adjective = randomValueFromArray(adjectives);
  const noun = randomValueFromArray(nouns);
  return `${adjective}-${noun}`;
}
