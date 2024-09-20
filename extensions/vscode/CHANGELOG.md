# Changelog

All notable changes to the "tutorialkit" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.2]

- Prevent running extension on non-TutorialKit projects (#242)

## [0.1.1]

All the following changes are for the Tutorial Panel:

- Add the tutorial as the root element of the tree so that the root metadata can be viewed and edited easily
- Add an "Add Part" action to the context menu of the root element
- Add a "Delete" action to every context menu to remove a part, chapter or lesson
- When the order is defined in the metadata, it is reflected in the panel
- When a new part, chapter or lesson is created if the parent uses the order defined in the metadata, then it gets automatically added there.

## [0.1.0]

- Add autocompletion in the metadata of TutorialKit markdown and mdx files (see: https://github.com/stackblitz/tutorialkit/pull/143)

## [0.0.11]

- Remove the error toast appearing when loading the extension with no workspace present

## [0.0.10]

- Relax the vscode engine requirement to allow versions as low as 1.80.0
- Update the extension icon

## [0.0.9]

- Initial release
