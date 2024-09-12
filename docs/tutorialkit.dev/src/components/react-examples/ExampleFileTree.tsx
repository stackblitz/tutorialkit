import { useState, type ComponentProps } from 'react';
import FileTree from '@tutorialkit/react/core/FileTree';

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
      onFileChange={(event) => {
        if (event.method === 'ADD') {
          setFiles([...files, { path: event.value, type: event.type }].sort());
        }
      }}
    />
  );
}

const INITIAL_FILES: ComponentProps<typeof FileTree>['files'] = [
  { path: '/package-lock.json', type: 'FILE' },
  { path: '/package.json', type: 'FILE' },
  { path: '/src/assets/logo.svg', type: 'FILE' },
  { path: '/src/index.html', type: 'FILE' },
  { path: '/src/index.js', type: 'FILE' },
  { path: '/vite.config.js', type: 'FILE' },
];
