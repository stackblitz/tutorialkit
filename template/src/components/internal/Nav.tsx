import type { Lesson } from '@entities/tutorial';
import * as Accordion from '@radix-ui/react-accordion';
import navStyles from '@styles/nav.module.css';
import type { NavItem, NavList } from '@utils/nav';
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
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] h-[82px] gap-0.5 py-4 px-1 text-sm">
      <a
        className={classnames(
          'flex cursor-pointer h-full items-center justify-center w-[40px] text-tk-elements-breadcrumb-navButton-iconColor',
          !prev
            ? 'text-tk-elements-breadcrumb-navButton-iconColorDisabled'
            : 'hover:text-tk-elements-breadcrumb-navButton-iconColorHover',
        )}
        aria-disabled={!prev}
        href={prev?.href}
      >
        <span className="i-ph-arrow-left scale-120"></span>
      </a>
      <div className="relative">
        <div
          data-state={`${showDropdown ? 'open' : 'closed'}`}
          className={classnames(
            navStyles.NavContainer,
            'absolute z-1 left-0 transition-[background,box-shadow] duration-0 right-0 rounded-[8px] border overflow-hidden',
          )}
          ref={menuRef}
        >
          <button
            className={classnames(
              navStyles.ToggleButton,
              'flex-1 flex items-center text-left py-3 px-3 w-full overflow-hidden',
            )}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center gap-1 font-light truncate">
              <span>{currentLesson.part.title}</span>
              <span className={navStyles.Divider}>/</span>
              <span>{currentLesson.chapter.title}</span>
              <span className={navStyles.Divider}>/</span>
              <strong className="font-semibold">{currentLesson.data.title}</strong>
            </div>
            <div
              className={classnames(navStyles.ToggleButtonIcon, 'ml-auto w-[30px]', {
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
                className=" overflow-hidden bg-tk-elements-breadcrumb-dropdown-backgroundColor"
              >
                {renderParts(navList, currentLesson)}
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
      <a
        className={classnames(
          'flex cursor-pointer h-full items-center justify-center w-[40px] text-tk-elements-breadcrumb-navButton-iconColor',
          !next
            ? 'text-tk-elements-breadcrumb-navButton-iconColorDisabled'
            : 'hover:text-tk-elements-breadcrumb-navButton-iconColorHover',
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
    <ul className="py-5 pl-5 border-t border-tk-elements-breadcrumb-dropdown-borderColor overflow-auto max-h-[60dvh]">
      <Accordion.Root className="space-y-1.5" type="single" collapsible defaultValue={`part-${currentLesson.part.id}`}>
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
                      'font-semibold': isPartActive,
                    },
                  )}
                >
                  <span
                    className={`${navStyles.AccordionTriggerIcon} i-ph-caret-right-bold scale-80 text-tk-elements-breadcrumb-dropdown-accordionToggleIconColor`}
                  ></span>
                  <span className={navStyles.AccordionTriggerText}>{`Part ${partIndex + 1}: ${part.title}`}</span>
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
                  className={classnames(
                    navStyles.AccordionTrigger,
                    'flex items-center gap-1 w-full hover:text-primary-700',
                    {
                      'font-semibold': isChapterActive,
                    },
                  )}
                >
                  <span
                    className={`${navStyles.AccordionTriggerIcon} i-ph-caret-right-bold scale-80 text-gray-300`}
                  ></span>
                  <span className="text-tk-elements-breadcrumb-dropdown-accordionTextColor hover:text-tk-elements-breadcrumb-dropdown-accordionTextColorHover">
                    {chapter.title}
                  </span>
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
              className={classnames(
                'w-full inline-block border border-transparent pr-3 hover:text-tk-elements-breadcrumb-dropdown-textColorHover px-3 py-1 rounded-1',
                {
                  'bg-tk-elements-breadcrumb-dropdown-lessonBackgroundColor': !isActiveLesson,
                  'font-semibold bg-tk-elements-breadcrumb-dropdown-lessonBackgroundColorSelected': isActiveLesson,
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
