import { useStore } from '@nanostores/react';
import { useContext } from 'react';
import { TutorialRunnerContext } from './webcontainer/tutorial-runner';

export function Preview() {
  const tutorialRunner = useContext(TutorialRunnerContext);
  const previewUrl = useStore(tutorialRunner.previewUrl);

  return (
    <div className="h-full">
      {previewUrl ? <iframe src={previewUrl} className="h-full w-full"></iframe> : 'No preview to show'}
    </div>
  );
}
