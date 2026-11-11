import { lazy, ComponentType } from 'react';

export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const component = await componentImport();
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
        return component;
      } catch (retryError) {
        if (!pageHasAlreadyBeenForceRefreshed) {
          window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
          window.location.reload();
        }
        throw retryError;
      }
    }
  });
}
