#!/usr/bin/env node
import fs from 'node:fs';
import { Package } from './changelog/Package.mjs';
import { generateChangelog } from './changelog/generate.mjs';

const PRESET = 'angular';

/**
 * @typedef {{
 *  path: string;
 *  excluded?: true;
 *  sameAs?: string;
 * }} PackageConfiguration A package in the monorepo to generate changelog for.
 *
 * @type {PackageConfiguration[]}
 */
const PACKAGES = [
  { path: './packages/astro' },
  { path: './packages/cli' },
  { path: './packages/components/react' },
  { path: './packages/runtime' },
  { path: './packages/theme' },
  { path: './packages/types' },

  // we do not include this one because it is not published
  { path: './packages/template', excluded: true },

  // the CHANGELOG of this one is the same as the one from the cli so it's also excluded from this list
  { path: './packages/create-tutorial', sameAs: 'tutorialkit' },
];

processPackages();

async function processPackages() {
  /** @type {Map<string, Package>} */
  const packages = new Map();

  // infer extra properties
  for (const pkgDef of PACKAGES) {
    const pkg = new Package(pkgDef);
    packages.set(pkg.name, pkg);
  }

  // overwrites temporarily the version on the `tutorialkit` package as it's released separately later
  const tutorialkit = packages.get('tutorialkit');
  const tutorialkitAstro = packages.get('@tutorialkit/astro');

  const originalVersion = tutorialkit.version;
  tutorialkit.version = tutorialkitAstro.version;

  tutorialkit.write();

  // generate change logs
  await Promise.all(
    [...packages.values()].map((pkg) => {
      if (pkg.excluded) {
        return Promise.resolve();
      }

      return generateChangelog(pkg, PRESET);
    }),
  );

  // copy changelogs that are identical
  for (const pkg of packages.values()) {
    if (pkg.sameAs) {
      const otherPkg = packages.get(pkg.sameAs);

      fs.copyFileSync(otherPkg.changelogPath, pkg.changelogPath);
    }
  }

  // generate root changelog
  await generateChangelog(
    {
      version: tutorialkit.version,
      path: tutorialkit.path,
      gitPath: '.',
      changelogPath: 'CHANGELOG.md',
    },
    PRESET,
  );

  // reset the version of the CLI:
  tutorialkit.version = originalVersion;
  tutorialkit.write();
}
