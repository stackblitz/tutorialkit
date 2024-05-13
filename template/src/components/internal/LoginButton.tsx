import { useStore } from '@nanostores/react';
import { authStatusStore } from '@stores/auth-store';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { logout, login } from '@app/webcontainer';

export function LoginButton() {
  // using any because @types/node are included in that context although they shouldn't
  const timeoutId = useRef<any>(0);
  const authStatus = useStore(authStatusStore);
  const [disabled, setDisabled] = useState(false);

  const showLogin = authStatus.status !== 'authorized';

  function onClick() {
    if (showLogin) {
      setDisabled(true);
      clearTimeout(timeoutId.current);

      /*
       * Clear timeout in case the login failed because the popup got stuck in an error or
       * was closed before the authorization step was completed.
       */
      timeoutId.current = setTimeout(() => {
        setDisabled(false);
      }, 1000);
      login();
    } else {
      logout();
    }
  }

  useEffect(() => {
    // if authentication failed we invite the user to try again
    setDisabled((disabled) => {
      if (disabled && authStatus.status === 'auth-failed') {
        return false;
      }
      return disabled;
    });
  }, [authStatus.status]);

  return (
    <button
      className={classNames(
        'flex font-500 disabled:opacity-50 border-1 items-center text-sm ml-2 px-4 py-1 rounded-md',
        {
          'bg-accent-600 border-accent-700 text-white': showLogin,
          'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700': !showLogin,
          'hover:bg-accent-500 hover:border-accent-600 active:bg-accent-400': !disabled && showLogin,
          'hover:bg-gray-100 active:bg-gray-200 hover:text-gray-800 hover:dark:bg-gray-700 hover:dark:text-gray-50 hover:dark:border-gray-600 active:dark:bg-gray-600':
            !disabled && !showLogin,
        },
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {showLogin ? 'Login' : 'Logout'}
    </button>
  );
}
