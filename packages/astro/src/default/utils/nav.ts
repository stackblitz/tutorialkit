import type { Tutorial, NavList, Part, Chapter } from '@tutorialkit/types';
import { joinPaths } from './url';

type NavItem = Required<Omit<NavList[number], 'href'>>;

export function generateNavigationList(tutorial: Tutorial, baseURL: string): NavList {
  const list: NavList = [];

  // caches for higher level items
  const chapterItems = new Map<Chapter['id'] | undefined, NavItem>();
  const partItems = new Map<Part['id'] | undefined, NavItem>();

  for (const lesson of tutorial.lessons) {
    const part = lesson.part && tutorial.parts[lesson.part.id];
    const chapter = lesson.chapter && part && part.chapters[lesson.chapter.id];

    let partItem = partItems.get(part?.id);
    let chapterItem = chapterItems.get(chapter?.id);

    if (part && !partItem) {
      partItem = {
        id: part.id,
        title: part.data.title,
        type: 'part',
        sections: [],
      };
      list.push(partItem);
      partItems.set(part.id, partItem);
    }

    if (chapter && !chapterItem) {
      if (!partItem) {
        throw new Error('Failed to resolve part');
      }

      chapterItem = {
        id: chapter.id,
        title: chapter.data.title,
        type: 'chapter',
        sections: [],
      };
      chapterItems.set(chapter.id, chapterItem);
      partItem.sections.push(chapterItem);
    }

    const slug = [part?.slug, chapter?.slug, lesson.slug].filter(Boolean).join('/');

    const lessonItem: NavList[number] = {
      id: lesson.id,
      title: lesson.data.title,
      type: 'lesson',
      href: joinPaths(baseURL, `/${slug}`),
    };

    if (chapterItem) {
      chapterItem.sections.push(lessonItem);
    } else if (partItem) {
      partItem.sections.push(lessonItem);
    } else {
      list.push(lessonItem);
    }
  }

  return list;
}
