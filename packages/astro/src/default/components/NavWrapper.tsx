import { Nav } from '@tutorialkit/components-react';
import type { Lesson, NavList } from '@tutorialkit/types';

interface Props {
  lesson: Lesson;
  navList: NavList;
}

export function NavWrapper(props: Props) {
  return <Nav {...props} />;
}
