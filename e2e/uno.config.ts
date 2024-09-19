import { defineConfig } from '@tutorialkit/theme';

export default defineConfig({
  // required for TutorialKit monorepo development mode
  content: {
    pipeline: {
      include: '**',
    },
  },
});
