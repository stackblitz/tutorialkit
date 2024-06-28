import fsExtra from 'fs-extra';
import ignore from 'ignore';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { temporaryDirectoryTask } from 'tempy';
import { distFolder, overwritesFolder, templateDest, templatePath } from './_constants.js';
import { success } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')).version;
const env = { ...process.env, COREPACK_ENABLE_STRICT: '0' };

await execa('node', [path.join(__dirname, './build.js')], {
  stdio: 'inherit',
  env: {
    ...env,
    TUTORIALKIT_TEMPLATE_PATH: path.relative(distFolder, templateDest),
  },
});

const gitignore = ignore().add(fs.readFileSync(path.join(templatePath, '.gitignore'), 'utf8'));

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
updateJSON('tsconfig.json', (tsconfig) => {
  delete tsconfig.references;
});

// update dependencies
updateJSON('package.json', (packageJson) => {
  updateWorkspaceVersions(packageJson.dependencies, version);
  updateWorkspaceVersions(packageJson.devDependencies, version);
});

// generate lockfiles
await temporaryDirectoryTask(async (tmp) => {
  fs.cpSync(path.join(templateDest, 'package.json'), path.join(tmp, 'package.json'));

  await execa('npm', ['install', '--package-lock-only'], { cwd: tmp, env });
  await execa('pnpm', ['install', '--lockfile-only'], { cwd: tmp, env });
  await execa('yarn', ['install'], { cwd: tmp, env });

  fs.cpSync(path.join(tmp, 'package-lock.json'), path.join(templateDest, 'package-lock.json'));
  fs.cpSync(path.join(tmp, 'pnpm-lock.yaml'), path.join(templateDest, 'pnpm-lock.yaml'));
  fs.cpSync(path.join(tmp, 'yarn.lock'), path.join(templateDest, 'yarn.lock'));

  console.log('Created', path.join(templateDest, 'package-lock.json'));
  console.log('Created', path.join(templateDest, 'pnpm-lock.yaml'));
  console.log('Created', path.join(templateDest, 'yarn.lock'));
});

success('Lockfiles generated');

function updateWorkspaceVersions(dependencies, version) {
  for (const dependency in dependencies) {
    const depVersion = dependencies[dependency];

    if (depVersion === 'workspace:*') {
      dependencies[dependency] = version;
    }
  }
}

function updateJSON(filename, callback) {
  const filepath = path.join(templateDest, filename);
  const json = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  callback(json);

  fs.writeFileSync(filepath, JSON.stringify(json, undefined, 2));
}
