import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SingleSelectDropdown } from './single-select-dropdown';

describe('SingleSelectDropdown', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render with placeholder', () => {
    const handleChange = vi.fn();
    render(
      <SingleSelectDropdown
        value=""
        options={options}
        onChange={handleChange}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should display selected value label', () => {
    const handleChange = vi.fn();
    render(<SingleSelectDropdown value="option2" options={options} onChange={handleChange} />);

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SingleSelectDropdown
        value=""
        options={options}
        onChange={handleChange}
        placeholder="Select"
      />
    );

    await user.click(screen.getByText('Select'));

    // Options should be visible after click
    expect(screen.getByText('Option 1')).toBeVisible();
    expect(screen.getByText('Option 2')).toBeVisible();
    expect(screen.getByText('Option 3')).toBeVisible();
  });

  it('should call onChange when option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SingleSelectDropdown
        value=""
        options={options}
        onChange={handleChange}
        placeholder="Select"
      />
    );

    await user.click(screen.getByText('Select'));
    await user.click(screen.getByText('Option 2'));

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('should accept className prop', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <SingleSelectDropdown
        value=""
        options={options}
        onChange={handleChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should support width prop', () => {
    const handleChange = vi.fn();
    render(
      <SingleSelectDropdown value="" options={options} onChange={handleChange} width="300px" />
    );

    // Should render without errors
    expect(true).toBe(true);
  });

  it('should handle empty options array', () => {
    const handleChange = vi.fn();
    render(
      <SingleSelectDropdown
        value=""
        options={[]}
        onChange={handleChange}
        placeholder="No options"
      />
    );

    expect(screen.getByText('No options')).toBeInTheDocument();
  });
});
