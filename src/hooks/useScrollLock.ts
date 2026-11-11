import { useCallback, useRef } from 'react';

export function useScrollLock() {
  const yRef = useRef(0);

  const lock = useCallback(() => {
    yRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${yRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }, []);

  const unlock = useCallback(() => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, yRef.current);
  }, []);

  return { lock, unlock };
}