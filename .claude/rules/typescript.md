# TypeScript Rules

## CRITICAL: Type Safety First

### ❌ BANNED:

```typescript
// NEVER use 'any'
const data: any = await fetch();  // ❌

// NEVER skip types
function process(data) {  // ❌ Missing parameter type
  return data;
}

// NEVER use type assertions without reason
const result = data as SomeType;  // ❌ (usually means bad design)

// NEVER duplicate interfaces
interface User { ... }  // in one file
interface User { ... }  // in another file ❌
```

### ✅ REQUIRED:

**1. All Shared Types in `lib/types/index.ts`**

```typescript
// lib/types/index.ts
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  heightCm: number;
}

export interface WorkoutSession {
  id: string;
  status: 'in_progress' | 'completed' | 'skipped';
  startTime: Date;
  endTime?: Date;
}

// Import EVERYWHERE - single source of truth
import type { User, WorkoutSession } from '@/lib/types';
```

**2. API Response Types**

```typescript
// lib/types/api.ts
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// Usage
const response: ApiResponse<User> = await fetch('/api/user');
```

**3. Component Props**

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
}: ButtonProps) {
  // ...
}
```

**4. Use Zod for Runtime Validation**

```typescript
import { z } from 'zod';

// Schema
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(13).max(120),
  profile: z.object({
    fullName: z.string().min(1),
  }),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;

// Validate
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```

**5. Use `unknown` instead of `any`**

```typescript
// ✅ CORRECT
try {
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ WRONG
catch (error: any) {  // Never use any
  console.error(error.message);
}
```

## Type Checklist (Before Committing):

- [ ] No `any` types
- [ ] All function parameters typed
- [ ] All function return types typed (or inferred correctly)
- [ ] Shared types in `lib/types/*`
- [ ] API responses use `ApiResponse<T>`
- [ ] Forms use Zod schemas
- [ ] `npm run type-check` passes
