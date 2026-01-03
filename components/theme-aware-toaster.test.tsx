import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemedToaster } from './theme-aware-toaster';
import { useTheme } from 'next-themes';

// Mock next-themes
vi.mock('next-themes');

// Mock Toaster component
vi.mock('sonner', () => ({
  Toaster: ({ theme, position }: { theme?: string; position?: string }) => (
    <div data-testid="toaster" data-theme={theme} data-position={position}>
      Toaster
    </div>
  ),
}));

describe('ThemedToaster', () => {
  it('should render Toaster with dark theme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      systemTheme: 'dark',
      themes: ['light', 'dark'],
      resolvedTheme: 'dark',
      forcedTheme: undefined,
    });

    const { getByTestId } = render(<ThemedToaster />);
    const toaster = getByTestId('toaster');

    expect(toaster).toHaveAttribute('data-theme', 'dark');
    expect(toaster).toHaveAttribute('data-position', 'bottom-right');
  });

  it('should render Toaster with light theme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
      forcedTheme: undefined,
    });

    const { getByTestId } = render(<ThemedToaster />);
    const toaster = getByTestId('toaster');

    expect(toaster).toHaveAttribute('data-theme', 'light');
    expect(toaster).toHaveAttribute('data-position', 'bottom-right');
  });

  it('should handle undefined theme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: undefined,
      setTheme: vi.fn(),
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
      forcedTheme: undefined,
    });

    const { getByTestId } = render(<ThemedToaster />);
    const toaster = getByTestId('toaster');

    expect(toaster).toBeInTheDocument();
  });
});
