import type { PreviewSchema } from '@tutorialkit/types';
import type { WebContainer } from '@webcontainer/api';
import { atom } from 'nanostores';
import { PortInfo } from '../webcontainer/port-info.js';
import { PreviewInfo } from '../webcontainer/preview-info.js';

export class PreviewsStore {
  private _availablePreviews = new Map<number, PortInfo>();
  private _previewsLayout: PreviewInfo[] = [];

  /**
   * Atom representing the current previews. If it's an empty array or none of
   * the previews are ready, then no preview can be shown.
   */
  previews = atom<PreviewInfo[]>([]);

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this._init(webcontainerPromise);
  }

  private async _init(webcontainerPromise: Promise<WebContainer>) {
    const webcontainer = await webcontainerPromise;

    webcontainer.on('port', (port, type, url) => {
      let portInfo = this._availablePreviews.get(port);

      if (!portInfo) {
        portInfo = new PortInfo(port, url, type === 'open');

        this._availablePreviews.set(port, portInfo);
      }

      portInfo.ready = type === 'open';
      portInfo.origin = url;

      if (this._previewsLayout.length === 0) {
        this.previews.set([new PreviewInfo({}, portInfo)]);
      } else {
        this._previewsLayout = [...this._previewsLayout];
        this.previews.set(this._previewsLayout);
      }
    });
  }

  /**
   * Set the expected port for the preview to show. If this is not set,
   * the port of the first server that is ready will be used.
   */
  setPreviews(config: PreviewSchema) {
    if (config === false) {
      // clear the previews if they are turned off
      this.previews.set([]);

      return;
    }

    // if the schema is `true`, we just use the default empty array
    const previews = config === true ? [] : (config ?? []);

    const previewInfos = previews.map((previewConfig) => {
      const preview = PreviewInfo.parse(previewConfig);
      let portInfo = this._availablePreviews.get(preview.port);

      if (!portInfo) {
        portInfo = new PortInfo(preview.port);
        this._availablePreviews.set(preview.port, portInfo);
      }

      return new PreviewInfo(preview, portInfo);
    });

    let areDifferent = previewInfos.length != this._previewsLayout.length;

    if (!areDifferent) {
      for (let i = 0; i < previewInfos.length; i++) {
        areDifferent = !PreviewInfo.equals(previewInfos[i], this._previewsLayout[i]);

        if (areDifferent) {
          break;
        }
      }
    }

    if (!areDifferent) {
      return;
    }

    this._previewsLayout = previewInfos;

    /**
     * If a port is provided and the preview is already ready we update the previewUrl.
     * If no port is provided we default to the first preview ever to ready if there are any.
     */
    if (previews.length === 0) {
      const firstPreview = this._availablePreviews.values().next().value as PreviewInfo | undefined;

      this.previews.set(firstPreview ? [firstPreview] : []);
    } else {
      this.previews.set(this._previewsLayout);
    }
  }
}
