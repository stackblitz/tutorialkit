export interface NavItem {
  id: string;
  title: string;
  type?: 'part' | 'chapter' | 'lesson';
  href?: string;
  sections?: NavItem[];
}

export type NavList = NavItem[];
