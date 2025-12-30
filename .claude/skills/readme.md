# README Generator Skill

Generate or update README files.

## Usage
`/readme [section]`

Sections: `setup`, `api`, `architecture`, `contributing`, `all`

## Behavior

### Full README (`/readme` or `/readme all`)

Generate comprehensive README:

```markdown
# Mo - Fitness Tracking App

A PPL (Push/Pull/Legs) workout tracking application.

## Features

- [ ] List key features

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Clerk
- **Styling**: TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Clerk account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Push database schema: `npm run db:push`
5. Seed database: `npm run db:seed`
6. Start dev server: `npm run dev`

## Project Structure

```
app/
  (app)/          # Authenticated pages
  api/            # API routes
components/       # React components
lib/
  db/             # Database schema and seeds
  mo-coach/       # Training intelligence
  mo-self/        # User management
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed PPL template |

## API Overview

Brief description of main API endpoints.

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Run build: `npm run build`
5. Submit PR

## License

[License type]
```

### Section Updates

`/readme setup` - Update only the setup section
`/readme api` - Update only the API section
`/readme architecture` - Update project structure section

## Guidelines

- Keep README concise but complete
- Update when significant changes are made
- Include working examples
- Test all commands before documenting
