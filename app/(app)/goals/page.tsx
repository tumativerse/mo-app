'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Target, Calendar, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CreateGoalModal } from './components/create-goal-modal';
import { MeasurementLogger } from './components/measurement-logger';
import type { Goal, GoalProgress } from '@/lib/mo-journey';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function GoalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMeasurementLogger, setShowMeasurementLogger] = useState(false);

  useEffect(() => {
    fetchGoalAndProgress();
  }, []);

  const fetchGoalAndProgress = async () => {
    setIsLoading(true);
    try {
      // Fetch active goal
      const goalResponse = await fetch('/api/journey/goals');
      if (!goalResponse.ok) throw new Error('Failed to fetch goal');
      const goalData = await goalResponse.json();

      if (goalData.goal) {
        setGoal(goalData.goal);

        // Fetch progress
        const progressResponse = await fetch(`/api/journey/goals/${goalData.goal.id}/progress`);
        if (!progressResponse.ok) throw new Error('Failed to fetch progress');
        const progressData = await progressResponse.json();
        setProgress(progressData.progress);
      } else {
        setGoal(null);
        setProgress(null);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
      toast.error('Failed to load goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalCreated = () => {
    setShowCreateModal(false);
    fetchGoalAndProgress();
    toast.success('Goal created successfully!');
  };

  const handleMeasurementLogged = () => {
    setShowMeasurementLogger(false);
    fetchGoalAndProgress();
    toast.success('Measurement logged!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-4 sm:space-y-6 pb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={pageTransition}
          className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
        >
          <Target className="h-20 w-20 sm:h-24 sm:w-24 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              No Active Goal
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
              Set a goal to start tracking your fitness journey. We'll help you stay on track with
              progress updates and recommendations.
            </p>
          </div>
          <Button size="lg" onClick={() => setShowCreateModal(true)} className="min-h-[44px]">
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Goal
          </Button>
        </motion.div>

        <CreateGoalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleGoalCreated}
        />
      </div>
    );
  }

  const goalTypeLabel =
    goal.goalType === 'muscle_building'
      ? 'Building Muscle'
      : goal.goalType === 'fat_loss'
        ? 'Losing Fat'
        : 'Body Recomposition';

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-4 sm:space-y-6 pb-8">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Your Goal
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2 mt-1">
                <Dumbbell className="h-4 w-4" />
                {goalTypeLabel}
              </p>
            </div>
            <Button
              onClick={() => setShowMeasurementLogger(true)}
              className="min-h-[44px] w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Weight
            </Button>
          </div>
        </motion.div>

        {/* Progress Card */}
        {progress && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={staggerItem}>
              <Card className="border-2 border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold">Progress</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold">{progress.percentComplete.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress.percentComplete} className="h-3" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {progress.currentWeight.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {progress.targetWeight.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Days Left</p>
                      <p className="text-xl sm:text-2xl font-bold flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {progress.daysRemaining}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p
                        className={`text-xl sm:text-2xl font-bold ${
                          progress.status === 'ahead'
                            ? 'text-green-600'
                            : progress.status === 'behind'
                              ? 'text-red-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {progress.status === 'ahead'
                          ? 'Ahead'
                          : progress.status === 'behind'
                            ? 'Behind'
                            : 'On Track'}
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {progress.recommendations.length > 0 && (
                    <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <TrendingUp className="h-4 w-4" />
                        Recommendations
                      </h3>
                      <ul className="space-y-1">
                        {progress.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <MeasurementLogger
        isOpen={showMeasurementLogger}
        onClose={() => setShowMeasurementLogger(false)}
        onSuccess={handleMeasurementLogged}
        goalId={goal.id}
      />
    </div>
  );
}
