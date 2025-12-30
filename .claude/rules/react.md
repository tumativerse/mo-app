---
paths: "**/*.tsx,**/components/**"
---

# React Rules

## Components
- Functional components only (no classes)
- One component per file
- Name file same as component (PascalCase)
- Export component as named export

## Hooks
- Custom hooks start with `use` prefix
- Keep hooks at top of component
- Include all dependencies in useEffect arrays
- Use useCallback for event handlers passed to children
- Use useMemo for expensive calculations

## State
- Prefer useState for simple state
- Use useReducer for complex state logic
- Lift state only when needed
- Colocate state with usage

## Performance
- Use React.memo sparingly (profile first)
- Virtualize long lists
- Lazy load heavy components with dynamic imports
- Use Image component for images

## Accessibility
- All interactive elements need accessible names
- Use semantic HTML (button, not div with onClick)
- Include aria-labels where needed
- Ensure focus states are visible
