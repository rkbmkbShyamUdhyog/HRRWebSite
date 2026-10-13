import { readJson } from './readJson.js';

export function getCategories() {
  return readJson('categories.json');
}
