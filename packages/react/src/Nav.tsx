import * as Accordion from '@radix-ui/react-accordion';
import { interpolateString, type Lesson, type NavItem, type NavList } from '@tutorialkit/types';
import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useOutsideClick } from './hooks/useOutsideClick.js';
import navStyles from './styles/nav.module.css';
import { classNames } from './utils/classnames.js';

const dropdownEasing = cubicBezier(0.4, 0, 0.2, 1);

interface Props {
  lesson: Lesson;
  navList: NavList;
}

interface NavListItemProps {
  level: number;
  activeItems: NavItem['id'][];
  index: number;
  i18n: Lesson['data']['i18n'];
}

export function Nav({ lesson: currentLesson, navList }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { prev, next } = currentLesson;

  const activeItems = [
    currentLesson.part?.id || currentLesson.id,
    currentLesson.chapter?.id || currentLesson.id,
    currentLesson.id,
  ];

  useOutsideClick(menuRef, () => setShowDropdown(false));

  return (
    <header className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)_auto] h-[82px] gap-0.5 py-4 px-1 text-sm">
      <a
        className={classNames(
          'hidden sm:flex cursor-pointer h-full items-center justify-center w-[40px] text-tk-elements-breadcrumbs-navButton-iconColor',
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
            'absolute mx-4 sm:mx-0 z-1 left-0 right-0 rounded-[8px] border overflow-hidden z-50',
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
              {currentLesson.part && (
                <>
                  <span className="hidden sm:inline">{currentLesson.part.title}</span>
                  <span className={classNames('hidden sm:inline', navStyles.Divider)}>/</span>
                </>
              )}
              {currentLesson.chapter && (
                <>
                  <span className="hidden sm:inline">{currentLesson.chapter.title}</span>
                  <span className={classNames('hidden sm:inline', navStyles.Divider)}>/</span>
                </>
              )}
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
                className=" overflow-hidden transition-theme bg-tk-elements-breadcrumbs-dropdown-backgroundColor"
              >
                <NavListComponent
                  className="py-5 pl-5 border-t border-tk-elements-breadcrumbs-dropdown-borderColor overflow-auto max-h-[60dvh]"
                  items={navList}
                  activeItems={activeItems}
                  i18n={currentLesson.data.i18n}
                  level={0}
                />
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
      <a
        className={classNames(
          'hidden sm:flex cursor-pointer h-full items-center justify-center w-[40px] text-tk-elements-breadcrumbs-navButton-iconColor',
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

function NavListComponent({
  items,
  level,
  activeItems,
  className,
  i18n,
}: Omit<NavListItemProps, 'index'> & { items: NavList; className?: string }) {
  return (
    <Accordion.Root asChild collapsible type="single" defaultValue={`${level}-${activeItems[level]}`}>
      <ul className={classNames(className)}>
        {items.map((item, index) => (
          <NavListItem key={item.id} {...item} index={index} level={level} activeItems={activeItems} i18n={i18n} />
        ))}
      </ul>
    </Accordion.Root>
  );
}

function NavListItem({ level, type, index, i18n, activeItems, id, title, href, sections }: NavItem & NavListItemProps) {
  const isActive = activeItems[level] === id;

  if (!sections) {
    return (
      <li className="mr-3 pl-4.5">
        <a
          className={classNames(
            'w-full inline-block border border-transparent pr-3 transition-theme text-tk-elements-breadcrumbs-dropdown-lessonTextColor hover:text-tk-elements-breadcrumbs-dropdown-lessonTextColorHover px-3 py-1 rounded-1',
            isActive
              ? 'font-semibold text-tk-elements-breadcrumbs-dropdown-lessonTextColorSelected bg-tk-elements-breadcrumbs-dropdown-lessonBackgroundColorSelected'
              : 'bg-tk-elements-breadcrumbs-dropdown-lessonBackgroundColor',
          )}
          href={href}
        >
          {title}
        </a>
      </li>
    );
  }

  return (
    <Accordion.Item asChild value={`${level}-${id}`}>
      <li className="mt-1.5">
        <Accordion.Trigger
          className={classNames(navStyles.AccordionTrigger, 'flex items-center gap-1 w-full hover:text-primary-700', {
            [`font-semibold ${navStyles.AccordionTriggerActive}`]: isActive,
          })}
        >
          <span className={`${navStyles.AccordionTriggerIcon} i-ph-caret-right-bold scale-80 text-gray-300`}></span>
          <span>{type === 'part' ? interpolateString(i18n!.partTemplate!, { index: index + 1, title }) : title}</span>
        </Accordion.Trigger>

        <Accordion.Content className={navStyles.AccordionContent}>
          <NavListComponent
            className="mt-1.5 pl-4.5"
            items={sections}
            activeItems={activeItems}
            i18n={i18n}
            level={level + 1}
          />
        </Accordion.Content>
      </li>
    </Accordion.Item>
  );
}
