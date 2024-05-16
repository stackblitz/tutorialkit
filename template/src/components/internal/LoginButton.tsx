import { useStore } from '@nanostores/react';
import { authStore } from '@stores/auth-store';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { logout, login } from '@app/webcontainer';

export function LoginButton() {
  // using any because @types/node are included in that context although they shouldn't
  const timeoutId = useRef<any>(0);
  const authStatus = useStore(authStore);

  // using an indirect state so that there's no hydratation errors
  const [showLogin, setShowLogin] = useState(true);
  const [disabled, setDisabled] = useState(false);

  function onClick() {
    if (showLogin) {
      setDisabled(true);
      clearTimeout(timeoutId.current);

      /*
       * Re-enable the button in case the login failed because the popup got stuck in an error or
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
    setShowLogin(authStatus.status !== 'authorized');

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
      className={classNames('flex font-500 disabled:opacity-32 items-center text-sm ml-2 px-4 py-1 rounded-md', {
        'bg-tk-elements-topBar-primaryButton-backgroundColor text-tk-elements-topBar-primaryButton-textColor':
          showLogin,
        'bg-tk-elements-topBar-secondaryButton-backgroundColor text-tk-elements-topBar-secondaryButton-textColor':
          !showLogin,
        'hover:bg-tk-elements-topBar-primaryButton-backgroundColorHover hover:text-tk-elements-topBar-primaryButton-textColorHover':
          !disabled && showLogin,
        'hover:bg-tk-elements-topBar-secondaryButton-backgroundColorHover hover:text-tk-elements-topBar-secondaryButton-textColorHover':
          !disabled && !showLogin,
      })}
      disabled={disabled}
      onClick={onClick}
    >
      {showLogin ? 'Login' : 'Logout'}
    </button>
  );
}
