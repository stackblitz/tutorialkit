import { useStore } from '@nanostores/react';
import { themeStore, toggleTheme } from '@stores/theme-store';
import { memo, useEffect, useState } from 'react';

export const ThemeSwitch = memo(() => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    domLoaded && (
      <button
        className="flex items-center text-2xl text-tk-elements-topBar-link-iconColor hover:text-tk-elements-topBar-link-iconColorHover bg-tk-elements-topBar-link-backgroundColor hover:bg-tk-elements-topBar-link-backgroundColorHover p-1 rounded-md"
        title="Toggle Theme"
        onClick={() => toggleTheme()}
      >
        {<div className={theme === 'dark' ? 'i-ph-sun-dim-duotone' : 'i-ph-moon-stars-duotone'}></div>}
      </button>
    )
  );
});
