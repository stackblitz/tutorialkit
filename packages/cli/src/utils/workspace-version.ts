export function updateWorkspaceVersions(dependencies: Record<string, string>, version: string) {
  for (const dependency in dependencies) {
    const depVersion = dependencies[dependency];

    if (depVersion === 'workspace:*') {
      if (process.env.TK_DIRECTORY) {
        const name = dependency.split('/')[1];

        dependencies[dependency] = `file:${process.env.TK_DIRECTORY}/packages/${name.replace('-', '/')}`;
      } else {
        dependencies[dependency] = version;
      }
    }
  }
}
