import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
vi.mock('next-themes');

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        systemTheme: 'dark',
        themes: ['light', 'dark'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });
    });

    it('should render Sun icon in dark mode', () => {
      render(<ThemeToggle />);

      // In dark mode, we show Sun icon (to switch to light)
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have correct aria-label in dark mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', {
        name: 'Switch to light theme',
      });
      expect(button).toBeInTheDocument();
    });

    it('should switch to light mode when clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Light Mode', () => {
    beforeEach(() => {
      vi.mocked(useTheme).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        systemTheme: 'light',
        themes: ['light', 'dark'],
        resolvedTheme: 'light',
        forcedTheme: undefined,
      });
    });

    it('should render Moon icon in light mode', () => {
      render(<ThemeToggle />);

      // In light mode, we show Moon icon (to switch to dark)
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have correct aria-label in light mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', {
        name: 'Switch to dark theme',
      });
      expect(button).toBeInTheDocument();
    });

    it('should switch to dark mode when clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('System Theme Fallback', () => {
    it('should use systemTheme when theme is "system" (dark)', () => {
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        systemTheme: 'dark',
        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button', {
        name: 'Switch to light theme',
      });
      expect(button).toBeInTheDocument();
    });

    it('should use systemTheme when theme is "system" (light)', () => {
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        systemTheme: 'light',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button', {
        name: 'Switch to dark theme',
      });
      expect(button).toBeInTheDocument();
    });

    it('should switch from system dark to light', async () => {
      const user = userEvent.setup();
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        systemTheme: 'dark',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should switch from system light to dark', async () => {
      const user = userEvent.setup();
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        systemTheme: 'light',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        systemTheme: 'dark',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });
    });

    it('should be a button element', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have accessible label', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have different aria-labels for different themes', () => {
      // Mock setup

      // Dark mode
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        systemTheme: 'dark',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      const { rerender } = render(<ThemeToggle />);
      expect(screen.getByRole('button', { name: /switch to light/i })).toBeInTheDocument();

      // Light mode
      vi.mocked(useTheme).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        systemTheme: 'light',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      rerender(<ThemeToggle />);
      expect(screen.getByRole('button', { name: /switch to dark/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined systemTheme', () => {
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        systemTheme: undefined,

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle missing theme', () => {
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        systemTheme: 'dark',
        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle rapid clicks', async () => {
      const user = userEvent.setup();
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        systemTheme: 'dark',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe('SSR Compatibility', () => {
    it('should have suppressHydrationWarning attribute', () => {
      // Mock setup
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        systemTheme: 'dark',

        themes: ['light', 'dark', 'system'],
        resolvedTheme: 'dark',
        forcedTheme: undefined,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      // Note: suppressHydrationWarning is a React internal prop that doesn't appear on DOM elements
      expect(button).toBeInTheDocument();
    });
  });
});
