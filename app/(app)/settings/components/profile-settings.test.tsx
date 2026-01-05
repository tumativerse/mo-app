import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileSettings } from './profile-settings';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ProfileSettings', () => {
  const mockOnUpdate = vi.fn();
  const initialData = {
    fullName: 'John Doe',
    dateOfBirth: '1990-01-15',
    heightCm: 175,
    currentWeight: 75,
    gender: 'male' as const,
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render profile data in read mode', () => {
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('175 cm')).toBeInTheDocument();
    expect(screen.getByText('75 kg')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height \(cm\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Please fix the errors before saving');
  });

  it('should validate height range', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const heightInput = screen.getByLabelText(/height \(cm\)/i);
    await user.clear(heightInput);
    await user.type(heightInput, '50');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Height must be between 100-250 cm')).toBeInTheDocument();
  });

  it('should validate weight range', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const weightInput = screen.getByLabelText(/weight \(kg\)/i);
    await user.clear(weightInput);
    await user.type(weightInput, '20');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Weight must be between 30-300 kg')).toBeInTheDocument();
  });

  it('should save profile changes successfully', async () => {
    const user = userEvent.setup();
    const updatedData = { ...initialData, fullName: 'Jane Doe' };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedData,
    });

    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/profile',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!');
    expect(mockOnUpdate).toHaveBeenCalledWith(updatedData);
  });

  it('should handle save error', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  it('should cancel editing and revert changes', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should be back in read mode with original data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  it('should show loading state during save', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => initialData,
              }),
            100
          )
        )
    );

    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
  });

  it('should show "Saved" indicator after successful save', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => initialData,
    });

    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should format date of birth correctly in read mode', () => {
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    // Should display formatted date (check that date is rendered somewhere)
    // The date might be formatted in various ways depending on locale
    const dateElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('1990') || false;
    });

    // Should have at least one element with the year
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should disable save button during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as any).mockReturnValueOnce(promise);

    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const saveButton = screen.getByRole('button', { name: /save/i });
    const savePromise = user.click(saveButton);

    // Button should be disabled immediately
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });

    // Resolve the fetch
    resolvePromise({
      ok: true,
      json: async () => initialData,
    });

    // Wait for save to complete
    await savePromise;

    // Button should be enabled again after save completes
    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
  });

  it('should show all required field indicators', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    // All fields should have asterisks
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it('should validate missing date of birth', async () => {
    const user = userEvent.setup();
    const dataWithoutDob = { ...initialData, dateOfBirth: '' };
    render(<ProfileSettings initialData={dataWithoutDob} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should validate height range with negative value', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const heightInput = screen.getByLabelText(/height \(cm\)/i);
    await user.clear(heightInput);
    await user.type(heightInput, '-10');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Height must be between 100-250 cm')).toBeInTheDocument();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should validate weight range with negative value', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const weightInput = screen.getByLabelText(/weight \(kg\)/i);
    await user.clear(weightInput);
    await user.type(weightInput, '-5');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Weight must be between 30-300 kg')).toBeInTheDocument();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
