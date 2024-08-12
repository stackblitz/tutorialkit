import type { PreviewSchema } from '@tutorialkit/types';
import { PortInfo } from './port-info.js';

export class PreviewInfo {
  readonly portInfo: PortInfo;
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

  constructor(preview: Omit<Preview, 'port'>, portInfo: PortInfo) {
    this.title = preview.title;
    this.pathname = preview.pathname;
    this.portInfo = portInfo;
  }

  static parse(preview: Exclude<PreviewSchema, boolean>[0]): Preview {
    if (typeof preview === 'number') {
      return {
        port: preview,
      };
    } else if (typeof preview === 'string') {
      const [port, ...rest] = preview.split('/');
      return {
        port: parseInt(port),
        pathname: rest.join('/'),
      };
    } else if (Array.isArray(preview)) {
      return {
        port: preview[0],
        title: preview[1],
        pathname: preview[2],
      };
    } else {
      return preview;
    }
  }

  static equals(a: PreviewInfo, b: PreviewInfo) {
    return a.portInfo.port === b.portInfo.port && a.pathname === b.pathname && a.title === b.title;
  }
}

interface Preview {
  port: number;
  pathname?: string;
  title?: string;
}
