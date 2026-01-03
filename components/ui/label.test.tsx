import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('should render with children', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should accept and apply className', () => {
    render(<Label className="custom-class">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('custom-class');
  });

  it('should support htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Input Label</Label>);
    const label = screen.getByText('Input Label');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('should pass through additional props', () => {
    render(<Label aria-label="Accessible label">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('aria-label', 'Accessible label');
  });
});
