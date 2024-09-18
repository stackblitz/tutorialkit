import type { ButtonTheme } from '@components/Buttons/Button/ButtonTheme';
import cn from 'classnames';
import type { FC, ReactNode } from 'react';
import styles from './Button.module.scss';

interface Props {
  children?: ReactNode;
  theme?: ButtonTheme;
  url: string;
}

export const Button: FC<Props> = ({ children, theme = 'default', url }) => (
  <a href={url} className={cn(styles.link, { [styles[theme]]: true })}>
    {children}
  </a>
);
