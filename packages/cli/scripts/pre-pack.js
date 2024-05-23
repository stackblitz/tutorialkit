import fsExtra from 'fs-extra';
import ignore from 'ignore';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { distFolder, overwritesFolder, templateDest, templatePath } from './_constants.js';
import { success } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await runBuild();

const gitignore = ignore().add(await fs.readFileSync(path.join(templatePath, '.gitignore'), 'utf8'));

/**
 * Do not copy over the content and the templates because they will be different
 * for the production version of the cli.
 */
gitignore.add(['src/content/tutorial', 'src/templates/*']);

// copy over template
await fsExtra.copy(templatePath, templateDest, {
  filter: (src) => {
    if (src === templatePath) {
      return true;
    }

    if (gitignore.ignores(path.relative(templatePath, src))) {
      return false;
    }

    return true;
  },
});

success('Template copied');

// copy overwrites
fs.cpSync(path.join(overwritesFolder), path.join(templateDest), {
  recursive: true,
});

// remove project references from tsconfig.json
const tsconfigPath = path.join(templateDest, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, { encoding: 'utf-8' }));

delete tsconfig.references;

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, undefined, 2));

async function runBuild() {
  const exitCode = await new Promise((resolve) => {
    const child = spawn('node', [path.join(__dirname, './build.js')], {
      stdio: 'inherit',
      env: {
        ...process.env,
        TUTORIALKIT_TEMPLATE_PATH: path.relative(distFolder, templateDest),
      },
    });

    child.on('close', () => resolve(child.exitCode));
  });

  if (exitCode !== 0) {
    process.exit(1);
  }
}
