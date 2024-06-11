import { useStore } from '@nanostores/react';
import { WorkspacePanel } from '@tutorialkit/components-react';
import type { Lesson } from '@tutorialkit/types';
import { themeStore } from '../stores/theme-store.js';
import { tutorialStore } from './webcontainer.js';

interface Props {
  lesson: Lesson;
}

export function WorkspacePanelWrapper({ lesson }: Props) {
  const theme = useStore(themeStore);

  tutorialStore.setLesson(lesson, { ssr: import.meta.env.SSR });

  return <WorkspacePanel tutorialStore={tutorialStore} theme={theme} />;
}
