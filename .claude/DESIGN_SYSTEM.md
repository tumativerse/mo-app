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
  className = 'bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent';
  ```
- **Cards:** Use subtle gradient backgrounds
  ```tsx
  className = 'bg-gradient-to-br from-primary/10 to-primary/5';
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
  className = 'border-2 border-primary/30';
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
  <p className="text-sm sm:text-base text-muted-foreground mt-1">Descriptive subtitle</p>
</motion.div>
```

### Card Pattern

```tsx
<motion.div variants={staggerItem}>
  <motion.div variants={cardHover} whileHover="hover" whileTap="tap">
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300">
      <CardContent className="p-4 sm:p-6">{/* Content */}</CardContent>
    </Card>
  </motion.div>
</motion.div>
```

### Icon Container Pattern

```tsx
<motion.div
  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0"
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
>
  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
</motion.div>
```

### Button Pattern (Primary Actions)

```tsx
<motion.button
  className="px-3 sm:px-5 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg"
  whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
  whileTap={{ scale: 0.95 }}
  style={{ minHeight: '44px' }}
>
  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
  <span>Action</span>
</motion.button>
```

### Tab Navigation Pattern

```tsx
{
  /* Icon tabs with animations */
}
{
  tabs.map((tab) => {
    const Icon = tab.icon;
    return (
      <TabsTrigger key={tab.id} value={tab.id}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <span>{tab.label}</span>
      </TabsTrigger>
    );
  });
}
```

## Animation Variants

### Required Imports

```tsx
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem, cardHover } from '@/lib/animations';
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
  <motion.div variants={staggerItem}>{/* Header */}</motion.div>

  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
    <motion.div variants={staggerItem}>{/* Each section */}</motion.div>
  </motion.div>
</motion.div>
```

## Color Usage

### Semantic Fitness Colors

```tsx
// Always use CSS variables for consistency
const fitnessColors = {
  push: 'var(--fitness-push)', // Teal
  pull: 'var(--fitness-pull)', // Blue
  legs: 'var(--fitness-legs)', // Red
  energy: 'var(--fitness-energy)', // Orange
  mobility: 'var(--fitness-mobility)', // Purple
  cardio: 'var(--fitness-cardio)', // Cyan
};
```

### Gradient Backgrounds

```tsx
// For workout type cards
`bg-gradient-to-br from-[var(--fitness-push)]/20 to-[var(--fitness-push)]/5`;

// For status indicators
green: 'bg-gradient-to-br from-green-950/20 to-green-900/5';
yellow: 'bg-gradient-to-br from-yellow-950/20 to-yellow-900/5';
red: 'bg-gradient-to-br from-red-950/20 to-red-900/5';
blue: 'bg-gradient-to-br from-blue-950/30 to-blue-900/5';
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
text - foreground; // Primary text
text - muted - foreground; // Secondary text
text - destructive; // Error states

// Backgrounds
bg - background; // Page background
bg - card; // Card backgrounds
bg - secondary; // Input backgrounds
bg - muted; // Disabled/subtle backgrounds

// Borders
border - border; // Standard borders
border - primary; // Active/focus borders

// Interactive
bg - primary; // Primary actions
text - primary; // Primary text/icons
hover: bg - secondary; // Hover states
```

### Never Use Hardcoded Colors

❌ **Wrong:**

```tsx
className = 'bg-zinc-800 text-zinc-100 border-zinc-700';
```

✅ **Correct:**

```tsx
className = 'bg-secondary text-foreground border-border';
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

## Loading States

### Skeleton Loaders

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Card skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-40" />
    <Skeleton className="h-4 w-64 mt-2" />
  </CardHeader>
  <CardContent className="space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-3/4" />
  </CardContent>
</Card>

// List skeleton
<div className="space-y-3">
  {[1, 2, 3].map((i) => (
    <div key={i} className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ))}
</div>
```

### Loading Buttons

```tsx
import { Loader2 } from 'lucide-react';

<Button disabled={isLoading} className="min-h-[44px] min-w-[120px]">
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Continue'
  )}
</Button>;
```

### Progressive Loading

```tsx
// Show skeleton first, then content
{
  isLoading ? (
    <CardSkeleton />
  ) : (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>{/* Content */}</Card>
    </motion.div>
  );
}
```

---

## Feedback & Notifications

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Workout completed! 💪');

// Error
toast.error('Failed to save. Please try again.');

// Loading (auto-dismiss on completion)
const toastId = toast.loading('Saving workout...');
// Later...
toast.success('Workout saved!', { id: toastId });

// With action
toast('Workout skipped', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

### Inline Success Indicators

```tsx
import { Check } from 'lucide-react';

{
  saved && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-green-600 dark:text-green-400"
    >
      <Check className="h-4 w-4" />
      <span className="text-sm">Saved</span>
    </motion.div>
  );
}
```

### Celebration Animations

```tsx
import { celebrateWorkoutComplete } from '@/lib/celebrations';

// Trigger confetti on achievement
const handleComplete = () => {
  celebrateWorkoutComplete();
  toast.success('Workout complete! 🎉');
};
```

---

## Collapsible Sections

### Accordion Pattern

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="multiple" defaultValue={['section1']}>
  <AccordionItem value="section1">
    <AccordionTrigger className="text-lg font-semibold">Section Title</AccordionTrigger>
    <AccordionContent>
      <p>Content goes here...</p>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="section2">
    <AccordionTrigger className="text-lg font-semibold">Another Section</AccordionTrigger>
    <AccordionContent>
      <p>More content...</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>;
```

---

## Empty States

### No Data Pattern

```tsx
import { Inbox } from 'lucide-react';

<motion.div
  variants={staggerItem}
  className="flex flex-col items-center justify-center py-12 sm:py-16 text-center"
>
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
    <Inbox className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
  </div>
  <h3 className="text-lg sm:text-xl font-semibold mb-2">No workouts yet</h3>
  <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
    Start your first workout to begin tracking your progress
  </p>
  <Button className="min-h-[44px]">
    <Plus className="mr-2 h-5 w-5" />
    Start Workout
  </Button>
</motion.div>;
```

---

## Error States

### Error Message Pattern

```tsx
import { AlertCircle } from 'lucide-react';

<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-4 bg-destructive/10 border border-destructive rounded-lg"
>
  <div className="flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
    <div>
      <p className="font-medium text-destructive">Error</p>
      <p className="text-sm text-destructive/90 mt-1">Failed to load data. Please try again.</p>
    </div>
  </div>
</motion.div>;
```

### Error with Retry

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
  <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
  <p className="text-sm text-muted-foreground mb-6">Something went wrong. Please try again.</p>
  <Button onClick={handleRetry} variant="outline" className="min-h-[44px]">
    <RefreshCw className="mr-2 h-4 w-4" />
    Try Again
  </Button>
</div>
```

---

## Examples

See these files for reference:

- `/app/(app)/dashboard/page.tsx` - Gold standard for energy and motion
- `/lib/animations.ts` - All animation variants
- `/app/globals.css` - Theme variables and semantic tokens
- `.claude/rules/settings-patterns.md` - Settings page patterns
- `.claude/rules/form-patterns.md` - Form and input patterns

---

**Remember:** Mo should feel alive, rewarding, and fun. Every interaction should have delightful feedback. Users should _want_ to open the app because it feels good to use.
