import type { PreviewSchema } from '@tutorialkit/types';
import { PortInfo } from './port-info.js';

export class PreviewInfo {
  portInfo: PortInfo;

  title?: string;
  pathname?: string;

  get url(): string | undefined {
    if (this.baseUrl) {
      return new URL(this.pathname ?? '/', this.baseUrl).toString();
    }

    return undefined;
  }

  get port() {
    return this.portInfo.port;
  }

  get baseUrl() {
    return this.portInfo.origin;
  }

  get ready() {
    return this.portInfo.ready;
  }

  constructor(preview: PortInfo | Exclude<PreviewSchema, boolean>[0], ready?: boolean) {
    if (preview instanceof PortInfo) {
      this.portInfo = preview;
    } else if (typeof preview === 'number') {
      this.portInfo = new PortInfo(preview);
    } else if (typeof preview === 'string') {
      const [port, ...rest] = preview.split('/');
      this.portInfo = new PortInfo(parseInt(port));
      this.pathname = rest.join('/');
    } else if (Array.isArray(preview)) {
      this.portInfo = new PortInfo(preview[0]);
      this.title = preview[1];
      this.pathname = preview[2];
    } else {
      this.portInfo = new PortInfo(preview.port);
      this.title = preview.title;
      this.pathname = preview.pathname;
    }

    this.portInfo.ready ||= !!ready;
  }

  static equals(a: PreviewInfo, b: PreviewInfo) {
    return a.portInfo.port === b.portInfo.port && a.pathname === b.pathname && a.title === b.title;
  }
}
