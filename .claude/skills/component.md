# Component Generator Skill

Generate a new React component following Mo app patterns.

## Usage
`/component <ComponentName> [--page] [--with-api]`

## Behavior

When invoked, create a component with:

### Standard Component (default)
Create in `components/<ComponentName>.tsx`:
```typescript
'use client';

import { ComponentProps } from './types';

interface <ComponentName>Props {
  // Define props
}

export function <ComponentName>({ ...props }: <ComponentName>Props) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Page Component (--page)
Create in `app/(app)/<name>/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/error-state';

interface PageData {
  // Define data type
}

export default function <ComponentName>Page() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/<endpoint>');
        if (!res.ok) throw new Error('Failed to fetch');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4"><ComponentName></h1>
      {/* Page content */}
    </div>
  );
}
```

### With API (--with-api)
Also create `app/api/<name>/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query data
    const data = {};

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed', details: message }, { status: 500 });
  }
}
```

## Guidelines
- Use PascalCase for component names
- Follow existing patterns in the codebase
- Include proper TypeScript types
- Use dark theme styling (zinc colors)
