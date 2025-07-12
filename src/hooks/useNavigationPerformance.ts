import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to monitor navigation performance
 */
export const useNavigationPerformance = () => {
  const location = useLocation();

  useEffect(() => {
    const startTime = performance.now();
    
    // Mark navigation start
    performance.mark('navigation-start');
    
    const timeoutId = setTimeout(() => {
      const endTime = performance.now();
      const navigationTime = endTime - startTime;
      
      // Mark navigation end
      performance.mark('navigation-end');
      
      // Measure navigation duration
      try {
        performance.measure('navigation-duration', 'navigation-start', 'navigation-end');
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
      
      // Log slow navigations in development
      if (process.env.NODE_ENV === 'development' && navigationTime > 100) {
        console.warn(`Slow navigation to ${location.pathname}: ${navigationTime.toFixed(2)}ms`);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

/**
 * Hook to optimize scroll restoration
 */
export const useScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change, but preserve position for certain routes
    const shouldPreserveScroll = location.state?.preserveScroll;
    
    if (!shouldPreserveScroll) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      });
    }
  }, [location.pathname, location.state]);
};
