import { useState } from 'react';
import FileTree from '@tutorialkit/react/core/FileTree';

export default function ExampleFileTree() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[0]);

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
          setFiles([...files, event.value].sort());
        }
      }}
    />
  );
}

const INITIAL_FILES = [
  '/package-lock.json',
  '/package.json',
  '/src/assets/logo.svg',
  '/src/index.html',
  '/src/index.js',
  '/vite.config.js',
];
