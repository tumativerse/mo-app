import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('should render correctly', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should accept and apply className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render as a div by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('should pass through additional props', () => {
    const { container } = render(<Skeleton role="status" aria-label="Loading" />);
    expect(container.firstChild).toHaveAttribute('role', 'status');
    expect(container.firstChild).toHaveAttribute('aria-label', 'Loading');
  });
});
