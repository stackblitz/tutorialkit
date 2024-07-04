import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {{
 *  path: string;
 *  excluded?: true;
 *  sameAs?: string;
 * }} PackageConfiguration A package in the monorepo to generate changelog for.
 */

export class Package {
  /**
   * @param {PackageConfiguration} pkg
   */
  constructor(pkg) {
    const pkgPath = path.normalize(pkg.path);
    const pkgJSON = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json')));

    this.excluded = pkg.excluded;
    this.path = pkgPath;
    this.pkgJSON = pkgJSON;
    this.changelogPath = path.join(pkgPath, 'CHANGELOG.md');
  }

  write() {
    fs.writeFileSync(path.join(this.path, 'package.json'), JSON.stringify(this.pkgJSON, undefined, 2) + '\n', 'utf-8');
  }

  get name() {
    return this.pkgJSON.name;
  }

  set name(value) {
    this.pkgJSON.name = value;
  }

  get version() {
    return this.pkgJSON.version;
  }

  set version(value) {
    this.pkgJSON.version = value;
  }
}
