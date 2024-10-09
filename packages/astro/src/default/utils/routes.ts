import type { Lesson } from '@tutorialkit/types';
import type { GetStaticPaths, GetStaticPathsItem } from 'astro';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { getTutorial } from './content';
import { generateNavigationList } from './nav';

export async function generateStaticRoutes() {
  const tutorial = await getTutorial();

  const routes = [];
  const lessons = Object.values(tutorial.lessons);

  for (const lesson of lessons) {
    const part = tutorial.parts[lesson.part.id];
    const chapter = part.chapters[lesson.chapter.id];

    routes.push({
      params: {
        slug: `/${part.slug}/${chapter.slug}/${lesson.slug}`,
      },
      props: {
        title: `${lesson.part.title} / ${lesson.chapter.title} / ${lesson.data.title}`,
        lesson: lesson as Lesson<AstroComponentFactory>,
        logoLink: tutorial.logoLink,
        navList: generateNavigationList(tutorial, import.meta.env.BASE_URL),
      },
    } satisfies GetStaticPathsItem);
  }

  return routes satisfies ReturnType<GetStaticPaths>;
}
