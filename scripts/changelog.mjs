#!/usr/bin/env node
import addStream from 'add-stream';
import chalk from 'chalk';
import conventionalChangelog from 'conventional-changelog';
import fs from 'node:fs';
import path from 'node:path';
import tempfile from 'tempfile';

const PRESET = 'angular';

/**
 * @typedef {{
 *  path: string;
 *  excluded?: true;
 *  sameAs?: string;
 *  name?: string;
 *  changelogPath?: string;
 *  version?: string;
 *  gitPath?: string;
 * }} Package
 *
 * @type {Package[]}
 */
const PACKAGES = [
  { path: './packages/astro' },
  { path: './packages/cli' },
  { path: './packages/components/react' },
  { path: './packages/runtime' },

  // we do not include this one because it is not published
  { path: './packages/template', excluded: true },

  // the CHANGELOG of this one is the same as the one from the cli so it's also excluded from this list
  { path: './packages/create-tutorial', sameAs: 'tutorialkit' },
];

processPackages();

async function processPackages() {
  // infer extra properties
  for (const pkg of PACKAGES) {
    pkg.path = path.normalize(pkg.path);

    const pkgJSON = JSON.parse(fs.readFileSync(path.join(pkg.path, 'package.json')));

    pkg.name = pkgJSON.name;
    pkg.version = pkgJSON.version;
    pkg.changelogPath = path.join(pkg.path, 'CHANGELOG.md');
  }

  // generate change logs
  await Promise.all(
    PACKAGES.map((pkg) => {
      if (pkg.excluded) {
        return;
      }

      return generateChangelog(pkg);
    }),
  );

  // copy changelogs that are identical
  for (const pkg of PACKAGES) {
    if (pkg.sameAs) {
      const otherPkg = PACKAGES.find((otherPkg) => otherPkg.name === pkg.sameAs);

      fs.copyFileSync(otherPkg.changelogPath, pkg.changelogPath);
    }
  }

  // generate root changelog
  const tutorialkit = PACKAGES.find((pkg) => pkg.name === 'tutorialkit');

  await generateChangelog({
    version: tutorialkit.version,
    path: tutorialkit.path,
    gitPath: '.',
    changelogPath: 'CHANGELOG.md',
  });
}

/**
 * Generate a changelog for the provided package and aggregate the data
 * for the root changelog.
 *
 * @param {Package} pkg the package
 */
function generateChangelog(pkg) {
  const options = {
    preset: PRESET,
    pkg: {
      path: pkg.path,
    },
    append: undefined,
    releaseCount: undefined,
    skipUnstable: undefined,
    outputUnreleased: undefined,
    tagPrefix: undefined,
  };

  const context = {
    version: pkg.version,
    title: pkg.name,
  };

  const gitRawCommitsOpts = {
    path: pkg.gitPath ?? path.dirname(pkg.path),
  };

  const changelogStream = conventionalChangelog(options, context, gitRawCommitsOpts).on('error', (error) => {
    console.error(error.stack);
    process.exit(1);
  });

  const CHANGELOG_FILE = pkg.changelogPath;

  return new Promise((resolve) => {
    const readStream = fs.createReadStream(CHANGELOG_FILE).on('error', () => {
      // if there was no changelog we create it here
      changelogStream.pipe(fs.createWriteStream(CHANGELOG_FILE)).on('finish', resolve);
    });

    const tmp = tempfile();

    changelogStream
      .pipe(addStream(readStream))
      .pipe(fs.createWriteStream(tmp))
      .on('finish', () => {
        fs.createReadStream(tmp).pipe(fs.createWriteStream(CHANGELOG_FILE)).on('finish', resolve);
      });
  }).then(() => {
    console.log(`${chalk.green('UPDATED')} ${CHANGELOG_FILE} ${chalk.gray(pkg.version)}`);
  });
}
