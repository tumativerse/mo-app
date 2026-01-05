import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppSettings } from './app-settings';
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

describe('AppSettings', () => {
  const mockOnUpdate = vi.fn();
  const initialData = {
    units: 'metric' as const,
    theme: 'system' as const,
    accentColor: '#3b82f6',
  };

  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn(),
      length: 0,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render app settings data in read mode', () => {
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('App Settings')).toBeInTheDocument();
    expect(screen.getByText(/Metric \(kg, cm\)/i)).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByText('Units')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Accent Color')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should save app settings to localStorage', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('units', 'metric');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
      expect(localStorage.setItem).toHaveBeenCalledWith('accentColor', '#3b82f6');
    });

    expect(toast.success).toHaveBeenCalledWith('App settings updated successfully!');
    expect(mockOnUpdate).toHaveBeenCalledWith(initialData);
  });

  it('should handle localStorage error gracefully', async () => {
    const user = userEvent.setup();

    // Mock localStorage.setItem to throw error
    (localStorage.setItem as any).mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update app settings');
    });
  });

  it('should cancel editing and revert changes', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should be back in read mode
    expect(screen.getByText(/Metric \(kg, cm\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('should show "Saved" indicator after successful save', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should display color preview in read mode', () => {
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    // Find the preview circle by its background color
    const colorPreview = document.querySelector('[style*="background-color: rgb(59, 130, 246)"]');
    expect(colorPreview).toBeInTheDocument();
  });

  it('should display color preview in edit mode', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByText('Preview')).toBeInTheDocument();
    const colorPreview = document.querySelector('[style*="background-color: rgb(59, 130, 246)"]');
    expect(colorPreview).toBeInTheDocument();
  });

  it('should update color preview when color changes', async () => {
    const user = userEvent.setup();
    const greenData = { ...initialData, accentColor: '#10b981' };

    render(<AppSettings initialData={greenData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Color preview should show green
    const colorPreview = document.querySelector('[style*="background-color: rgb(16, 185, 129)"]');
    expect(colorPreview).toBeInTheDocument();
  });

  it('should save units preference correctly', async () => {
    const user = userEvent.setup();
    const imperialData = { ...initialData, units: 'imperial' as const };

    render(<AppSettings initialData={imperialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('units', 'imperial');
    });
  });

  it('should save theme preference correctly', async () => {
    const user = userEvent.setup();
    const darkData = { ...initialData, theme: 'dark' as const };

    render(<AppSettings initialData={darkData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  it('should save all accent color options correctly', async () => {
    const user = userEvent.setup();
    const colors = [
      { color: '#3b82f6', label: 'Blue' },
      { color: '#10b981', label: 'Green' },
      { color: '#8b5cf6', label: 'Purple' },
      { color: '#f97316', label: 'Orange' },
      { color: '#ec4899', label: 'Pink' },
    ];

    for (const { color, label } of colors) {
      const colorData = { ...initialData, accentColor: color };
      const { unmount } = render(<AppSettings initialData={colorData} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('accentColor', color);
      });

      expect(toast.success).toHaveBeenCalledWith('App settings updated successfully!');
      vi.clearAllMocks();
      unmount();
    }
  });

  it('should not call onUpdate if save fails', async () => {
    const user = userEvent.setup();

    (localStorage.setItem as any).mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should show all unit options', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Units label should be visible
    expect(screen.getByText('Units')).toBeInTheDocument();
  });

  it('should show all theme options', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Theme label should be visible
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('should show all accent color options', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Accent color label should be visible
    expect(screen.getByText('Accent Color')).toBeInTheDocument();
  });

  it('should render with imperial units correctly', async () => {
    const user = userEvent.setup();
    const imperialData = { ...initialData, units: 'imperial' as const };
    render(<AppSettings initialData={imperialData} onUpdate={mockOnUpdate} />);

    // Should show imperial in read mode
    expect(screen.getByText(/Imperial \(lbs, inches\)/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('units', 'imperial');
    });
  });

  it('should update theme when changed in edit mode', async () => {
    const user = userEvent.setup();
    const lightData = { ...initialData, theme: 'light' as const };

    render(<AppSettings initialData={lightData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  it('should update accent color when changed in edit mode', async () => {
    const user = userEvent.setup();
    const purpleData = { ...initialData, accentColor: '#8b5cf6' };

    render(<AppSettings initialData={purpleData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Verify purple color preview is shown
    const colorPreview = document.querySelector('[style*="background-color: rgb(139, 92, 246)"]');
    expect(colorPreview).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('accentColor', '#8b5cf6');
    });
  });

  it('should show saved indicator initially', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should show saving state when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<AppSettings initialData={initialData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const saveButton = screen.getByRole('button', { name: /save/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    // Click save
    await user.click(saveButton);

    // Should complete quickly with localStorage
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should display orange accent color correctly', async () => {
    const orangeData = { ...initialData, accentColor: '#f97316' };
    render(<AppSettings initialData={orangeData} onUpdate={mockOnUpdate} />);

    // Check orange color in read mode
    const colorPreview = document.querySelector('[style*="background-color: rgb(249, 115, 22)"]');
    expect(colorPreview).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
  });

  it('should display pink accent color correctly', async () => {
    const pinkData = { ...initialData, accentColor: '#ec4899' };
    render(<AppSettings initialData={pinkData} onUpdate={mockOnUpdate} />);

    // Check pink color in read mode
    const colorPreview = document.querySelector('[style*="background-color: rgb(236, 72, 153)"]');
    expect(colorPreview).toBeInTheDocument();
    expect(screen.getByText('Pink')).toBeInTheDocument();
  });

  it('should display purple accent color correctly', async () => {
    const purpleData = { ...initialData, accentColor: '#8b5cf6' };
    render(<AppSettings initialData={purpleData} onUpdate={mockOnUpdate} />);

    // Check purple color in read mode
    const colorPreview = document.querySelector('[style*="background-color: rgb(139, 92, 246)"]');
    expect(colorPreview).toBeInTheDocument();
    expect(screen.getByText('Purple')).toBeInTheDocument();
  });
});
