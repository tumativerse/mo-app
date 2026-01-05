import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/mo-self';
import { getGoalById, getGoalProgress } from '@/lib/mo-journey';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const progress = await getGoalProgress(params.id);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Failed to get progress:', error);
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
  }
}
