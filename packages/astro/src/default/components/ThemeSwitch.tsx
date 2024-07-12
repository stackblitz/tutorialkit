import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeStore, toggleTheme } from '../stores/theme-store';

export const ThemeSwitch = memo(() => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    domLoaded && (
      <button
        className="flex items-center text-2xl text-tk-elements-topBar-iconButton-iconColor hover:text-tk-elements-topBar-iconButton-iconColorHover transition-theme bg-tk-elements-topBar-iconButton-backgroundColor hover:bg-tk-elements-topBar-iconButton-backgroundColorHover p-1 rounded-md"
        title="Toggle Theme"
        onClick={() => toggleTheme()}
      >
        <div className={theme === 'dark' ? 'i-ph-sun-dim-duotone' : 'i-ph-moon-stars-duotone'} />
      </button>
    )
  );
});
