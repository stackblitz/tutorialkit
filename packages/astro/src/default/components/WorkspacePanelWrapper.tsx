import { useStore } from '@nanostores/react';
import { WorkspacePanel } from '@tutorialkit/components-react';
import type { Lesson } from '@tutorialkit/types';
import { themeStore } from '../stores/theme-store';
import { tutorialRunner } from './webcontainer';

interface Props {
  lesson: Lesson;
}

export function WorkspacePanelWrapper({ lesson }: Props) {
  const theme = useStore(themeStore);

  return <WorkspacePanel lesson={lesson} tutorialRunner={tutorialRunner} theme={theme} />;
}
