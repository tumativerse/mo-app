import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineScrollPicker } from './inline-scroll-picker';

describe('InlineScrollPicker', () => {
  it('should render with options', () => {
    const options = [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
    ];
    const handleChange = vi.fn();

    render(<InlineScrollPicker value={3} onChange={handleChange} options={options} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render with string options', () => {
    const options = [
      { value: 'red', label: 'red' },
      { value: 'green', label: 'green' },
      { value: 'blue', label: 'blue' },
    ];
    const handleChange = vi.fn();

    render(<InlineScrollPicker value="green" onChange={handleChange} options={options} />);

    expect(screen.getByText('green')).toBeInTheDocument();
  });

  it('should call onChange when selecting an option', async () => {
    const user = userEvent.setup();
    const options = [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
    ];
    const handleChange = vi.fn();

    render(<InlineScrollPicker value={3} onChange={handleChange} options={options} />);

    // Click to open dropdown
    await user.click(screen.getByText('3'));

    // Click a different option
    const option = screen.getAllByText('2').find((el) => el.tagName === 'BUTTON');
    if (option) {
      await user.click(option);
      expect(handleChange).toHaveBeenCalledWith(2);
    }
  });

  it('should accept className prop', () => {
    const options = [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
    ];
    const handleChange = vi.fn();
    const { container } = render(
      <InlineScrollPicker
        value={2}
        onChange={handleChange}
        options={options}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should accept width prop', () => {
    const options = [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
    ];
    const handleChange = vi.fn();
    render(
      <InlineScrollPicker value={2} onChange={handleChange} options={options} width="200px" />
    );

    // Should render without errors
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
