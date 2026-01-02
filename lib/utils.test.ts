import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle conditional class names', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should filter out falsy values', () => {
    const result = cn('base-class', false && 'hidden', null, undefined, 'visible');
    expect(result).toBe('base-class visible');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('p-4', 'p-6');
    // twMerge should keep only the last conflicting class
    expect(result).toBe('p-6');
  });

  it('should handle array of classes', () => {
    const result = cn(['bg-blue-500', 'text-white']);
    expect(result).toBe('bg-blue-500 text-white');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle object notation', () => {
    const result = cn({
      'bg-red-500': true,
      'text-white': true,
      hidden: false,
    });
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should merge complex Tailwind utility conflicts', () => {
    const result = cn('px-4 py-2', 'px-6');
    // Should keep px-6 and py-2
    expect(result).toBe('py-2 px-6');
  });
});
