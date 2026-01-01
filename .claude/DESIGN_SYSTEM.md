# Mo App Design System

## Design Philosophy
Mo is a **fun, energetic, and motivating** fitness app. Every page should feel alive, engaging, and reward user interaction with delightful micro-animations and visual feedback.

## Core Design Principles

### 1. Energy & Motion
- **All pages must use Framer Motion animations**
- Stagger effects for lists and grids
- Hover animations on interactive elements
- Page transitions with fade + scale
- Icons that bounce, rotate, or pulse on hover

### 2. Visual Hierarchy with Gradients
- **Headers:** Always use gradient text
  ```tsx
  className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
  ```
- **Cards:** Use subtle gradient backgrounds
  ```tsx
  className="bg-gradient-to-br from-primary/10 to-primary/5"
  ```
- **Colored accents:** Use semantic fitness colors or accent color

### 3. Interactive Feedback
- **Hover states:** Scale (1.05), shadows enhance, colors brighten
- **Tap states:** Scale down (0.95) for tactile feel
- **Icons:** Rotate 5° or bounce on hover
  ```tsx
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ type: "spring", stiffness: 400, damping: 10 }}
  ```

### 4. Depth & Dimensionality
- **Borders:** Use colored borders with opacity
  ```tsx
  className="border-2 border-primary/30"
  ```
- **Shadows:** Progressive shadows on hover
  ```tsx
  whileHover={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
  ```
- **Layering:** Icons in rounded containers with gradient backgrounds

## Component Patterns

### Page Header Pattern
```tsx
<motion.div variants={staggerItem}>
  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
    Page Title
  </h1>
  <p className="text-sm sm:text-base text-muted-foreground mt-1">
    Descriptive subtitle
  </p>
</motion.div>
```

### Card Pattern
```tsx
<motion.div variants={staggerItem}>
  <motion.div
    variants={cardHover}
    whileHover="hover"
    whileTap="tap"
  >
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        {/* Content */}
      </CardContent>
    </Card>
  </motion.div>
</motion.div>
```

### Icon Container Pattern
```tsx
<motion.div
  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0"
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ type: "spring", stiffness: 400, damping: 10 }}
>
  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
</motion.div>
```

### Button Pattern (Primary Actions)
```tsx
<motion.button
  className="px-3 sm:px-5 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg"
  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
  whileTap={{ scale: 0.95 }}
  style={{ minHeight: '44px' }}
>
  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
  <span>Action</span>
</motion.button>
```

### Tab Navigation Pattern
```tsx
{/* Icon tabs with animations */}
{tabs.map((tab) => {
  const Icon = tab.icon;
  return (
    <TabsTrigger key={tab.id} value={tab.id}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
      <span>{tab.label}</span>
    </TabsTrigger>
  );
})}
```

## Animation Variants

### Required Imports
```tsx
import { motion } from "framer-motion";
import { pageTransition, staggerContainer, staggerItem, cardHover } from "@/lib/animations";
```

### Page Structure
```tsx
<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageTransition}
  className="space-y-4 sm:space-y-6 pb-8"
>
  <motion.div variants={staggerItem}>
    {/* Header */}
  </motion.div>

  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className="space-y-4"
  >
    <motion.div variants={staggerItem}>
      {/* Each section */}
    </motion.div>
  </motion.div>
</motion.div>
```

## Color Usage

### Semantic Fitness Colors
```tsx
// Always use CSS variables for consistency
const fitnessColors = {
  push: "var(--fitness-push)",    // Teal
  pull: "var(--fitness-pull)",    // Blue
  legs: "var(--fitness-legs)",    // Red
  energy: "var(--fitness-energy)", // Orange
  mobility: "var(--fitness-mobility)", // Purple
  cardio: "var(--fitness-cardio)"  // Cyan
};
```

### Gradient Backgrounds
```tsx
// For workout type cards
`bg-gradient-to-br from-[var(--fitness-push)]/20 to-[var(--fitness-push)]/5`

// For status indicators
green: "bg-gradient-to-br from-green-950/20 to-green-900/5"
yellow: "bg-gradient-to-br from-yellow-950/20 to-yellow-900/5"
red: "bg-gradient-to-br from-red-950/20 to-red-900/5"
blue: "bg-gradient-to-br from-blue-950/30 to-blue-900/5"
```

### User Accent Color
```tsx
// Primary actions use user's chosen accent color
style={{
  backgroundColor: 'var(--user-accent-color, #0BA08B)',
  color: 'white'
}}

// Or via className with theme tokens
className="bg-primary text-primary-foreground"
```

## Mobile Optimization

### Touch Targets
- Minimum 44px height for all interactive elements
- Use `touch-manipulation` class
- Responsive sizing: `text-sm sm:text-base`, `h-5 sm:h-6`

### Spacing
- Mobile: `space-y-4`, `gap-3`, `p-4`
- Desktop: `sm:space-y-6`, `sm:gap-4`, `sm:p-6`

### Typography
- Headings: `text-2xl sm:text-3xl`
- Body: `text-sm sm:text-base`
- Labels: `text-xs sm:text-sm`

## Theme Support

### Always Use Semantic Tokens
```tsx
// Text colors
text-foreground         // Primary text
text-muted-foreground   // Secondary text
text-destructive        // Error states

// Backgrounds
bg-background          // Page background
bg-card               // Card backgrounds
bg-secondary          // Input backgrounds
bg-muted              // Disabled/subtle backgrounds

// Borders
border-border         // Standard borders
border-primary        // Active/focus borders

// Interactive
bg-primary            // Primary actions
text-primary          // Primary text/icons
hover:bg-secondary    // Hover states
```

### Never Use Hardcoded Colors
❌ **Wrong:**
```tsx
className="bg-zinc-800 text-zinc-100 border-zinc-700"
```

✅ **Correct:**
```tsx
className="bg-secondary text-foreground border-border"
```

## Consistency Checklist

When building any new page or component, ensure:

- [ ] Uses Framer Motion with stagger effects
- [ ] Headers have gradient text
- [ ] Cards have subtle gradient backgrounds
- [ ] Icons bounce/rotate on hover
- [ ] Buttons scale on hover/tap
- [ ] All interactive elements have min 44px touch targets
- [ ] Uses semantic color tokens (never hardcoded colors)
- [ ] Responsive spacing (mobile → desktop)
- [ ] Shadow effects on primary actions
- [ ] Colored borders with opacity
- [ ] Page transitions with pageTransition variant

## Examples

See these files for reference:
- `/app/(app)/dashboard/page.tsx` - Gold standard for energy and motion
- `/lib/animations.ts` - All animation variants
- `/app/globals.css` - Theme variables and semantic tokens

---

**Remember:** Mo should feel alive, rewarding, and fun. Every interaction should have delightful feedback. Users should *want* to open the app because it feels good to use.
