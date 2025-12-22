import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/mo-self';
import {
  calculateFatigue,
  checkDeloadNeeded,
  getActiveDeload,
  startDeload,
  endDeload,
  type DeloadDecision,
} from '@/lib/mo-coach';

// GET /api/training/status - Get current training status (fatigue, deload, etc.)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all training status in parallel
    const [fatigue, deloadDecision, activeDeload] = await Promise.all([
      calculateFatigue(user.id),
      checkDeloadNeeded(user.id),
      getActiveDeload(user.id),
    ]);

    return NextResponse.json({
      fatigue: {
        score: fatigue.score,
        level: fatigue.status.level,
        color: fatigue.status.color,
        message: fatigue.status.message,
        action: fatigue.status.action,
        factors: fatigue.factors,
        recommendations: fatigue.recommendations,
      },
      deload: activeDeload
        ? {
            status: 'active',
            type: activeDeload.deloadType,
            startDate: activeDeload.startDate,
            endDate: activeDeload.endDate,
            daysRemaining: activeDeload.daysRemaining,
            volumeModifier: activeDeload.volumeModifier,
            intensityModifier: activeDeload.intensityModifier,
            reason: activeDeload.triggerReason,
          }
        : deloadDecision.shouldDeload
        ? {
            status: 'recommended',
            type: deloadDecision.deloadType,
            suggestedDuration: deloadDecision.durationDays,
            volumeModifier: deloadDecision.volumeModifier,
            intensityModifier: deloadDecision.intensityModifier,
            reason: deloadDecision.reason,
          }
        : {
            status: 'none',
            reason: 'No deload needed',
          },
      // Quick status for UI display
      canTrain: fatigue.score < 9 && !activeDeload?.deloadType?.includes('full_rest'),
      shouldReduce: fatigue.score >= 6 || !!activeDeload,
    });
  } catch (error) {
    console.error('Error fetching training status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training status' },
      { status: 500 }
    );
  }
}

// POST /api/training/status - Trigger or end a deload
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, deloadType, durationDays } = body;

    if (action === 'start_deload') {
      // Get current fatigue for logging
      const fatigue = await calculateFatigue(user.id);

      // Create deload decision from parameters or use recommendation
      let decision: DeloadDecision;

      if (deloadType && durationDays) {
        // Manual deload configuration
        decision = {
          shouldDeload: true,
          reason: 'Manual deload triggered',
          deloadType: deloadType as 'volume' | 'intensity' | 'full_rest',
          durationDays,
          volumeModifier: deloadType === 'full_rest' ? 0 : 0.6,
          intensityModifier: deloadType === 'intensity' ? 0.85 : 1.0,
        };
      } else {
        // Use system recommendation
        decision = await checkDeloadNeeded(user.id);
        if (!decision.shouldDeload) {
          decision = {
            shouldDeload: true,
            reason: 'Manual deload triggered',
            deloadType: 'volume',
            durationDays: 7,
            volumeModifier: 0.6,
            intensityModifier: 1.0,
          };
        }
      }

      const deloadId = await startDeload(user.id, decision, fatigue.score);

      return NextResponse.json({
        success: true,
        message: 'Deload started',
        deloadId,
        deload: decision,
      });
    }

    if (action === 'end_deload') {
      await endDeload(user.id);

      return NextResponse.json({
        success: true,
        message: 'Deload ended',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "start_deload" or "end_deload"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating training status:', error);
    return NextResponse.json(
      { error: 'Failed to update training status' },
      { status: 500 }
    );
  }
}
