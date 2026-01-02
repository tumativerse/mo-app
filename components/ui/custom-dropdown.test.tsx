import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomDropdown } from './custom-dropdown';

describe('CustomDropdown', () => {
  const mockOptions = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with selected value', () => {
      render(<CustomDropdown value={2} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Option 2');
    });

    it('should render with placeholder when no value selected', () => {
      render(
        <CustomDropdown
          value=""
          options={mockOptions}
          onChange={mockOnChange}
          placeholder="Choose an option"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Choose an option');
    });

    it('should not show dropdown menu initially', () => {
      render(<CustomDropdown value={2} options={mockOptions} onChange={mockOnChange} />);

      // Only the trigger button should be visible, not the dropdown menu
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1); // Only trigger button, no option buttons
    });
  });

  describe('User Interactions', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={2} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // After opening, should have 4 buttons: 1 trigger + 3 option buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('should close dropdown when clicked again', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');

      // Open dropdown
      await user.click(button);
      expect(screen.getByText('Option 2')).toBeInTheDocument();

      // Close dropdown
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });

    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Select option 3
      const option3 = screen.getByText('Option 3');
      await user.click(option3);

      expect(mockOnChange).toHaveBeenCalledWith(3);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after selecting an option', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Select option
      const option2 = screen.getByText('Option 2');
      await user.click(option2);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open dropdown
      const triggerButton = screen.getAllByRole('button')[0];
      fireEvent.click(triggerButton);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      // Click outside
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should highlight selected option', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={2} options={mockOptions} onChange={mockOnChange} />);

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Find all option buttons
      const optionButtons = screen.getAllByRole('button');

      // First button is the trigger, rest are options
      const option1Button = optionButtons[1];
      const option2Button = optionButtons[2];
      const option3Button = optionButtons[3];

      // Option 2 should have highlighted styles
      expect(option2Button).toHaveClass('bg-primary/10');
      expect(option2Button).toHaveClass('font-medium');

      // Others should not
      expect(option1Button).not.toHaveClass('bg-primary/10');
      expect(option3Button).not.toHaveClass('bg-primary/10');
    });

    it('should rotate chevron icon when dropdown is open', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      const chevronSvg = button.querySelector('svg');

      // Initially not rotated
      expect(chevronSvg).not.toHaveClass('rotate-180');

      // Open dropdown
      await user.click(button);

      // Should be rotated
      expect(chevronSvg).toHaveClass('rotate-180');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<CustomDropdown value="" options={[]} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle string values', async () => {
      const user = userEvent.setup();
      const stringOptions = [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ];

      render(<CustomDropdown value="a" options={stringOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const betaOption = screen.getByText('Beta');
      await user.click(betaOption);

      expect(mockOnChange).toHaveBeenCalledWith('b');
    });

    it('should handle number values', async () => {
      const user = userEvent.setup();

      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const option2 = screen.getByText('Option 2');
      await user.click(option2);

      expect(mockOnChange).toHaveBeenCalledWith(2);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CustomDropdown
          value={1}
          options={mockOptions}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const dropdown = container.querySelector('.custom-class');
      expect(dropdown).toBeInTheDocument();
    });

    it('should apply custom width', () => {
      const { container } = render(
        <CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} width="200px" />
      );

      const dropdown = container.querySelector('[style*="width: 200px"]');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct button type', () => {
      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have focus styles', () => {
      render(<CustomDropdown value={1} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:border-primary');
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should maintain selected value when reopening', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown value={2} options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');

      // Open
      await user.click(button);
      const optionButtons = screen.getAllByRole('button');
      expect(optionButtons[2]).toHaveClass('bg-primary/10');

      // Close
      await user.click(button);

      // Reopen
      await user.click(button);
      const reopenedButtons = screen.getAllByRole('button');
      expect(reopenedButtons[2]).toHaveClass('bg-primary/10');
    });
  });
});
