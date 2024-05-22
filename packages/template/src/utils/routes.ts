import type { GetStaticPaths, GetStaticPathsItem } from 'astro';
import { getTutorial } from './content';
import { generateNavigationList } from './nav';

export async function generateStaticRoutes() {
  const tutorial = await getTutorial();

  const routes = [];

  const parts = Object.values(tutorial);

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
            navList: generateNavigationList(tutorial),
            title: `${part.slug} / ${chapter.data.title} / ${lesson.data.title}`,
            lesson,
          },
        } satisfies GetStaticPathsItem);
      }
    }
  }

  return routes satisfies ReturnType<GetStaticPaths>;
}
