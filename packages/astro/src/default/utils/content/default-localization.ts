import type { Lesson } from '@tutorialkit/types';

export const DEFAULT_LOCALIZATION = {
  partTemplate: 'Part ${index}: ${title}',
  noPreviewNorStepsText: 'No preview to run nor steps to show',
  startWebContainerText: 'Run this tutorial',
  editPageText: 'Edit this page',
  webcontainerLinkText: 'Powered by WebContainers',
  filesTitleText: 'Files',
  fileTreeCreateFileText: 'Create file',
  fileTreeCreateFolderText: 'Create folder',
  prepareEnvironmentTitleText: 'Preparing Environment',
  defaultPreviewTitleText: 'Preview',
  reloadPreviewTitle: 'Reload Preview',
  toggleTerminalButtonText: 'Toggle Terminal',
  solveButtonText: 'Solve',
  resetButtonText: 'Reset',
} satisfies Required<Lesson['data']['i18n']>;
