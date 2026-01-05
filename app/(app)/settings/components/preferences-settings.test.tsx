import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PreferencesSettings } from './preferences-settings';
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

describe('PreferencesSettings', () => {
  const mockOnUpdate = vi.fn();
  const initialData = {
    experienceLevel: 'intermediate' as const,
    fitnessGoals: ['get_stronger', 'build_muscle'],
    preferredTrainingTimes: ['morning', 'evening'],
    restDaysPreference: [0, 6],
    equipmentLevel: 'gym' as const,
    availableEquipment: ['barbell', 'dumbbells', 'bench'],
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render preferences data in read mode', () => {
    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Training Preferences')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText(/Get Stronger/i)).toBeInTheDocument();
    expect(screen.getByText(/Build Muscle/i)).toBeInTheDocument();
    expect(screen.getByText('Commercial Gym')).toBeInTheDocument();
  });

  it('should show "None selected" for empty arrays', () => {
    const emptyData = {
      ...initialData,
      fitnessGoals: [],
      preferredTrainingTimes: [],
      availableEquipment: [],
    };

    render(<PreferencesSettings initialData={emptyData} onUpdate={mockOnUpdate} />);

    const noneSelected = screen.getAllByText('None selected');
    expect(noneSelected.length).toBeGreaterThan(0);
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByText('Experience Level')).toBeInTheDocument();
    expect(screen.getByText('Fitness Goals')).toBeInTheDocument();
    expect(screen.getByText('Preferred Training Times')).toBeInTheDocument();
    expect(screen.getByText('Rest Days')).toBeInTheDocument();
    expect(screen.getByText('Equipment Access')).toBeInTheDocument();
    expect(screen.getByText('Available Equipment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should save preferences changes successfully', async () => {
    const user = userEvent.setup();
    const updatedData = { ...initialData, experienceLevel: 'advanced' as const };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedData,
    });

    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
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

    expect(toast.success).toHaveBeenCalledWith('Preferences updated successfully!');
    expect(mockOnUpdate).toHaveBeenCalledWith(updatedData);
  });

  it('should handle save error', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save preferences' }),
    });

    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save preferences');
    });
  });

  it('should cancel editing and revert changes', async () => {
    const user = userEvent.setup();
    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should be back in read mode
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
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

    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

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

    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

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

    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

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

  it('should display rest days correctly', () => {
    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/Sunday/i)).toBeInTheDocument();
    expect(screen.getByText(/Saturday/i)).toBeInTheDocument();
  });

  it('should display all selected fitness goals', () => {
    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/Get Stronger, Build Muscle/i)).toBeInTheDocument();
  });

  it('should display all selected equipment', () => {
    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/Barbell, Dumbbells, Bench/i)).toBeInTheDocument();
  });

  it('should handle network error gracefully', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<PreferencesSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should save beginner preferences correctly', async () => {
    const user = userEvent.setup();
    const beginnerData = {
      ...initialData,
      experienceLevel: 'beginner' as const,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => beginnerData,
    });

    render(<PreferencesSettings initialData={beginnerData} onUpdate={mockOnUpdate} />);

    // Should display "Beginner" in read mode
    expect(screen.getByText('Beginner')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Preferences updated successfully!');
    });
  });
});
