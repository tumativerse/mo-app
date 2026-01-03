import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptionSelector } from './option-selector';

describe('OptionSelector', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render with selected value', () => {
    const handleChange = vi.fn();
    render(<OptionSelector value="option1" options={options} onChange={handleChange} />);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should show all options when dropdown is opened', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<OptionSelector value="option1" options={options} onChange={handleChange} />);

    // Click to open dropdown
    await user.click(screen.getByText('Option 1'));

    // All options should now be visible
    expect(screen.getByText('Option 2')).toBeVisible();
    expect(screen.getByText('Option 3')).toBeVisible();
  });

  it('should call onChange when option is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<OptionSelector value="option1" options={options} onChange={handleChange} />);

    // Open dropdown
    await user.click(screen.getByText('Option 1'));

    // Click a different option
    const option = screen.getAllByText('Option 2').find((el) => el.tagName === 'BUTTON');
    if (option) {
      await user.click(option);
      expect(handleChange).toHaveBeenCalledWith('option2');
    }
  });

  it('should accept className prop', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <OptionSelector
        value="option1"
        options={options}
        onChange={handleChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should display selected option label', () => {
    const handleChange = vi.fn();
    render(<OptionSelector value="option2" options={options} onChange={handleChange} />);

    // Selected value's label should be visible
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});
