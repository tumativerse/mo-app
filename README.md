# Mo - Your AI-Powered Fitness Companion

**Mo** is a modern fitness tracking application built with Next.js 16, featuring an intelligent Push/Pull/Legs (PPL) workout system, comprehensive progress tracking, and personalized training recommendations.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

### 🏋️ Smart Workout System
- **PPL Program:** Structured Push/Pull/Legs split with 6-day rotation
- **Exercise Library:** 756+ exercises with movement pattern categorization
- **Progressive Overload:** Automated weight/rep progression tracking
- **Fatigue Management:** Intelligent recovery recommendations based on training load

### 📊 Progress Tracking
- **Personal Records:** Track PRs across all exercises
- **Workout History:** Complete session logs with detailed metrics
- **Body Metrics:** Weight, measurements, and body composition tracking
- **Visual Analytics:** Charts and graphs for long-term progress visualization

### 🎯 Personalization
- **Smart Onboarding:** 5-step profile setup capturing goals, experience, equipment
- **Custom Programs:** Tailored workout plans based on your fitness level
- **Adaptive Training:** Recommendations adjust based on performance and recovery
- **Encrypted Data:** All personal information is end-to-end encrypted

### 🎨 User Experience
- **Dark/Light Mode:** Beautiful themes with custom accent colors
- **Mobile-First:** Optimized for gym use on phones
- **Responsive Design:** Works seamlessly on all devices
- **Intuitive Interface:** Clean, modern UI with smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State:** React Server Components + Client Components

### Backend
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Clerk](https://clerk.com/)
- **API Routes:** Next.js API routes with Zod validation
- **Encryption:** AES-256-GCM for sensitive data

### DevOps & Quality
- **Deployment:** [Vercel](https://vercel.com/)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/)
- **Testing:** Vitest + Playwright + axe-core
- **Linting:** ESLint + Prettier + secretlint
- **Type Safety:** TypeScript strict mode

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** 18.17 or higher
- **npm/yarn/pnpm:** Latest version
- **PostgreSQL:** Database instance (or use Neon free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/mo-app.git
cd mo-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"

# Encryption (generate with: npm run security:generate-key)
ENCRYPTION_KEY="your-generated-encryption-key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Generate Encryption Key
```bash
npm run security:generate-key
```
Copy the generated key to `ENCRYPTION_KEY` in `.env.local`

### 5. Set Up Database
```bash
# Push schema to database
npm run db:push

# Seed with PPL program template
npm run db:seed
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
mo-app/
├── app/                      # Next.js App Router
│   ├── (app)/               # Authenticated app routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── workout/         # Workout session
│   │   ├── progress/        # Progress tracking
│   │   └── settings/        # User settings
│   ├── api/                 # API routes
│   ├── onboarding/          # Multi-step onboarding
│   └── (auth)/              # Login/signup
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components (buttons, cards, etc.)
│   └── settings/            # Settings-specific components
├── lib/                     # Core application logic
│   ├── db/                  # Database schema & queries
│   ├── mo-coach/            # Training intelligence
│   ├── mo-self/             # User management
│   ├── mo-pulse/            # Workout execution
│   └── security/            # Encryption utilities
├── .claude/                 # Claude Code configuration
│   ├── rules/               # Coding standards
│   ├── hooks/               # Quality check scripts
│   └── skills/              # Code generation templates
└── public/                  # Static assets
```

---

## 🧪 Testing & Quality

### Run Tests
```bash
# Unit tests
npm run test

# Unit tests (watch mode)
npm run test:watch

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Code Quality
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run prettier:write

# Secret detection
npm run secretlint
```

### Git Hooks
Pre-commit and pre-push hooks automatically run quality checks:
- ✅ TypeScript type checking
- ✅ Secret detection (secretlint)
- ✅ Production build verification

---

## 📊 Database Schema

### Core Tables
- **users:** User profiles (encrypted: name, DOB, measurements)
- **userPreferences:** Training preferences (encrypted: goals, equipment)
- **programTemplates:** Workout program definitions
- **templateDays:** Program days (Push A, Pull A, Legs A, etc.)
- **templateSlots:** Exercise slots per day
- **workoutSessions:** User's workout sessions
- **sessionExercises:** Exercises in a session
- **sessionSets:** Individual sets logged

### Encryption
All sensitive user data (PII, body metrics, training data) is encrypted using AES-256-GCM before storage.

---

## 🤝 Contributing

Mo is currently in early development. Contributions are not being accepted at this time, but feel free to:
- 🐛 **Open issues** for bugs
- 💡 **Suggest features** via issues
- ⭐ **Star the repo** if you find it interesting!

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open source tools:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Clerk](https://clerk.com/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with 💪 by [@stumati](https://github.com/stumati)**
