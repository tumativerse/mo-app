# Architecture Rules

## File Organization

### Feature-Based Structure (NOT by type)
```
app/(app)/dashboard/
├── page.tsx                    # Main page
├── loading.tsx                 # Loading state
├── error.tsx                   # Error boundary
├── components/                 # Dashboard-specific components
│   ├── workout-card.tsx
│   └── streak-counter.tsx
└── hooks/                      # Dashboard-specific hooks
    └── use-dashboard-data.ts
```

### ✅ Colocation Rule:
- Keep files close to where they're used
- Only move to `lib/` when used in 3+ places
- Delete feature = delete folder (easy cleanup)

### ❌ NEVER Create These Structures:
```
components/
├── buttons/           # ❌ Don't organize by type
├── cards/
└── forms/

utils/
└── everything.ts      # ❌ Don't dump everything in one file
```

## Component Rules

### Server vs Client Components

**Default: Server Component**
```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getDashboardData(); // Fetch on server
  return <DashboardClient data={data} />;
}
```

**Client: Only when needed**
```tsx
'use client'; // ONLY add when you need:
// - useState, useEffect, hooks
// - Event handlers (onClick, onChange)
// - Browser APIs (localStorage, etc.)
// - Context consumers
```

### Component Size Rule:
- Max 200 lines per component
- If bigger, extract sub-components
- Extract hooks to separate files

### Component Checklist:
- [ ] Uses TypeScript interface for props
- [ ] Has JSDoc comment explaining purpose
- [ ] Uses semantic HTML
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Mobile-responsive
- [ ] No hardcoded values (uses tokens/variants)

## Data Fetching

### Pattern to Follow:
```tsx
export function useWorkoutSession(id: string) {
  const [data, setData] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/workout/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [id]);

  return { data, loading, error };
}
```

### ALWAYS Return:
- `data` - The fetched data
- `loading` - Loading state
- `error` - Error message or null

## State Management

### Local State (useState)
Use for component-specific state that doesn't need sharing

### Context (React.createContext)
Use for state shared across 3+ components in a tree

### Zustand (optional)
Use for truly global state (auth, theme, etc.)

### ❌ NEVER:
- Prop drilling more than 2 levels
- Storing server data in global state (use React Query instead)
