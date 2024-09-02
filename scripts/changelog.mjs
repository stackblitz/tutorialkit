#!/usr/bin/env node
import fs from 'node:fs';
import { Package } from './changelog/Package.mjs';
import { generateChangelog } from './changelog/generate.mjs';

const PRESET = 'angular';

/**
 * @type {import('./changelog/Package.mjs').PackageConfiguration[]}
 */
const PACKAGES = [
  { path: './packages/astro' },
  { path: './packages/cli' },
  { path: './packages/react' },
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

  // overwrites temporarily the version on the `@tutorialkit/cli` package as it's released separately later
  const tutorialkitCli = packages.get('@tutorialkit/cli');
  const tutorialkitAstro = packages.get('@tutorialkit/astro');

  const originalVersion = tutorialkitCli.version;
  tutorialkitCli.version = tutorialkitAstro.version;

  tutorialkitCli.write();

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
      version: tutorialkitCli.version,
      path: tutorialkitCli.path,
      gitPath: '.',
      changelogPath: 'CHANGELOG.md',
    },
    PRESET,
  );

  // reset the version of the CLI:
  tutorialkitCli.version = originalVersion;
  tutorialkitCli.write();
}
