// FILE: src/lib/interactive-quiz-kit/utils/use-mobile.ts
// ================================================================================
// NEW FILE: A custom hook to detect if the app is running on a mobile-sized viewport.

'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Standard breakpoint for tablets

/**
 * A custom React hook that returns true if the current viewport width
 * is less than the mobile breakpoint (768px).
 * It is SSR-safe and updates on window resize.
 *
 * @returns {boolean} True if the viewport is considered mobile, false otherwise.
 */
export function useIsMobile(): boolean {
  // Initialize state to false to prevent SSR errors and hydration mismatch.
  // The actual value will be determined client-side in useEffect.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This code only runs on the client, where `window` is available.
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler to update state based on the media query match status.
    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    // Set the initial state on component mount.
    handleResize();

    // Add event listener for changes in viewport size.
    mediaQuery.addEventListener('change', handleResize);

    // Cleanup function to remove the event listener when the component unmounts.
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  return isMobile;
}