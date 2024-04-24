import { useContext, useEffect, useState } from 'react';
import { TutorialRunnerContext } from './webcontainer/tutorial-runner';

export default function Preview() {
  const [previewUrl, setPreviewUrl] = useState('');
  const tutorialRunner = useContext(TutorialRunnerContext);

  useEffect(() => {
    const unsubribe = tutorialRunner.onPreviewURLChange((port, url) => {
      setPreviewUrl(url);
    });

    return () => {
      unsubribe.then((cancel) => cancel()).catch();
    };
  }, []);

  return (
    <div className="h-full">
      {previewUrl ? <iframe src={previewUrl} className="h-full w-full"></iframe> : 'No preview to show'}
    </div>
  );
}
