---
type: lesson
title: Allow Edits Glob
previews: false
editor:
  fileTree:
    allowEdits:
      # Items in root
      - "/*"
      # Only "allowed-filename-only.js" inside "/first-level" folder
      - "/first-level/allowed-filename-only.js"
      # Anything inside "second-level" folders anywhere
      - "**/second-level/**"
terminal:
  panels: terminal
---

# File Tree test - Allow Edits Glob
