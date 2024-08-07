import * as vscode from 'vscode';
import { dirname } from 'path';

export function uriDirname(uri: vscode.Uri): vscode.Uri {
  if (uri.path.length === 0 || uri.path === '/') {
    return uri;
  }

  let path = dirname(uri.path);

  if (path.length === 1 && path.charCodeAt(0) === 46 /* CharCode.Period */) {
    path = '';
  }

  return uri.with({ path });
}
