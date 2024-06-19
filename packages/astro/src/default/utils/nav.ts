import type { Tutorial, NavList } from '@tutorialkit/types';

export function generateNavigationList(tutorial: Tutorial): NavList {
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

function objectToSortedArray<T extends Record<any, any>>(object: T): Array<T[keyof T]> {
  return Object.keys(object)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => object[key]);
}
