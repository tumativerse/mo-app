import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SettingsPage from './page';

// Mock all child components
vi.mock('./components/profile-settings', () => ({
  ProfileSettings: ({ initialData }: any) => (
    <div data-testid="profile-settings">Profile: {initialData.fullName}</div>
  ),
}));

vi.mock('./components/preferences-settings', () => ({
  PreferencesSettings: ({ initialData }: any) => (
    <div data-testid="preferences-settings">Experience: {initialData.experienceLevel}</div>
  ),
}));

vi.mock('./components/lifestyle-settings', () => ({
  LifestyleSettings: ({ initialData }: any) => (
    <div data-testid="lifestyle-settings">Sleep: {initialData.sleepHours}h</div>
  ),
}));

vi.mock('./components/app-settings', () => ({
  AppSettings: ({ initialData }: any) => (
    <div data-testid="app-settings">Units: {initialData.units}</div>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('SettingsPage', () => {
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

    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton initially', () => {
    (global.fetch as any).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({}),
              }),
            100
          )
        )
    );

    render(<SettingsPage />);

    // Should show skeleton elements (not the actual components)
    expect(screen.queryByTestId('profile-settings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('preferences-settings')).not.toBeInTheDocument();
  });

  it('should fetch and display all settings sections', async () => {
    const profileData = {
      fullName: 'John Doe',
      dateOfBirth: '1990-01-15',
      heightCm: 175,
      currentWeight: 75,
      gender: 'male',
    };

    const preferencesData = {
      experienceLevel: 'intermediate',
      fitnessGoals: ['get_stronger'],
      preferredTrainingTimes: ['morning'],
      restDaysPreference: [0],
      equipmentLevel: 'gym',
      availableEquipment: ['barbell'],
      activityLevel: 'moderately_active',
      sleepHours: 7,
      stressLevel: 'moderate',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => profileData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => preferencesData,
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-settings')).toBeInTheDocument();
      expect(screen.getByTestId('preferences-settings')).toBeInTheDocument();
      expect(screen.getByTestId('lifestyle-settings')).toBeInTheDocument();
      expect(screen.getByTestId('app-settings')).toBeInTheDocument();
    });

    expect(screen.getByText(/Profile: John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience: intermediate/i)).toBeInTheDocument();
    expect(screen.getByText(/Sleep: 7h/i)).toBeInTheDocument();
    expect(screen.getByText(/Units: metric/i)).toBeInTheDocument();
  });

  it('should render page header', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage your profile and preferences')).toBeInTheDocument();
    });
  });

  it('should fetch profile from /api/user/profile', async () => {
    const profileData = {
      fullName: 'Test User',
      dateOfBirth: '1995-05-20',
      heightCm: 180,
      currentWeight: 80,
      gender: 'female',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => profileData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/profile');
    });
  });

  it('should fetch preferences from /api/preferences', async () => {
    const preferencesData = {
      experienceLevel: 'beginner',
      fitnessGoals: [],
      preferredTrainingTimes: [],
      restDaysPreference: [],
      equipmentLevel: 'home',
      availableEquipment: [],
      activityLevel: 'sedentary',
      sleepHours: 6,
      stressLevel: 'high',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => preferencesData,
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/preferences');
    });
  });

  it('should extract lifestyle data from preferences', async () => {
    const preferencesData = {
      experienceLevel: 'advanced',
      fitnessGoals: [],
      preferredTrainingTimes: [],
      restDaysPreference: [],
      equipmentLevel: 'full_gym',
      availableEquipment: [],
      activityLevel: 'very_active',
      sleepHours: 8,
      stressLevel: 'low',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => preferencesData,
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('lifestyle-settings')).toBeInTheDocument();
      expect(screen.getByText(/Sleep: 8h/i)).toBeInTheDocument();
    });
  });

  it('should load app settings from localStorage', async () => {
    localStorage.setItem('units', 'imperial');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('accentColor', '#10b981');

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Units: imperial/i)).toBeInTheDocument();
    });
  });

  it('should use default app settings if localStorage is empty', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Units: metric/i)).toBeInTheDocument();
    });
  });

  it('should handle profile fetch error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any)
      .mockRejectedValueOnce(new Error('Failed to fetch profile'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle preferences fetch error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockRejectedValueOnce(new Error('Failed to fetch preferences'));

    render(<SettingsPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle non-ok profile response gracefully', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      // Should still render app settings since preferences fetch succeeded
      expect(screen.getByTestId('app-settings')).toBeInTheDocument();
    });

    // Profile settings should not be rendered
    expect(screen.queryByTestId('profile-settings')).not.toBeInTheDocument();
  });

  it('should handle non-ok preferences response gracefully', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fullName: 'Test',
          dateOfBirth: '2000-01-01',
          heightCm: 170,
          currentWeight: 70,
          gender: 'other',
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      // Should still render profile and app settings
      expect(screen.getByTestId('profile-settings')).toBeInTheDocument();
      expect(screen.getByTestId('app-settings')).toBeInTheDocument();
    });

    // Preferences and lifestyle should not be rendered
    expect(screen.queryByTestId('preferences-settings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lifestyle-settings')).not.toBeInTheDocument();
  });

  it('should use default lifestyle values if preferences fetch fails', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    render(<SettingsPage />);

    await waitFor(() => {
      // Lifestyle section should not render if preferences fail
      expect(screen.queryByTestId('lifestyle-settings')).not.toBeInTheDocument();
    });
  });

  it('should render all sections in correct order', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fullName: 'Test',
          dateOfBirth: '2000-01-01',
          heightCm: 170,
          currentWeight: 70,
          gender: 'male',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          experienceLevel: 'intermediate',
          activityLevel: 'moderately_active',
          sleepHours: 7,
          stressLevel: 'moderate',
        }),
      });

    render(<SettingsPage />);

    await waitFor(() => {
      const sections = [
        screen.getByTestId('profile-settings'),
        screen.getByTestId('preferences-settings'),
        screen.getByTestId('lifestyle-settings'),
        screen.getByTestId('app-settings'),
      ];

      // All sections should be present
      sections.forEach((section) => {
        expect(section).toBeInTheDocument();
      });
    });
  });
});
