'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Dumbbell, Target, Zap } from 'lucide-react';
import { celebrateWorkoutComplete } from '@/lib/celebrations';

/**
 * Welcome Screen - Post-Onboarding Celebration
 *
 * Shown immediately after completing onboarding.
 * Celebrates the user's setup with confetti and a motivating message.
 */

export const dynamic = 'force-dynamic';

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger celebration on mount
    celebrateWorkoutComplete();

    // Get user name from onboarding data in localStorage
    const step1Data = localStorage.getItem('onboarding_step1');
    if (step1Data) {
      try {
        const data = JSON.parse(step1Data);
        setUserName(data.fullName?.split(' ')[0] || '');
      } catch (error) {
        console.error('Failed to parse onboarding data:', error);
      }
    }

    // Show content after brief delay for confetti to start
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // Clear onboarding data from localStorage
    localStorage.removeItem('onboarding_step1');
    localStorage.removeItem('onboarding_step2');
    localStorage.removeItem('onboarding_step3');
    localStorage.removeItem('onboarding_step4');

    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={showContent ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Success Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={showContent ? { scale: 1 } : {}}
          transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500/30 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Checkmark container */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <Check className="h-12 w-12 sm:h-16 sm:w-16 text-white" strokeWidth={3} />
            </div>

            {/* Sparkle decorations */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            {userName ? `Welcome to Mo, ${userName}!` : 'Welcome to Mo!'}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            Your profile is all set up and ready to go. Let's crush your fitness goals together! 💪
          </p>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4"
        >
          <FeatureCard
            icon={Dumbbell}
            title="Smart Workouts"
            description="PPL program optimized for your goals"
            delay={0.7}
          />
          <FeatureCard
            icon={Target}
            title="Track Progress"
            description="Monitor PRs, streaks, and gains"
            delay={0.8}
          />
          <FeatureCard
            icon={Zap}
            title="Adaptive Training"
            description="Auto-adjusts based on fatigue"
            delay={0.9}
          />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="min-h-[56px] px-8 text-base sm:text-lg font-semibold shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Let's Get Started!
          </Button>
        </motion.div>

        {/* Skip option */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          Ready to start your fitness journey
        </motion.p>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="p-4 sm:p-6 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300"
    >
      <motion.div
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3"
      >
        <Icon className="h-6 w-6 text-primary" />
      </motion.div>
      <h3 className="font-semibold text-sm sm:text-base mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
