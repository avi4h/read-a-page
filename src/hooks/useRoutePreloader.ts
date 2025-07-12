import { useEffect } from 'react';

/**
 * Hook to preload route components for better performance
 */
export const useRoutePreloader = () => {
  useEffect(() => {
    // Preload critical route components after initial load
    const preloadRoutes = async () => {
      try {
        // Delay preloading to not interfere with initial load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Preload most commonly accessed routes
        await Promise.all([
          import('../components/CoversPage'),
          import('../components/SearchResultsPage'),
        ]);
      } catch (error) {
        console.warn('Route preloading failed:', error);
      }
    };

    preloadRoutes();
  }, []);
};

/**
 * Hook to preload a specific route component
 */
export const usePreloadRoute = (routeName: string, shouldPreload: boolean = true) => {
  useEffect(() => {
    if (!shouldPreload) return;

    const preloadRoute = async () => {
      try {
        switch (routeName) {
          case 'bookshelf':
            await import('../components/BookshelfPage');
            break;
          case 'search':
            await import('../components/SearchResultsPage');
            break;
          case 'covers':
            await import('../components/CoversPage');
            break;
          case 'about':
            await import('../components/AboutPage');
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn(`Failed to preload ${routeName} route:`, error);
      }
    };

    const timeoutId = setTimeout(preloadRoute, 1000);
    return () => clearTimeout(timeoutId);
  }, [routeName, shouldPreload]);
};
