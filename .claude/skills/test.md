# Test Generator Skill

Generate tests for components or API routes.

## Usage

`/test <file-path>`

## Behavior

Analyze the specified file and generate appropriate tests.

### For Components

Create `<component-name>.test.tsx` next to the component:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// Mock fetch
global.fetch = jest.fn();

// Mock auth if needed
jest.mock('@/lib/mo-self', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Test User' }),
}));

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    render(<ComponentName />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error state', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
    render(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### For API Routes

Create `route.test.ts` next to the route:

```typescript
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/mo-self';

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: '1' }]),
  },
}));

jest.mock('@/lib/mo-self', () => ({
  getCurrentUser: jest.fn(),
}));

describe('API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/route');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return data for authenticated user', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const request = new NextRequest('http://localhost/api/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
    });
  });
});
```

## Guidelines

- Query by role, label, text (not test-ids)
- Use `userEvent` over `fireEvent`
- Use `findBy*` for async content
- Mock external dependencies
- Test user flows, not implementation
- Include happy path and error cases
