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
