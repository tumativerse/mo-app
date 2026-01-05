import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';
import { getGoalById, updateGoal } from '@/lib/mo-journey';

const updateGoalSchema = z.object({
  targetDate: z.string().datetime().optional(),
  targetWeight: z.number().positive().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await getGoalById(params.id);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (goal.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.targetDate) {
      updateData.targetDate = new Date(parsed.data.targetDate);
    }
    if (parsed.data.targetWeight) {
      updateData.targetWeight = parsed.data.targetWeight.toString();
    }
    if (parsed.data.status) {
      updateData.status = parsed.data.status;
    }

    const updated = await updateGoal(params.id, updateData);
    return NextResponse.json({ goal: updated });
  } catch (error) {
    console.error('Failed to update goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await getGoalById(params.id);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (goal.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete: mark as archived
    await updateGoal(params.id, { status: 'archived' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to archive goal:', error);
    return NextResponse.json({ error: 'Failed to archive goal' }, { status: 500 });
  }
}
