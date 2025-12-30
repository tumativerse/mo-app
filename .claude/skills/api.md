# API Route Generator Skill

Generate a new API route following Mo app patterns.

## Usage
`/api <route-name> [GET|POST|PUT|PATCH|DELETE]`

## Behavior

Create `app/api/<route-name>/route.ts` with the specified HTTP methods.

### Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
// Import relevant tables from '@/lib/db/schema'

// Define request schema for POST/PUT/PATCH
const createSchema = z.object({
  // Define fields
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params if needed
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Query database
    const data = await db.select().from(/* table */).where(/* conditions */);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch', details: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid data',
        details: parsed.error.flatten()
      }, { status: 400 });
    }

    // Insert into database
    const [result] = await db.insert(/* table */).values({
      userId: user.id,
      ...parsed.data,
    }).returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create', details: message }, { status: 500 });
  }
}
```

### For Dynamic Routes
Create `app/api/<route-name>/[id]/route.ts`:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## Guidelines
- Always validate with Zod
- Always check authentication with `getCurrentUser()`
- Return consistent error format: `{ error, details? }`
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Log errors server-side
