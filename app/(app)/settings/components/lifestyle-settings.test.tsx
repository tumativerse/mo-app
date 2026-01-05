import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LifestyleSettings } from './lifestyle-settings';
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

describe('LifestyleSettings', () => {
  const mockOnUpdate = vi.fn();
  const initialData = {
    activityLevel: 'moderately_active' as const,
    sleepHours: 7,
    stressLevel: 'moderate' as const,
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render lifestyle data in read mode', () => {
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Lifestyle Factors')).toBeInTheDocument();
    expect(screen.getByText(/Moderately Active/i)).toBeInTheDocument();
    expect(screen.getByText('7 hours/night')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByText('Activity Level')).toBeInTheDocument();
    expect(screen.getByLabelText(/sleep hours per night/i)).toBeInTheDocument();
    expect(screen.getByText('Stress Level')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should validate sleep hours minimum', async () => {
    const user = userEvent.setup();
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);
    await user.clear(sleepInput);
    await user.type(sleepInput, '2');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Sleep hours must be between 3-12')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Please fix the errors before saving');
  });

  it('should validate sleep hours maximum', async () => {
    const user = userEvent.setup();
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);
    await user.clear(sleepInput);
    await user.type(sleepInput, '15');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Sleep hours must be between 3-12')).toBeInTheDocument();
  });

  it('should accept valid sleep hours (3-12)', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...initialData, sleepHours: 8 }),
    });

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);
    await user.clear(sleepInput);
    await user.type(sleepInput, '8');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Lifestyle settings updated successfully!');
    });
  });

  it('should save lifestyle changes successfully', async () => {
    const user = userEvent.setup();
    const updatedData = {
      ...initialData,
      activityLevel: 'very_active' as const,
      sleepHours: 8,
      stressLevel: 'low' as const,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedData,
    });

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);
    await user.clear(sleepInput);
    await user.type(sleepInput, '8');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/preferences',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Lifestyle settings updated successfully!');
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        activityLevel: updatedData.activityLevel,
        sleepHours: updatedData.sleepHours,
        stressLevel: updatedData.stressLevel,
      })
    );
  });

  it('should handle save error', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save lifestyle settings' }),
    });

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save lifestyle settings');
    });
  });

  it('should cancel editing and revert changes', async () => {
    const user = userEvent.setup();
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);
    await user.clear(sleepInput);
    await user.type(sleepInput, '10');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should be back in read mode with original data
    expect(screen.getByText('7 hours/night')).toBeInTheDocument();
    expect(screen.queryByLabelText(/sleep hours per night/i)).not.toBeInTheDocument();
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

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

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

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should disable buttons during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as any).mockReturnValueOnce(promise);

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const saveButton = screen.getByRole('button', { name: /save/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const savePromise = user.click(saveButton);

    // Buttons should be disabled immediately
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
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

  it('should show required field indicator for sleep hours', async () => {
    const user = userEvent.setup();
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it('should display activity level options correctly', () => {
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/Moderately Active \(3-5 days\/week\)/i)).toBeInTheDocument();
  });

  it('should accept half-hour sleep increments', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...initialData, sleepHours: 7.5 }),
    });

    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);
    await user.clear(sleepInput);
    await user.type(sleepInput, '7.5');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('should clear error when value is corrected', async () => {
    const user = userEvent.setup();
    render(<LifestyleSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const sleepInput = screen.getByLabelText(/sleep hours per night/i);

    // Enter invalid value
    await user.clear(sleepInput);
    await user.type(sleepInput, '2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Sleep hours must be between 3-12')).toBeInTheDocument();

    // Correct the value
    await user.clear(sleepInput);
    await user.type(sleepInput, '7');

    // Error should be cleared after clicking save with valid data
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => initialData,
    });

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.queryByText('Sleep hours must be between 3-12')).not.toBeInTheDocument();
    });
  });

  it('should save with different activity levels', async () => {
    const user = userEvent.setup();
    const dataWithHighActivity = {
      ...initialData,
      activityLevel: 'very_active' as const,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithHighActivity,
    });

    render(<LifestyleSettings initialData={dataWithHighActivity} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Lifestyle settings updated successfully!');
    });

    expect(mockOnUpdate).toHaveBeenCalledWith(dataWithHighActivity);
  });

  it('should save with different stress levels', async () => {
    const user = userEvent.setup();
    const dataWithHighStress = {
      ...initialData,
      stressLevel: 'high' as const,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithHighStress,
    });

    render(<LifestyleSettings initialData={dataWithHighStress} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Lifestyle settings updated successfully!');
    });

    expect(mockOnUpdate).toHaveBeenCalledWith(dataWithHighStress);
  });
});
