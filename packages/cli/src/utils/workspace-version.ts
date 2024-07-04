export function updateWorkspaceVersions(
  dependencies: Record<string, string>,
  version: string,
  filterDependency: (dependency: string) => boolean = allowAll,
) {
  for (const dependency in dependencies) {
    const depVersion = dependencies[dependency];

    if (depVersion === 'workspace:*' && filterDependency(dependency)) {
      if (process.env.TK_DIRECTORY) {
        const name = dependency.split('/')[1];

        dependencies[dependency] = `file:${process.env.TK_DIRECTORY}/packages/${name.replace('-', '/')}`;
      } else {
        dependencies[dependency] = version;
      }
    }
  }
}

function allowAll() {
  return true;
}
