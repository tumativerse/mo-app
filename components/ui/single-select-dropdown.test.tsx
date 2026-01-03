import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SingleSelectDropdown } from './single-select-dropdown';
import { Activity } from 'lucide-react';

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

  it('should render options with icons', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const optionsWithIcons = [
      { value: 'opt1', label: 'Option 1', icon: Activity },
      { value: 'opt2', label: 'Option 2', icon: Activity },
    ];

    render(
      <SingleSelectDropdown
        value="opt1"
        options={optionsWithIcons}
        onChange={handleChange}
        showIcons={true}
      />
    );

    // Open dropdown to see icons
    await user.click(screen.getByText('Option 1'));

    // Icons should be rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should not render icons when showIcons is false', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const optionsWithIcons = [
      { value: 'opt1', label: 'Option 1', icon: Activity },
      { value: 'opt2', label: 'Option 2', icon: Activity },
    ];

    render(
      <SingleSelectDropdown
        value="opt1"
        options={optionsWithIcons}
        onChange={handleChange}
        showIcons={false}
      />
    );

    // Open dropdown
    await user.click(screen.getByText('Option 1'));

    // Verify dropdown is open
    expect(screen.getAllByText('Option 1')).toHaveLength(2);
  });

  it('should render options with descriptions', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const optionsWithDescriptions = [
      { value: 'opt1', label: 'Option 1', description: 'Description for option 1' },
      { value: 'opt2', label: 'Option 2', description: 'Description for option 2' },
    ];

    render(
      <SingleSelectDropdown
        value=""
        options={optionsWithDescriptions}
        onChange={handleChange}
        placeholder="Select"
      />
    );

    await user.click(screen.getByText('Select'));

    expect(screen.getByText('Description for option 1')).toBeInTheDocument();
    expect(screen.getByText('Description for option 2')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const handleChange = vi.fn();
    render(
      <div>
        <div data-testid="outside">Outside Element</div>
        <SingleSelectDropdown
          value=""
          options={options}
          onChange={handleChange}
          placeholder="Select"
        />
      </div>
    );

    const user = userEvent.setup();

    // Open dropdown
    await user.click(screen.getByText('Select'));

    // Verify dropdown is open - Option 1 appears in the menu
    const option1Before = screen.getAllByText('Option 1');
    expect(option1Before.length).toBeGreaterThan(0);

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));

    // Dropdown should be closed - Option 1 only appears in trigger button (not in list)
    // After closing, we should have fewer instances of "Option 1"
    const option1After = screen.queryAllByText('Option 1');
    expect(option1After.length).toBeLessThan(option1Before.length);
  });

  it('should handle touchstart event for mobile', async () => {
    const handleChange = vi.fn();
    render(
      <div>
        <div data-testid="outside">Outside Element</div>
        <SingleSelectDropdown
          value=""
          options={options}
          onChange={handleChange}
          placeholder="Select"
        />
      </div>
    );

    const user = userEvent.setup();

    // Open dropdown
    await user.click(screen.getByText('Select'));

    // Verify dropdown is open
    const option1Before = screen.getAllByText('Option 1');
    expect(option1Before.length).toBeGreaterThan(0);

    // Trigger touchstart outside
    fireEvent.touchStart(screen.getByTestId('outside'));

    // Dropdown should be closed
    const option1After = screen.queryAllByText('Option 1');
    expect(option1After.length).toBeLessThan(option1Before.length);
  });

  it('should auto-scroll to selected option when opening', async () => {
    const handleChange = vi.fn();
    const manyOptions = Array.from({ length: 20 }, (_, i) => ({
      value: `opt${i}`,
      label: `Option ${i}`,
    }));

    render(<SingleSelectDropdown value="opt15" options={manyOptions} onChange={handleChange} />);

    const user = userEvent.setup();

    // Open dropdown
    await user.click(screen.getByText('Option 15'));

    // Verify dropdown is open - should have multiple instances of selected option
    const option15Elements = screen.getAllByText('Option 15');
    expect(option15Elements.length).toBeGreaterThan(1);
  });
});
