import * as serverProtocol from '@volar/language-server/protocol';
import { createLabsInfo } from '@volar/vscode';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';
import { useCommands } from './commands';
import { useLessonTree } from './views/lessonsTree';

export let extContext: vscode.ExtensionContext;

let client: lsp.BaseLanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  extContext = context;

  useCommands();
  useLessonTree();

  const serverModule = vscode.Uri.joinPath(context.extensionUri, 'dist', 'server.js');
  const runOptions = { execArgv: <string[]>[] };
  const debugOptions = { execArgv: ['--nolazy', '--inspect=' + 6009] };

  const serverOptions: lsp.ServerOptions = {
    run: {
      module: serverModule.fsPath,
      transport: lsp.TransportKind.ipc,
      options: runOptions,
    },
    debug: {
      module: serverModule.fsPath,
      transport: lsp.TransportKind.ipc,
      options: debugOptions,
    },
  };

  const clientOptions: lsp.LanguageClientOptions = {
    documentSelector: [{ language: 'markdown' }, { language: 'mdx' }],
    initializationOptions: {},
  };

  client = new lsp.LanguageClient('tutorialkit-language-server', 'TutorialKit', serverOptions, clientOptions);

  await client.start();

  const labsInfo = createLabsInfo(serverProtocol);
  labsInfo.addLanguageClient(client);

  return labsInfo.extensionExports;
}

export function deactivate() {
  return client?.stop();
}
