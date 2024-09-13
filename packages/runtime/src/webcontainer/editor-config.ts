import type { EditorSchema } from '@tutorialkit/types';

interface NormalizedEditorConfig {
  /** Visibility of editor */
  visible: boolean;

  fileTree: {
    /** Visibility of file tree */
    visible: boolean;

    /** Whether to allow file and folder editing in file tree */
    allowEdits: boolean;
  };
}

export class EditorConfig {
  private _config: NormalizedEditorConfig;

  constructor(config?: EditorSchema) {
    this._config = normalizeEditorConfig(config);
  }

  get visible() {
    return this._config.visible;
  }

  get fileTree() {
    return this._config.fileTree;
  }
}

function normalizeEditorConfig(config?: EditorSchema): NormalizedEditorConfig {
  if (config === false) {
    return {
      visible: false,
      fileTree: {
        visible: false,
        allowEdits: false,
      },
    };
  }

  if (config === undefined || config === true) {
    return {
      visible: true,
      fileTree: {
        visible: true,
        allowEdits: false,
      },
    };
  }

  if (typeof config.fileTree === 'boolean') {
    return {
      visible: true,
      fileTree: {
        visible: config.fileTree,
        allowEdits: false,
      },
    };
  }

  return {
    visible: true,
    fileTree: {
      visible: true,
      allowEdits: config.fileTree?.allowEdits || false,
    },
  };
}
