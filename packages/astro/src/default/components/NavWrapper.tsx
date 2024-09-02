import { Nav } from '@tutorialkit/react';
import type { Lesson, NavList } from '@tutorialkit/types';

interface Props {
  lesson: Lesson;
  navList: NavList;
}

export function NavWrapper(props: Props) {
  return <Nav {...props} />;
}
