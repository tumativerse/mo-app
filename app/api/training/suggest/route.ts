import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  suggestWeight,
  getSuggestionAfterSet,
  getWarmupSets,
  getRestTimerConfig,
} from '@/lib/training-logic';

// GET /api/training/suggest - Get weight/set suggestions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');
    const setNumber = parseInt(searchParams.get('setNumber') || '1');
    const isWarmup = searchParams.get('isWarmup') === 'true';
    const slotType = searchParams.get('slotType') as 'primary' | 'secondary' | 'accessory' | 'optional' || 'secondary';
    const exerciseCategory = searchParams.get('exerciseCategory') as 'compound' | 'isolation' | 'cardio' | 'mobility' || 'compound';

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'exerciseId is required' },
        { status: 400 }
      );
    }

    // Get weight suggestion
    const weightSuggestion = await suggestWeight(
      user.id,
      exerciseId,
      setNumber,
      isWarmup
    );

    // Get rest timer config
    const restTimer = getRestTimerConfig(slotType, exerciseCategory);

    // Get warmup progression if requesting warmup sets
    let warmupSets = null;
    if (searchParams.get('includeWarmups') === 'true' && !isWarmup) {
      const workingWeight = weightSuggestion.suggestedWeight;
      warmupSets = getWarmupSets(workingWeight);
    }

    return NextResponse.json({
      weight: weightSuggestion,
      restTimer,
      warmupSets,
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

// POST /api/training/suggest - Get suggestion after completing a set
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      setNumber,
      totalSets,
      completedReps,
      targetReps,
      rpe,
      targetRpe,
    } = body;

    // Validate required fields
    if (
      setNumber === undefined ||
      totalSets === undefined ||
      completedReps === undefined ||
      targetReps === undefined ||
      rpe === undefined ||
      targetRpe === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get suggestion based on set performance
    const suggestion = getSuggestionAfterSet(
      setNumber,
      totalSets,
      completedReps,
      targetReps,
      rpe,
      targetRpe
    );

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Error getting set suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestion' },
      { status: 500 }
    );
  }
}
