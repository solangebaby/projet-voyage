import { useEffect } from 'react';

// Utility to scroll to top on page load
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' as ScrollBehavior,
  });
};

// Hook to use in components
export const useScrollToTop = () => {
  useEffect(() => {
    scrollToTop();
  }, []);
};
