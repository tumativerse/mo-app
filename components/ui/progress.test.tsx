import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  it('should render with default value', () => {
    render(<Progress />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('should accept and apply className', () => {
    render(<Progress className="custom-class" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('custom-class');
  });

  it('should render progress indicator', () => {
    const { container } = render(<Progress value={50} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toBeInTheDocument();
  });

  it('should handle 0 value in indicator transform', () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('should handle 100 value in indicator transform', () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('should pass through additional props', () => {
    render(<Progress aria-label="Loading progress" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-label', 'Loading progress');
  });
});
