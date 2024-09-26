import type { Lesson } from '@tutorialkit/types';
import type { GetStaticPaths, GetStaticPathsItem } from 'astro';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { getTutorial } from './content';
import { generateNavigationList } from './nav';

export async function generateStaticRoutes() {
  const tutorial = await getTutorial();

  const routes = [];

  const parts = Object.values(tutorial.parts);

  for (const part of parts) {
    const chapters = Object.values(part.chapters);

    for (const chapter of chapters) {
      const lessons = Object.values(chapter.lessons);

      for (const lesson of lessons) {
        routes.push({
          params: {
            slug: `/${part.slug}/${chapter.slug}/${lesson.slug}`,
          },
          props: {
            logoLink: tutorial.logoLink,
            navList: generateNavigationList(tutorial, import.meta.env.BASE_URL),
            title: `${part.data.title} / ${chapter.data.title} / ${lesson.data.title}`,
            meta: lesson.data.meta,
            lesson: lesson as Lesson<AstroComponentFactory>,
          },
        } satisfies GetStaticPathsItem);
      }
    }
  }

  return routes satisfies ReturnType<GetStaticPaths>;
}
