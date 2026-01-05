import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { animateNumber } from './animations';

describe('animations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('animateNumber', () => {
    it('should call callback with animated values', () => {
      const callback = vi.fn();
      const from = 0;
      const to = 100;
      const duration = 1; // 1 second

      // Start animation
      animateNumber(from, to, duration, callback);

      // Fast-forward time to middle of animation (500ms)
      vi.advanceTimersByTime(500);

      // Should have called callback at least once
      expect(callback).toHaveBeenCalled();

      // Fast-forward to end of animation (1000ms total)
      vi.advanceTimersByTime(500);

      // Should eventually call with final value
      expect(callback).toHaveBeenCalledWith(100);
    });

    it('should animate from higher to lower number', () => {
      const callback = vi.fn();
      const from = 100;
      const to = 0;
      const duration = 1;

      animateNumber(from, to, duration, callback);

      // Fast-forward to end
      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledWith(0);
    });

    it('should use default duration of 1 second when not specified', () => {
      const callback = vi.fn();
      const from = 0;
      const to = 50;

      // Call without duration parameter
      animateNumber(from, to, undefined, callback);

      // Fast-forward 1 second (default duration)
      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledWith(50);
    });

    it('should animate with custom duration', () => {
      const callback = vi.fn();
      const from = 0;
      const to = 100;
      const duration = 2; // 2 seconds

      animateNumber(from, to, duration, callback);

      // After 1 second (halfway), should not be at final value yet
      vi.advanceTimersByTime(1000);
      const halfwayCall = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(halfwayCall).toBeLessThan(100);

      // After 2 seconds (full duration), should be at final value
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledWith(100);
    });

    it('should round values passed to callback', () => {
      const callback = vi.fn();
      const from = 0;
      const to = 100;

      animateNumber(from, to, 1, callback);

      // Advance timers and check all calls are integers
      vi.advanceTimersByTime(1000);

      callback.mock.calls.forEach((call) => {
        const value = call[0];
        expect(Number.isInteger(value)).toBe(true);
      });
    });

    it('should handle same from and to values', () => {
      const callback = vi.fn();
      const from = 50;
      const to = 50;

      animateNumber(from, to, 1, callback);

      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledWith(50);
    });
  });
});
