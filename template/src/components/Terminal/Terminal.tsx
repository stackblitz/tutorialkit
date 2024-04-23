import { themeIsDark, themeStore } from '@stores/theme-store';
import '@styles/xterm.css';
import { escapeCodes } from '@utils/terminal';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import { useContext, useEffect, useRef } from 'react';
import { tick } from '../../utils/event-loop';
import { WebContainerContext, isWebContainerSupported } from '../webcontainer';
import { darkTheme, lightTheme } from './theme';

interface Props {
  readonly?: boolean;
}

export default function Terminal({ readonly = false }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { webcontainer, loaded: webcontainerLoaded } = useContext(WebContainerContext);

  useEffect(() => {
    if (!terminalRef.current) {
      console.error('Terminal reference undefined');
      return;
    }

    const element = terminalRef.current;

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      disableStdin: false,
      theme: themeIsDark() ? darkTheme : lightTheme,
      fontSize: 13,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    const unsubscribeFromThemeStore = themeStore.subscribe(() => {
      terminal.options.theme = themeIsDark() ? darkTheme : lightTheme;
    });

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.open(element);

    fitAddon.fit();

    if (!isWebContainerSupported()) {
      terminal.write(
        [
          escapeCodes.red('Incompatible Web Browser'),
          '',
          `WebContainers currently work in Chromium-based browsers, Firefox, and Safari 16.4. We're hoping to add support for more browsers as they implement the necessary Web Platform features.`,
          '',
          'Read more about browser support:',
          'https://webcontainers.io/guides/browser-support',
          '',
        ].join('\n')
      );
    }

    if (!webcontainerLoaded) {
      terminal.write('Booting WebContainer...');

      webcontainer
        .then(async (webcontainer) => {
          await tick();

          clearTerminal(terminal);

          terminal.onData((data) => {
            console.log(data);
          });
        })
        .catch(async () => {
          /**
           * We wait until the next tick to render the error cause it can happen
           * that the terminal is not cleared.
           */
          await tick();

          clearTerminal(terminal);

          terminal.write(
            [
              escapeCodes.red(`Looks like your browser's configuration is blocking WebContainers.`),
              '',
              `Let's troubleshoot this!`,
              '',
              'Read more at:',
              'https://webcontainers.io/guides/browser-config',
              '',
            ].join('\n')
          );
        });
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(element);

    return () => {
      unsubscribeFromThemeStore();
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  return <div className="h-full" ref={terminalRef} />;
}

function clearTerminal(terminal: XTerm) {
  terminal.reset();
  terminal.write(escapeCodes.clear);
}
