import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './date-picker';

describe('DatePicker', () => {
  it('should render with default value', () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2000-07-15" onChange={handleChange} />);

    expect(screen.getByText('July')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
  });

  it('should call onChange when month changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DatePicker value="2000-07-15" onChange={handleChange} />);

    // Click the month dropdown
    await user.click(screen.getByText('July'));

    // Select a different month (August)
    await user.click(screen.getByText('August'));

    expect(handleChange).toHaveBeenCalledWith('2000-08-15');
  });

  it('should call onChange when day changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DatePicker value="2000-07-15" onChange={handleChange} />);

    // Click the day dropdown (showing "15")
    const dayButtons = screen.getAllByText('15');
    await user.click(dayButtons[0]); // Click the button showing current day

    // Select a different day
    await user.click(screen.getByText('20'));

    expect(handleChange).toHaveBeenCalledWith('2000-07-20');
  });

  it('should accept className prop', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <DatePicker value="2000-07-15" onChange={handleChange} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle empty value with defaults', () => {
    const handleChange = vi.fn();
    render(<DatePicker value="" onChange={handleChange} />);

    // Should use default: July 15, 2000
    expect(screen.getByText('July')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
  });

  it('should parse and format dates correctly', () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2005-12-25" onChange={handleChange} />);

    expect(screen.getByText('December')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('2005')).toBeInTheDocument();
  });
});
