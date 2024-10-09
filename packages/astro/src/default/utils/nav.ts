import type { Tutorial, NavList } from '@tutorialkit/types';
import { joinPaths } from './url';

export function generateNavigationList(tutorial: Tutorial, baseURL: string): NavList {
  return objectToSortedArray(tutorial.parts).map((part) => {
    return {
      id: part.id,
      title: part.data.title,
      sections: objectToSortedArray(part.chapters).map((chapter) => {
        const lessons = tutorial.lessons.filter(
          (lesson) => lesson.part.id === part.id && lesson.chapter.id === chapter.id,
        );

        return {
          id: chapter.id,
          title: chapter.data.title,
          sections: lessons.sort(sortByOrder).map((lesson) => {
            return {
              id: lesson.id,
              title: lesson.data.title,
              href: joinPaths(baseURL, `/${part.slug}/${chapter.slug}/${lesson.slug}`),
            };
          }),
        };
      }),
    };
  });
}

function objectToSortedArray<T extends Record<any, { order: number }>>(object: T): Array<T[keyof T]> {
  return Object.keys(object)
    .map((key) => object[key] as T[keyof T])
    .sort(sortByOrder);
}

function sortByOrder<T extends { order: number }>(a: T, b: T) {
  return a.order - b.order;
}
