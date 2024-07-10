import type { Lesson, NavItem, NavList } from '@tutorialkit/types';
import * as Accordion from '@radix-ui/react-accordion';
import navStyles from './styles/nav.module.css';
import { classNames } from './utils/classnames.js';
import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { useOutsideClick } from './hooks/useOutsideClick.js';
import { interpolateString } from './utils/interpolation.js';

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
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] h-[82px] gap-0.5 py-4 px-1 text-sm">
      <a
        className={classNames(
          'flex cursor-pointer h-full items-center justify-center w-[40px] text-tk-elements-breadcrumbs-navButton-iconColor',
          !prev ? 'opacity-32 pointer-events-none' : 'hover:text-tk-elements-breadcrumbs-navButton-iconColorHover',
        )}
        aria-disabled={!prev}
        href={prev?.href}
      >
        <span className="i-ph-arrow-left scale-120"></span>
      </a>
      <div className="relative">
        <div
          data-state={`${showDropdown ? 'open' : 'closed'}`}
          className={classNames(
            navStyles.NavContainer,
            'absolute z-1 left-0 transition-[background,box-shadow] duration-0 right-0 rounded-[8px] border overflow-hidden z-50',
          )}
          ref={menuRef}
        >
          <button
            className={classNames(
              navStyles.ToggleButton,
              'flex-1 flex items-center text-left py-3 px-3 w-full overflow-hidden',
            )}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center gap-1 font-light truncate">
              <span className="hidden sm:inline">{currentLesson.part.title}</span>
              <span className={classNames('hidden sm:inline', navStyles.Divider)}>/</span>
              <span className="hidden sm:inline">{currentLesson.chapter.title}</span>
              <span className={classNames('hidden sm:inline', navStyles.Divider)}>/</span>
              <strong className="font-semibold">{currentLesson.data.title}</strong>
            </div>
            <div
              className={classNames(navStyles.ToggleButtonIcon, 'ml-auto w-[30px]', {
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
                className=" overflow-hidden bg-tk-elements-breadcrumbs-dropdown-backgroundColor"
              >
                {renderParts(navList, currentLesson)}
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
      <a
        className={classNames(
          'flex cursor-pointer h-full items-center justify-center w-[40px] text-tk-elements-breadcrumbs-navButton-iconColor',
          !next ? 'opacity-32 pointer-events-none' : 'hover:text-tk-elements-breadcrumbs-navButton-iconColorHover',
        )}
        aria-disabled={!next}
        href={next?.href}
      >
        <span className="i-ph-arrow-right scale-120"></span>
      </a>
    </header>
  );
}

function renderParts(navList: NavList, currentLesson: Lesson) {
  return (
    <ul className="py-5 pl-5 border-t border-tk-elements-breadcrumbs-dropdown-borderColor overflow-auto max-h-[60dvh]">
      <Accordion.Root className="space-y-1.5" type="single" collapsible defaultValue={`part-${currentLesson.part.id}`}>
        {navList.map((part, partIndex) => {
          const isPartActive = part.id === currentLesson.part.id;

          return (
            <li key={partIndex}>
              <Accordion.Item value={`part-${part.id}`}>
                <Accordion.Trigger
                  className={classNames(
                    navStyles.AccordionTrigger,
                    'flex items-center gap-1 w-full hover:text-primary-700',
                    {
                      [`font-semibold ${navStyles.AccordionTriggerActive}`]: isPartActive,
                    },
                  )}
                >
                  <span className={`${navStyles.AccordionTriggerIcon} i-ph-caret-right-bold scale-80`}></span>
                  <span>
                    {interpolateString(currentLesson.i18n.partTemplate, {
                      index: partIndex + 1,
                      title: part.title,
                    })}
                  </span>
                </Accordion.Trigger>
                <Accordion.Content className={navStyles.AccordionContent}>
                  {renderChapters(currentLesson, part, isPartActive)}
                </Accordion.Content>
              </Accordion.Item>
            </li>
          );
        })}
      </Accordion.Root>
    </ul>
  );
}

function renderChapters(currentLesson: Lesson, part: NavItem, isPartActive: boolean) {
  return (
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
                  className={classNames(
                    navStyles.AccordionTrigger,
                    'flex items-center gap-1 w-full hover:text-primary-700',
                    {
                      [`font-semibold ${navStyles.AccordionTriggerActive}`]: isChapterActive,
                    },
                  )}
                >
                  <span
                    className={classNames(
                      navStyles.AccordionTriggerIcon,
                      'i-ph-caret-right-bold scale-80 text-gray-300',
                      {
                        [navStyles.AccordionTriggerActive]: isChapterActive,
                      },
                    )}
                  ></span>
                  <span>{chapter.title}</span>
                </Accordion.Trigger>
                <Accordion.Content className={navStyles.AccordionContent}>
                  {renderLessons(currentLesson, chapter, isPartActive, isChapterActive)}
                </Accordion.Content>
              </Accordion.Item>
            </li>
          );
        })}
      </Accordion.Root>
    </ul>
  );
}

function renderLessons(currentLesson: Lesson, chapter: NavItem, isPartActive: boolean, isChapterActive: boolean) {
  return (
    <ul className="pl-9 mt-1.5">
      {chapter.sections?.map((lesson, lessonIndex) => {
        const isActiveLesson = isPartActive && isChapterActive && lesson.id === currentLesson.id;

        return (
          <li key={lessonIndex} className="mr-3">
            <a
              className={classNames(
                'w-full inline-block border border-transparent pr-3 text-tk-elements-breadcrumbs-dropdown-lessonTextColor hover:text-tk-elements-breadcrumbs-dropdown-lessonTextColorHover px-3 py-1 rounded-1',
                {
                  'bg-tk-elements-breadcrumbs-dropdown-lessonBackgroundColor': !isActiveLesson,
                  'font-semibold text-tk-elements-breadcrumbs-dropdown-lessonTextColorSelected bg-tk-elements-breadcrumbs-dropdown-lessonBackgroundColorSelected':
                    isActiveLesson,
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
  );
}
