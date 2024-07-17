export function updateWorkspaceVersions(
  dependencies: Record<string, string>,
  version: string,
  filterDependency: (dependency: string) => boolean = allowAll,
) {
  for (const dependency in dependencies) {
    const depVersion = dependencies[dependency];

    if (depVersion === 'workspace:*' && filterDependency(dependency)) {
      dependencies[dependency] = version;
    }
  }
}

function allowAll() {
  return true;
}
