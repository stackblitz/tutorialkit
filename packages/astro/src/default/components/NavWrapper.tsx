import { Nav } from '@tutorialkit/components-react';
import type { NavList, Lesson } from '@tutorialkit/types';

interface Props {
  lesson: Lesson;
  navList: NavList;
}

export function NavWrapper(props: Props) {
  return <Nav {...props} />;
}
