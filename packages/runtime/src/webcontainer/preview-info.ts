import type { PreviewSchema } from '@tutorialkit/types';

export class PreviewInfo {
  port: number;
  ready: boolean;
  title?: string;
  baseUrl?: string;
  pathname?: string;

  get url(): string | undefined {
    if (this.baseUrl) {
      return new URL(this.pathname ?? '/', this.baseUrl).toString();
    }

    return undefined;
  }

  constructor(preview: Exclude<PreviewSchema, boolean>[0], ready?: boolean) {
    if (typeof preview === 'number') {
      this.port = preview;
    } else if (typeof preview === 'string') {
      const [port, ...rest] = preview.split('/');
      this.port = parseInt(port);
      this.pathname = rest.join('/');
    } else if (Array.isArray(preview)) {
      this.port = preview[0];
      this.title = preview[1];
      this.pathname = preview[2];
    } else {
      this.port = preview.port;
      this.title = preview.title;
      this.pathname = preview.pathname;
    }

    this.ready = !!ready;
  }

  static equals(a: PreviewInfo, b: PreviewInfo) {
    return a.port === b.port && a.pathname === b.pathname && a.title === b.title;
  }
}
