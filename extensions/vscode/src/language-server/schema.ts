import fs from 'node:fs';
import path from 'node:path';

export function readSchema() {
  try {
    const fileContent = fs.readFileSync(path.join(__dirname, './schema.json'), 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    return {};
  }
}
