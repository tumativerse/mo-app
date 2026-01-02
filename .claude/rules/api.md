---
paths: 'app/api/**/*.ts'
---

# API Route Rules

## Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';

const schema = z.object({ ... });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid data',
        details: parsed.error.flatten()
      }, { status: 400 });
    }

    // ... logic

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed', details: message }, { status: 500 });
  }
}
```

## Validation

- Always validate with Zod
- Return `details` with validation errors
- Use proper HTTP status codes

## Auth

- Always call `getCurrentUser()` first
- Return 401 for unauthenticated
- Return 403 for unauthorized

## Responses

- Consistent shape: `{ data }` or `{ error, details? }`
- Include helpful error messages
- Log errors server-side
