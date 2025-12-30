import { useEffect, useState } from 'react';

/**
 * Hook to enforce a minimum loading time for better UX
 * Shows loading animation for at least `minTime` milliseconds,
 * even if data loads faster
 *
 * @param minTime - Minimum time to show loading state (in milliseconds)
 * @returns isReady - True when both data is loaded AND minimum time has elapsed
 *
 * @example
 * const [data, setData] = useState(null);
 * const isReady = useMinimumLoadingTime(3000); // 3 second minimum
 *
 * useEffect(() => {
 *   async function fetchData() {
 *     const result = await fetch('/api/data');
 *     setData(result);
 *   }
 *   fetchData();
 * }, []);
 *
 * if (!isReady || !data) {
 *   return <LoadingAnimation />;
 * }
 */
export function useMinimumLoadingTime(minTime: number = 3000): boolean {
  const [startTime] = useState(() => Date.now());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minTime - elapsed);

    const timer = setTimeout(() => {
      setIsReady(true);
    }, remaining);

    return () => clearTimeout(timer);
  }, [startTime, minTime]);

  return isReady;
}
