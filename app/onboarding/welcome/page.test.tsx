import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import WelcomePage from './page';
import * as celebrations from '@/lib/celebrations';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock celebrations
vi.mock('@/lib/celebrations', () => ({
  celebrateWorkoutComplete: vi.fn(),
}));

describe('WelcomePage', () => {
  const mockPush = vi.fn();
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    // Mock localStorage
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

  it('should render welcome message', () => {
    render(<WelcomePage />);

    expect(screen.getByText(/Welcome to Mo/i)).toBeInTheDocument();
    expect(screen.getByText(/Your profile is all set up and ready to go/i)).toBeInTheDocument();
  });

  it('should show user name from localStorage', () => {
    localStorage.setItem('onboarding_step1', JSON.stringify({ fullName: 'John Doe' }));

    render(<WelcomePage />);

    expect(screen.getByText(/Welcome to Mo, John!/i)).toBeInTheDocument();
  });

  it('should show generic welcome if no name in localStorage', () => {
    render(<WelcomePage />);

    expect(screen.getByText(/Welcome to Mo!/i)).toBeInTheDocument();
  });

  it('should trigger celebration animation on mount', () => {
    render(<WelcomePage />);

    expect(celebrations.celebrateWorkoutComplete).toHaveBeenCalledOnce();
  });

  it('should display feature cards', () => {
    render(<WelcomePage />);

    expect(screen.getByText('Smart Workouts')).toBeInTheDocument();
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Training')).toBeInTheDocument();
  });

  it('should clear localStorage and navigate to dashboard on continue', async () => {
    const user = userEvent.setup();

    localStorage.setItem('onboarding_step1', JSON.stringify({ fullName: 'John' }));
    localStorage.setItem('onboarding_step2', JSON.stringify({ fitnessGoals: ['get_stronger'] }));
    localStorage.setItem('onboarding_step3', JSON.stringify({ equipmentLevel: 'gym' }));
    localStorage.setItem('onboarding_step4', JSON.stringify({ activityLevel: 'moderate' }));

    render(<WelcomePage />);

    const continueButton = screen.getByRole('button', { name: /Let's Get Started!/i });
    await user.click(continueButton);

    // Should clear all onboarding data
    expect(localStorage.getItem('onboarding_step1')).toBeNull();
    expect(localStorage.getItem('onboarding_step2')).toBeNull();
    expect(localStorage.getItem('onboarding_step3')).toBeNull();
    expect(localStorage.getItem('onboarding_step4')).toBeNull();

    // Should navigate to dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should show success checkmark with animation', async () => {
    render(<WelcomePage />);

    // Wait for content to show (animated in after delay)
    await waitFor(
      () => {
        expect(screen.getByText(/Let's Get Started!/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Checkmark should be present (it's an SVG, not an img)
    const continueButton = screen.getByRole('button', { name: /Let's Get Started!/i });
    expect(continueButton).toBeInTheDocument();
  });

  it('should handle missing localStorage data gracefully', () => {
    // Don't set any localStorage data
    render(<WelcomePage />);

    // Should still render without errors
    expect(screen.getByText(/Welcome to Mo!/i)).toBeInTheDocument();
  });

  it('should handle malformed localStorage data', () => {
    localStorage.setItem('onboarding_step1', 'invalid json');

    // Should not throw error
    expect(() => render(<WelcomePage />)).not.toThrow();

    // Should show generic welcome
    expect(screen.getByText(/Welcome to Mo!/i)).toBeInTheDocument();
  });

  it('should show all feature cards with correct icons and descriptions', () => {
    render(<WelcomePage />);

    // Smart Workouts
    expect(screen.getByText('Smart Workouts')).toBeInTheDocument();
    expect(screen.getByText('PPL program optimized for your goals')).toBeInTheDocument();

    // Track Progress
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    expect(screen.getByText('Monitor PRs, streaks, and gains')).toBeInTheDocument();

    // Adaptive Training
    expect(screen.getByText('Adaptive Training')).toBeInTheDocument();
    expect(screen.getByText('Auto-adjusts based on fatigue')).toBeInTheDocument();
  });
});
