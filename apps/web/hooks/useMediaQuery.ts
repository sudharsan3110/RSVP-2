/**
 * Custom hook that detects if a media query matches the current viewport
 * @param query - CSS media query string (e.g., '(max-width: 639px)', '(min-width: 768px)')
 * @returns Boolean indicating whether the media query matches
 */
import { useState, useEffect } from 'react';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export default useMediaQuery;
