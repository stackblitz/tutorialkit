import { useStore } from '@nanostores/react';
import { Button } from '@tutorialkit/react';
import { useEffect, useRef, useState } from 'react';
import { authStore } from '../stores/auth-store';
import { login, logout } from './webcontainer';

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

      /**
       * Re-enable the button in case the login failed because the popup got stuck in an error or
       * was closed before the authorization step was completed.
       */
      timeoutId.current = setTimeout(() => {
        setDisabled(false);
      }, 1000);

      login().then(() => {
        authStore.set({ status: 'authorized' });
      });
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
    <Button className="ml-2" variant={showLogin ? 'primary' : 'secondary'} disabled={disabled} onClick={onClick}>
      {showLogin ? 'Login' : 'Logout'}
    </Button>
  );
}
