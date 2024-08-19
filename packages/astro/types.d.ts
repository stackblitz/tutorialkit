declare module 'tutorialkit:store' {
  const tutorialStore: import('@tutorialkit/runtime').TutorialStore;

  export default tutorialStore;
}

declare module 'tutorialkit:core' {
  export const webcontainer: Promise<import('@webcontainer/api').WebContainer>;
}
