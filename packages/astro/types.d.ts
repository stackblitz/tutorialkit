declare module 'tutorialkit:store' {
  const tutorialStore: import('@tutorialkit/runtime').TutorialStore;

  export default tutorialStore;
}

declare module 'tutorialkit:core' {
  export const webcontainer: import('@webcontainer/api').WebContainer;
}

declare module 'tutorialkit:override-components' {
  const topBar: typeof import('./src/default/components/TopBar.astro').default;

  export { topBar as TopBar };
}
