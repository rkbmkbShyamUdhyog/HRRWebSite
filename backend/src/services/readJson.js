import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const dataPath = (name) => fileURLToPath(new URL(`../data/${name}`, import.meta.url));

export function readJson(name) {
  return JSON.parse(readFileSync(dataPath(name), 'utf-8'));
}
