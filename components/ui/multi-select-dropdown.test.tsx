import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectDropdown } from './multi-select-dropdown';

describe('MultiSelectDropdown', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1', description: 'First option' },
    { value: 'option2', label: 'Option 2', description: 'Second option' },
    { value: 'option3', label: 'Option 3' }, // No description
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with placeholder when no selections', () => {
      render(
        <MultiSelectDropdown
          value={[]}
          options={mockOptions}
          onChange={mockOnChange}
          placeholder="Select options"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Select options');
    });

    it('should show count when items are selected', () => {
      render(
        <MultiSelectDropdown
          value={['option1', 'option2']}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('2 selected');
    });

    it('should show "All selected" when all items are selected', () => {
      render(
        <MultiSelectDropdown
          value={['option1', 'option2', 'option3']}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('All selected');
    });

    it('should show labels when showCount is false', () => {
      render(
        <MultiSelectDropdown
          value={['option1', 'option2']}
          options={mockOptions}
          onChange={mockOnChange}
          showCount={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Option 1, Option 2');
    });

    it('should show placeholder when showCount is false and no selections', () => {
      render(
        <MultiSelectDropdown
          value={[]}
          options={mockOptions}
          onChange={mockOnChange}
          showCount={false}
          placeholder="Choose options"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Choose options');
    });

    it('should not show dropdown menu initially', () => {
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      expect(screen.queryByText('First option')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // All options should be visible
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should close dropdown when trigger is clicked again', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');

      // Open
      await user.click(button);
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      // Close
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });

    it('should add item to selection when clicked', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });

    it('should remove item from selection when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelectDropdown
          value={['option1', 'option2']}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(mockOnChange).toHaveBeenCalledWith(['option2']);
    });

    it('should allow multiple selections in one session', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Click Option 1
      const buttons = screen.getAllByRole('button');
      const option1Button = buttons[1]; // First option button (trigger is buttons[0])
      await user.click(option1Button);

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);

      // Click Option 2 (dropdown should still be open)
      const option2Button = buttons[2]; // Second option button
      await user.click(option2Button);

      expect(mockOnChange).toHaveBeenCalledWith(['option2']);
    });

    it('should keep dropdown open after selecting an option', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      // Dropdown should still be open
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open dropdown
      const triggerButton = screen.getAllByRole('button')[0];
      fireEvent.click(triggerButton);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Click outside
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should show checkmark for selected items', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelectDropdown value={['option1']} options={mockOptions} onChange={mockOnChange} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Check icon should be present for selected option
      const optionButtons = screen.getAllByRole('button');
      const option1Button = optionButtons[1]; // First option (trigger is 0)

      const checkIcon = option1Button.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show description when provided', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('First option')).toBeInTheDocument();
      expect(screen.getByText('Second option')).toBeInTheDocument();
    });

    it('should not show description when not provided', async () => {
      const user = userEvent.setup();
      const optionsWithoutDesc = [{ value: 'a', label: 'Alpha' }];

      render(
        <MultiSelectDropdown value={[]} options={optionsWithoutDesc} onChange={mockOnChange} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Only label should be visible, no description
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      const optionButton = screen.getAllByRole('button')[1];
      const descriptionDiv = optionButton.querySelector('.text-xs');
      expect(descriptionDiv).not.toBeInTheDocument();
    });

    it('should rotate chevron icon when dropdown is open', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      const chevronSvg = button.querySelector('svg');

      expect(chevronSvg).not.toHaveClass('rotate-180');

      await user.click(button);

      expect(chevronSvg).toHaveClass('rotate-180');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value array', () => {
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Select options');
    });

    it('should handle undefined value (defaults to empty array)', () => {
      render(
        <MultiSelectDropdown
          value={undefined as unknown as string[]}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      render(<MultiSelectDropdown value={[]} options={[]} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <MultiSelectDropdown
          value={[]}
          options={mockOptions}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const dropdown = container.querySelector('.custom-class');
      expect(dropdown).toBeInTheDocument();
    });

    it('should apply custom maxHeight', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MultiSelectDropdown
          value={[]}
          options={mockOptions}
          onChange={mockOnChange}
          maxHeight="max-h-40"
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const menu = container.querySelector('.max-h-40');
      expect(menu).toBeInTheDocument();
    });
  });

  describe('Display Text Logic', () => {
    it('should show placeholder when no selections', () => {
      render(
        <MultiSelectDropdown
          value={[]}
          options={mockOptions}
          onChange={mockOnChange}
          placeholder="Choose items"
        />
      );

      expect(screen.getByText('Choose items')).toBeInTheDocument();
    });

    it('should show count by default', () => {
      render(
        <MultiSelectDropdown value={['option1']} options={mockOptions} onChange={mockOnChange} />
      );

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('should show all labels when showCount is false', () => {
      render(
        <MultiSelectDropdown
          value={['option1', 'option3']}
          options={mockOptions}
          onChange={mockOnChange}
          showCount={false}
        />
      );

      expect(screen.getByText('Option 1, Option 3')).toBeInTheDocument();
    });

    it('should show "All selected" when all options are selected', () => {
      render(
        <MultiSelectDropdown
          value={['option1', 'option2', 'option3']}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('All selected')).toBeInTheDocument();
    });

    it('should show placeholder when value has IDs not in options', () => {
      // Edge case: value contains IDs that don't exist in options
      // This triggers the selectedLabels || placeholder fallback (line 83)
      render(
        <MultiSelectDropdown
          value={['nonexistent1', 'nonexistent2']}
          options={mockOptions}
          onChange={mockOnChange}
          showCount={false}
          placeholder="Choose items"
        />
      );

      // Should fall back to placeholder since no labels match
      expect(screen.getByText('Choose items')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct button types', async () => {
      const user = userEvent.setup();
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');

      await user.click(button);

      const allButtons = screen.getAllByRole('button');
      allButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('type', 'button');
      });
    });

    it('should have focus styles', () => {
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:border-primary');
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should maintain selected state when reopening', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelectDropdown
          value={['option1', 'option2']}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole('button');

      // Open
      await user.click(button);
      let optionButtons = screen.getAllByRole('button');
      expect(optionButtons[1].querySelector('svg')).toBeInTheDocument();
      expect(optionButtons[2].querySelector('svg')).toBeInTheDocument();

      // Close
      await user.click(button);

      // Reopen
      await user.click(button);
      optionButtons = screen.getAllByRole('button');
      expect(optionButtons[1].querySelector('svg')).toBeInTheDocument();
      expect(optionButtons[2].querySelector('svg')).toBeInTheDocument();
    });

    it('should have touch-manipulation class for mobile', () => {
      render(<MultiSelectDropdown value={[]} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-manipulation');
    });
  });
});
