import confetti from 'canvas-confetti';

// Celebration for completing a workout
export function celebrateWorkoutComplete() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  }, 250);
}

// Celebration for setting a new PR
export function celebratePersonalRecord() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#f59e0b', '#ef4444', '#10b981'],
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Celebration for completing a set
export function celebrateSetComplete() {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.6 },
    colors: ['#10b981'],
    ticks: 50,
    gravity: 1.2,
    scalar: 0.8,
  });
}

// Celebration for streak milestone
export function celebrateStreak(days: number) {
  const emoji = days >= 30 ? '🔥' : days >= 7 ? '⚡' : '💪';

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#ef4444'],
    shapes: ['circle'],
  });

  // Add emoji confetti
  confetti({
    particleCount: 5,
    spread: 50,
    origin: { y: 0.6 },
    scalar: 3,
    shapes: [confetti.shapeFromText({ text: emoji })],
  });
}

// Simple confetti burst
export function celebrateSimple() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#10b981', '#3b82f6', '#f59e0b'],
  });
}

// Fireworks effect
export function celebrateFireworks() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#3b82f6', '#ef4444'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10b981', '#3b82f6', '#ef4444'],
    });
  }, 200);
}

// Cannon blast (for major achievements)
export function celebrateCannon() {
  const end = Date.now() + 1000;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// Vibration for mobile devices
export function vibrateDevice(pattern: number | number[] = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Combined celebration with haptic feedback
export function celebrateWithHaptics(type: 'workout' | 'pr' | 'set' | 'streak') {
  switch (type) {
    case 'workout':
      celebrateWorkoutComplete();
      vibrateDevice([100, 50, 100, 50, 200]);
      break;
    case 'pr':
      celebratePersonalRecord();
      vibrateDevice([200, 100, 200]);
      break;
    case 'set':
      celebrateSetComplete();
      vibrateDevice(50);
      break;
    case 'streak':
      celebrateStreak(7);
      vibrateDevice([50, 50, 50, 50, 100]);
      break;
  }
}

// New celebration: Weight milestone (every 5 lbs lost/gained)
export function celebrateWeightMilestone() {
  confetti({
    particleCount: 75,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    startVelocity: 30,
    ticks: 100,
  });
}

// New celebration: First workout ever
export function celebrateFirstWorkout() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  }, 100);
}

// New celebration: Session milestone (10, 25, 50, 100 workouts)
export function celebrateSessionMilestone(count: number) {
  // Epic celebration for major milestones
  const colors = count >= 100 ? ['#ffd700', '#ff6b6b', '#4ecdc4'] :
                 count >= 50 ? ['#10b981', '#3b82f6', '#f59e0b'] :
                 ['#3b82f6', '#10b981'];

  celebrateCannon();

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 },
      colors,
      startVelocity: 45,
      shapes: ['circle', 'square'],
      ticks: 200,
    });
  }, 500);

  // Add number confetti
  setTimeout(() => {
    confetti({
      particleCount: 3,
      spread: 40,
      origin: { y: 0.5 },
      scalar: 4,
      shapes: [confetti.shapeFromText({ text: String(count) })],
    });
  }, 1000);
}

// New celebration: Exercise variety achievement
export function celebrateExerciseVariety() {
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8b5cf6', '#ec4899', '#f59e0b'],
    shapes: ['circle'],
    startVelocity: 35,
  });
}

// New celebration: Volume PR (most weight lifted in a session)
export function celebrateVolumePR() {
  // Multiple bursts
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60 + (i * 30),
        spread: 55,
        origin: { x: 0.3 + (i * 0.2), y: 0.7 },
        colors: ['#ef4444', '#f59e0b', '#10b981'],
      });
    }, i * 200);
  }
}

// New celebration: Perfect week (all planned workouts completed)
export function celebratePerfectWeek() {
  const end = Date.now() + 3000;
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());

  // Add star confetti
  setTimeout(() => {
    confetti({
      particleCount: 10,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#ffd700'],
      shapes: ['star'],
      scalar: 2,
    });
  }, 1500);
}
