import type { PreviewSchema } from '@schemas';

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
  }

  constructor(preview: PreviewSchema, ready?: boolean) {
    if (typeof preview === 'number') {
      this.port = preview;
    } else if (Array.isArray(preview)) {
      this.port = preview[0];
      this.title = preview[1];
    } else {
      this.port = preview.port;
      this.title = preview.title;
    }

    this.ready = !!ready;
  }

  static equals(a: PreviewInfo, b: PreviewInfo) {
    return a.port === b.port;
  }
}
