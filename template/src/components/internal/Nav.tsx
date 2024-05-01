import type { Lesson } from '@entities/tutorial';
import * as Accordion from '@radix-ui/react-accordion';
import navStyles from '@styles/nav.module.css';
import type { NavList } from '@utils/nav';
import classnames from 'classnames';
import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

const dropdownEasing = cubicBezier(0.4, 0, 0.2, 1);

interface Props {
  lesson: Lesson;
  navList: NavList;
}

export function Nav({ lesson: currentLesson, navList }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { prev, next } = currentLesson;

  const onOutsideClick = useCallback(() => {
    setShowDropdown(false);
  }, []);

  useOutsideClick(menuRef, onOutsideClick);

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] h-[82px] gap-0.5 py-4 px-1">
      <a
        className={classnames(
          'flex cursor-pointer h-full items-center justify-center w-[40px]',
          !prev ? 'opacity-15' : 'hover:text-primary-700',
        )}
        aria-disabled={!prev}
        href={prev?.href}
      >
        <span className="i-ph-arrow-left scale-120"></span>
      </a>
      <div className="relative">
        <div
          className={classnames(
            'absolute z-1 left-0 transition-[background,box-shadow] duration-200 right-0 rounded-[8px] border border-nav-borderColor hover:bg-nav-hoverBackground',
            {
              'bg-nav-background': !showDropdown,
              'bg-nav-hoverBackground nav-box-shadow': showDropdown,
            },
          )}
          ref={menuRef}
        >
          <button
            className="flex-1 flex items-center text-left py-3 px-3 w-full overflow-hidden"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center gap-1 text-sm font-light truncate">
              <span>{currentLesson.part.title}</span>
              <span className="text-gray-200">/</span>
              <span>{currentLesson.chapter.title}</span>
              <span className="text-gray-200">/</span>
              <strong className="text-primary-700 font-medium">{currentLesson.data.title}</strong>
            </div>
            <div
              className={classnames('ml-auto w-[30px]', {
                'i-ph-caret-up-bold': showDropdown,
                'i-ph-caret-down-bold': !showDropdown,
              })}
            ></div>
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.nav
                initial={{ height: 0, y: 0 }}
                animate={{ height: 'auto', y: 0 }}
                exit={{ height: 0, y: 0 }}
                transition={{ duration: 0.2, ease: dropdownEasing }}
                className=" overflow-hidden"
              >
                <ul className="py-5 pl-5 border-t border-gray-100 overflow-auto max-h-[60dvh]">
                  <Accordion.Root
                    className="space-y-1.5"
                    type="single"
                    collapsible
                    defaultValue={`part-${currentLesson.part.id}`}
                  >
                    {navList.map((part, partIndex) => {
                      const isPartActive = part.id === currentLesson.part.id;

                      return (
                        <li key={partIndex}>
                          <Accordion.Item value={`part-${part.id}`}>
                            <Accordion.Trigger
                              className={classnames(
                                navStyles.AccordionTrigger,
                                'flex items-center gap-1 w-full hover:text-primary-700',
                                {
                                  'font-medium': isPartActive,
                                },
                              )}
                            >
                              <span
                                className={`${navStyles.AccordionTriggerIcon} i-ph-caret-right-bold scale-80`}
                              ></span>
                              <span> {`Part ${partIndex + 1}: ${part.title}`}</span>
                            </Accordion.Trigger>
                            <Accordion.Content className={navStyles.AccordionContent}>
                              <ul className="pl-4.5 mt-1.5">
                                <Accordion.Root
                                  className="mb-1 space-y-1.5"
                                  type="single"
                                  collapsible
                                  defaultValue={`chapter-${currentLesson.chapter.id}`}
                                >
                                  {part.sections?.map((chapter, chapterIndex) => {
                                    const isChapterActive = isPartActive && currentLesson.chapter.id === chapter.id;

                                    return (
                                      <li key={chapterIndex} className="">
                                        <Accordion.Item value={`chapter-${chapter.id}`}>
                                          <Accordion.Trigger
                                            className={classnames(
                                              navStyles.AccordionTrigger,
                                              'flex items-center gap-1 w-full hover:text-primary-700',
                                              {
                                                'font-medium': isChapterActive,
                                              },
                                            )}
                                          >
                                            <span
                                              className={`${navStyles.AccordionTriggerIcon} i-ph-caret-right-bold scale-80`}
                                            ></span>
                                            <span>{chapter.title}</span>
                                          </Accordion.Trigger>
                                          <Accordion.Content className={navStyles.AccordionContent}>
                                            <ul className="pl-9 mt-1.5">
                                              {chapter.sections?.map((lesson, lessonIndex) => {
                                                const isActiveLesson =
                                                  isPartActive && isChapterActive && lesson.id === currentLesson.id;

                                                return (
                                                  <li key={lessonIndex} className="mr-3">
                                                    <a
                                                      className={classnames(
                                                        'w-full inline-block border border-transparent pr-3 hover:underline hover:text-primary-700 px-3 py-1 rounded-1',
                                                        {
                                                          'font-medium bg-nav-activeLesson': isActiveLesson,
                                                        },
                                                      )}
                                                      href={lesson.href}
                                                    >
                                                      {lesson.title}
                                                    </a>
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </Accordion.Content>
                                        </Accordion.Item>
                                      </li>
                                    );
                                  })}
                                </Accordion.Root>
                              </ul>
                            </Accordion.Content>
                          </Accordion.Item>
                        </li>
                      );
                    })}
                  </Accordion.Root>
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
      <a
        className={classnames(
          'flex cursor-pointer h-full items-center justify-center w-[40px]',
          !next ? 'opacity-15' : 'hover:text-primary-700',
        )}
        aria-disabled={!next}
        href={next?.href}
      >
        <span className="i-ph-arrow-right scale-120"></span>
      </a>
    </header>
  );
}

function useOutsideClick(ref: React.RefObject<HTMLDivElement>, onOutsideClick?: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick?.();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
