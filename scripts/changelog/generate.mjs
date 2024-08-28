import fs from 'node:fs';
import addStream from 'add-stream';
import chalk from 'chalk';
import conventionalChangelog from 'conventional-changelog';
import tempfile from 'tempfile';

/**
 * @typedef {{
 *  path: string;
 *  gitPath?: string;
 *  version: string;
 *  name: string;
 *  changelogPath: string;
 * }} PackageSpec A package specification to generate the changelog from.
 */

/**
 * Generate a changelog for the provided package and aggregate the data
 * for the root changelog.
 *
 * @param {PackageSpec} pkg the package
 * @param {string} preset preset to use
 */
export function generateChangelog(pkg, preset) {
  const options = {
    preset,
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
    path: pkg.gitPath ?? pkg.path,
  };

  // detect breaking change headers: https://github.com/conventional-changelog/conventional-changelog/issues/648#issuecomment-704867077
  const parserOptions = {
    headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
    breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
  };

  const changelogStream = conventionalChangelog(options, context, gitRawCommitsOpts, parserOptions).on(
    'error',
    (error) => {
      console.error(error.stack);
      process.exit(1);
    },
  );

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
