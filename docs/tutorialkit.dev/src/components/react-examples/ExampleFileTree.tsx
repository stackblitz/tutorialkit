import FileTree from '@tutorialkit/react/core/FileTree';
import { useState, type ComponentProps } from 'react';

export default function ExampleFileTree() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[0].path);

  return (
    <FileTree
      files={files}
      hideRoot
      className="my-file-tree"
      hiddenFiles={['package-lock.json']}
      selectedFile={selectedFile}
      onFileSelect={setSelectedFile}
      onFileChange={async (event) => {
        if (event.method === 'add') {
          setFiles([...files, { path: event.value, type: event.type }]);
        }
      }}
    />
  );
}

const INITIAL_FILES: ComponentProps<typeof FileTree>['files'] = [
  { path: '/package-lock.json', type: 'file' },
  { path: '/package.json', type: 'file' },
  { path: '/src/assets/logo.svg', type: 'file' },
  { path: '/src/index.html', type: 'file' },
  { path: '/src/index.js', type: 'file' },
  { path: '/vite.config.js', type: 'file' },
];
