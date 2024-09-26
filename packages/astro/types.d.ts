/* eslint-disable @blitz/lines-around-comment */

declare module 'tutorialkit:store' {
  const tutorialStore: import('@tutorialkit/runtime').TutorialStore;

  export default tutorialStore;
}

declare module 'tutorialkit:core' {
  /** Promise that resolves to the webcontainer that's running in the current lesson. */
  export const webcontainer: Promise<import('@webcontainer/api').WebContainer>;
}
