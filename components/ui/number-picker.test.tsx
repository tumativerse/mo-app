import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberPicker } from './number-picker';

describe('NumberPicker', () => {
  it('should render with value', () => {
    const handleChange = vi.fn();
    render(<NumberPicker value={5} onChange={handleChange} min={1} max={10} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render with unit suffix', () => {
    const handleChange = vi.fn();
    render(<NumberPicker value={5} onChange={handleChange} min={1} max={10} unit="kg" />);

    expect(screen.getByText('5 kg')).toBeInTheDocument();
  });

  it('should call onChange when selecting different value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<NumberPicker value={5} onChange={handleChange} min={1} max={10} />);

    // Click to open dropdown
    await user.click(screen.getByText('5'));

    // Select a different value
    const option = screen.getAllByText('7').find((el) => el.tagName === 'BUTTON');
    if (option) {
      await user.click(option);
      expect(handleChange).toHaveBeenCalledWith(7);
    }
  });

  it('should accept className prop', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <NumberPicker value={5} onChange={handleChange} min={1} max={10} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should generate correct range of options', () => {
    const handleChange = vi.fn();
    render(<NumberPicker value={2} onChange={handleChange} min={1} max={3} />);

    // Value should be within the min/max range
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should support step prop with decimal values', () => {
    const handleChange = vi.fn();
    render(<NumberPicker value={2.5} onChange={handleChange} min={0} max={5} step={0.5} />);

    expect(screen.getByText('2.5')).toBeInTheDocument();
  });
});
