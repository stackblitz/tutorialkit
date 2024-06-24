import type { Tutorial, NavList } from '@tutorialkit/types';

export function generateNavigationList(tutorial: Tutorial, baseURL: string): NavList {
  return objectToSortedArray(tutorial.parts).map((part) => {
    return {
      id: part.id,
      title: part.data.title,
      sections: objectToSortedArray(part.chapters).map((chapter) => {
        return {
          id: chapter.id,
          title: chapter.data.title,
          sections: objectToSortedArray(chapter.lessons).map((lesson) => {
            return {
              id: lesson.id,
              title: lesson.data.title,
              href: `/${part.slug}/${chapter.slug}/${lesson.slug}`,
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
    .sort((a, b) => a.order - b.order);
}
