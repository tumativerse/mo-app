'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export const dynamic = 'force-dynamic';

const STEPS = [
  { number: 1, name: 'Profile', path: '/onboarding/step-1' },
  { number: 2, name: 'Training', path: '/onboarding/step-2' },
  { number: 3, name: 'Equipment', path: '/onboarding/step-3' },
  { number: 4, name: 'Lifestyle', path: '/onboarding/step-4' },
  { number: 5, name: 'Preferences', path: '/onboarding/step-5' },
];

interface OnboardingLayoutProps {
  children: ReactNode;
}

/**
 * Onboarding Layout
 *
 * Provides a consistent layout for the onboarding flow with:
 * - Step progress indicator
 * - Theme toggle always available
 * - Mobile-optimized layout
 */
export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();

  const currentStep = STEPS.findIndex((step) => pathname === step.path) + 1 || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome to Mo</h1>
            <p className="text-sm text-muted-foreground">
              Let's set up your fitness profile
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Step Progress Indicator */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all
                        ${
                          isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isCurrent
                            ? 'border-primary bg-background text-primary'
                            : 'border-border bg-background text-muted-foreground'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5" />
                      ) : (
                        <Circle className="h-3 w-3 sm:h-5 sm:w-5" />
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 hidden text-xs font-medium sm:block
                        ${
                          isCurrent
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      `}
                    >
                      {step.name}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`
                        h-0.5 w-6 sm:w-12 transition-all
                        ${
                          isCompleted
                            ? 'bg-primary'
                            : 'bg-border'
                        }
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Step Text */}
          <div className="mt-4 text-center sm:hidden">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="mx-auto max-w-2xl px-4 text-center text-sm text-muted-foreground">
          Your data is encrypted and secure. We'll never share your personal information.
        </div>
      </footer>
    </div>
  );
}
