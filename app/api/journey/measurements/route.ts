import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';
import { logMeasurement, getMeasurements } from '@/lib/mo-journey';

const logMeasurementSchema = z.object({
  weight: z.number().positive(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  goalId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = logMeasurementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid measurement data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const measurement = await logMeasurement(user.id, {
      weight: parsed.data.weight.toString(),
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      notes: parsed.data.notes,
      goalId: parsed.data.goalId,
    });

    return NextResponse.json({ measurement }, { status: 201 });
  } catch (error) {
    console.error('Failed to log measurement:', error);
    return NextResponse.json({ error: 'Failed to log measurement' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');

    const measurements = await getMeasurements(user.id, limit);
    return NextResponse.json({ measurements });
  } catch (error) {
    console.error('Failed to get measurements:', error);
    return NextResponse.json({ error: 'Failed to get measurements' }, { status: 500 });
  }
}
