export interface NavItem {
  id: string;
  title: string;
  href?: string;
  sections?: NavItem[];
}

export type NavList = NavItem[];
