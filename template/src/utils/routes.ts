import type { Lesson, Tutorial } from '@entities/tutorial';
import type { GetStaticPaths, GetStaticPathsItem } from 'astro';

export interface LessonRouteProps {
  lesson: Lesson;
}

export function generateStaticRoutes(tutorial: Tutorial) {
  const routes = [];

  const parts = Object.values(tutorial);

  for (const part of parts) {
    const chapters = Object.values(part.chapters);

    for (const chapter of chapters) {
      const lessons = Object.values(chapter.lessons);

      for (const lesson of lessons) {
        routes.push({
          params: {
            slug: `/${parts.length > 1 ? `${part.slug}/` : ''}${chapter.slug}/${lesson.slug}`,
          },
          props: {
            lesson: {
              ...lesson,
              title: `${parts.length > 1 ? `${part.data.title} / ` : ''}${chapter.data.title} / ${lesson.data.title}`,
            },
          },
        } satisfies GetStaticPathsItem);
      }
    }
  }

  return routes satisfies ReturnType<GetStaticPaths>;
}
