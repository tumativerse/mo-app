import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './date-picker';
import * as InlineScrollPickerModule from './inline-scroll-picker';

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

  it('should call onChange when year changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DatePicker value="2005-07-15" onChange={handleChange} />);

    // Click the year dropdown
    await user.click(screen.getAllByText('2005')[0]);

    // Select a different year
    await user.click(screen.getByText('2004'));

    expect(handleChange).toHaveBeenCalledWith('2004-07-15');
  });

  it('should handle string inputs from InlineScrollPicker', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    // Render with a value that will trigger string parsing
    render(<DatePicker value="2000-01-01" onChange={handleChange} />);

    // Change month - InlineScrollPicker may pass strings
    await user.click(screen.getByText('January'));
    await user.click(screen.getByText('February'));

    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle day change with string input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DatePicker value="2000-01-15" onChange={handleChange} />);

    // Click the day dropdown
    const dayButtons = screen.getAllByText('15');
    await user.click(dayButtons[0]);

    // Select a different day
    await user.click(screen.getByText('10'));

    expect(handleChange).toHaveBeenCalledWith('2000-01-10');
  });

  it('should handle onChange with string values', () => {
    // Mock InlineScrollPicker to pass strings instead of numbers
    const capturedHandlers: {
      year?: (value: number | string) => void;
      month?: (value: number | string) => void;
      day?: (value: number | string) => void;
    } = {};

    vi.spyOn(InlineScrollPickerModule, 'InlineScrollPicker').mockImplementation((props) => {
      // Capture the onChange handlers
      if (props.options && props.options[0]?.label?.includes('January')) {
        capturedHandlers.month = props.onChange;
      } else if (props.options && props.options.length > 50) {
        capturedHandlers.year = props.onChange;
      } else {
        capturedHandlers.day = props.onChange;
      }

      return <div>{props.value}</div>;
    });

    const handleChange = vi.fn();
    render(<DatePicker value="2000-07-15" onChange={handleChange} />);

    // Call handlers with string values to test string conversion branches
    if (capturedHandlers.year) {
      capturedHandlers.year('2005'); // Test year handler with string
    }

    if (capturedHandlers.month) {
      capturedHandlers.month('12'); // Test month handler with string
    }

    if (capturedHandlers.day) {
      capturedHandlers.day('25'); // Test day handler with string
    }

    // Verify all handlers were called (testing string conversion branches)
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls.length).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });
});
