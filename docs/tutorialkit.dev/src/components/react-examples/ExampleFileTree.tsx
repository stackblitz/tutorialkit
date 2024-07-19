import { useState } from 'react';
import FileTree from '@tutorialkit/react/core/FileTree';

export default function ExampleFileTree() {
  const [selectedFile, setSelectedFile] = useState(FILES[0]);

  return (
    <FileTree
      files={FILES}
      hideRoot
      className="my-file-tree"
      hiddenFiles={['package-lock.json']}
      selectedFile={selectedFile}
      onFileSelect={setSelectedFile}
    />
  );
}

const FILES = [
  '/src/index.js',
  '/src/index.html',
  '/src/assets/logo.svg',
  '/package-lock.json',
  '/package.json',
  '/vite.config.js',
];
