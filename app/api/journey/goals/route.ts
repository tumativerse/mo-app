import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';
import { createGoal, getActiveGoal } from '@/lib/mo-journey';

const createGoalSchema = z.object({
  goalType: z.enum(['muscle_building', 'fat_loss', 'recomp']),
  targetDate: z.string().datetime(),
  startingWeight: z.number().positive(),
  targetWeight: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing active goal
    const existingGoal = await getActiveGoal(user.id);
    if (existingGoal) {
      return NextResponse.json(
        { error: 'You already have an active goal. Archive or complete it first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid goal data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const goal = await createGoal(user.id, {
      goalType: parsed.data.goalType,
      targetDate: new Date(parsed.data.targetDate),
      startingWeight: parsed.data.startingWeight.toString(),
      targetWeight: parsed.data.targetWeight.toString(),
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Failed to create goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await getActiveGoal(user.id);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Failed to get goal:', error);
    return NextResponse.json({ error: 'Failed to get goal' }, { status: 500 });
  }
}
