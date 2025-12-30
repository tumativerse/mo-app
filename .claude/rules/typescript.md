---
paths: "**/*.ts,**/*.tsx"
---

# TypeScript Rules

## Type Safety
- Use strict mode (already in tsconfig)
- NEVER use `any` - use `unknown` if type is truly unknown
- Create interfaces for all API responses
- Export prop types for reusable components

## Patterns
- Use discriminated unions for complex state
- Prefer `type` for unions, `interface` for objects
- Use `as const` for literal types
- Avoid type assertions (`as`) - fix the types instead

## Naming
- Interfaces: PascalCase (e.g., `UserProfile`)
- Types: PascalCase (e.g., `ApiResponse`)
- Generics: Single capital letter or descriptive (e.g., `T`, `TData`)

## Imports
- Use absolute imports from `@/` path alias
- Group: external, internal, types, styles
