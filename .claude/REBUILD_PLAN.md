# Mo App UI Rebuild Plan

## Goal
Rebuild the entire UI with theme support, mobile optimization, and centralized design system from day 1.

---

## Phase 0: Foundation (Day 1) ✅ DONE
- [x] Archive old UI to `archive/ui-v1-20260101/`
- [x] Create enforcement system (rules, hooks, checklists)
- [x] Decide tech stack
- [x] Set up Git hooks

---

## Phase 1: Design System Setup (Day 1) ✅ DONE

### 1.1 Install Dependencies ✅
```bash
npm install next-themes class-variance-authority clsx tailwind-merge
npm install date-fns
npm install --save-dev @types/node
```

### 1.2 Create Design System Files ✅
- [x] `lib/design/tokens.ts` - All values (colors, spacing, sizes, etc.)
- [x] `lib/design/variants.ts` - Component variants using CVA
- [x] `lib/utils/cn.ts` - className merger utility
- [ ] `lib/types/index.ts` - Shared TypeScript types (will create as needed)

### 1.3 Setup Theme System ✅
- [x] Update `app/globals.css` - CSS variables for light/dark
- [x] Create `lib/contexts/theme-provider.tsx` - Using next-themes
- [x] Wrap app in ThemeProvider in `app/layout.tsx`
- [x] Update `tailwind.config.ts` - Use tokens

### 1.4 Create Base Components ✅
- [x] `components/ui/button.tsx` - Using variants
- [x] `components/ui/card.tsx` - Using variants
- [x] `components/ui/badge.tsx` - Using variants
- [x] `components/ui/skeleton.tsx` - For loading states

### 1.5 Test Theme System ✅
- [x] Created test page at `app/(app)/test-theme/page.tsx`
- [x] Tests all component variants
- [x] Tests theme switching (light/dark)
- [x] Verified mobile touch targets

**Deliverable:** Working design system with theme toggle ✅ COMPLETE

---

## Phase 2: Dashboard Page (Day 2)

### 2.1 Plan Dashboard Features
Core features:
1. Today's Workout Card (big, prominent)
2. Streak Counter (gamification)
3. Fatigue Indicator
4. Quick Actions (Log Weight, View Progress)
5. This Week Stats

### 2.2 Create Dashboard Components
- [ ] `app/(app)/dashboard/page.tsx` - Main page (Server Component)
- [ ] `app/(app)/dashboard/components/workout-card.tsx`
- [ ] `app/(app)/dashboard/components/streak-counter.tsx`
- [ ] `app/(app)/dashboard/components/fatigue-indicator.tsx`
- [ ] `app/(app)/dashboard/components/quick-actions.tsx`
- [ ] `app/(app)/dashboard/components/week-stats.tsx`

### 2.3 Create Dashboard API
- [ ] `app/api/dashboard/route.ts` - Fetch all dashboard data

### 2.4 Test Dashboard
- [ ] Works in light theme
- [ ] Works in dark theme
- [ ] Works on mobile (375px)
- [ ] All animations smooth
- [ ] Loading states show
- [ ] No hardcoded values

**Deliverable:** Fully functional dashboard with theme support

---

## Phase 3: Workout Page (Day 3)

### 3.1 Plan Workout Features
Core features:
1. Workout session view
2. Exercise list with sets
3. Rest timer
4. Progress tracking
5. Complete workout flow

### 3.2 Create Workout Components
- [ ] `app/(app)/workout/page.tsx` - Main page
- [ ] `app/(app)/workout/components/exercise-card.tsx`
- [ ] `app/(app)/workout/components/set-row.tsx`
- [ ] `app/(app)/workout/components/rest-timer.tsx`
- [ ] `app/(app)/workout/components/workout-header.tsx`

### 3.3 Create Workout Hooks
- [ ] `app/(app)/workout/hooks/use-workout-session.ts`
- [ ] `app/(app)/workout/hooks/use-rest-timer.ts`

### 3.4 Test Workout
- [ ] Works in both themes
- [ ] Mobile-friendly (44px touch targets)
- [ ] Rest timer works
- [ ] Set logging works
- [ ] Completes workout flow

**Deliverable:** Fully functional workout page

---

## Phase 4: Progress Page (Day 4)

### 4.1 Plan Progress Features
Core features:
1. Fatigue score tracking
2. Volume trends chart
3. PR history
4. Workout history

### 4.2 Create Progress Components
- [ ] `app/(app)/progress/page.tsx` - Main page
- [ ] `app/(app)/progress/components/fatigue-chart.tsx`
- [ ] `app/(app)/progress/components/volume-chart.tsx`
- [ ] `app/(app)/progress/components/pr-list.tsx`

### 4.3 Install Chart Library
```bash
npm install recharts
```

### 4.4 Test Progress
- [ ] Charts work in both themes
- [ ] Mobile responsive
- [ ] Data updates correctly

**Deliverable:** Progress tracking page with charts

---

## Phase 5: Weight Page (Day 4)

### 5.1 Create Weight Components
- [ ] `app/(app)/weight/page.tsx` - Main page
- [ ] `app/(app)/weight/components/weight-form.tsx`
- [ ] `app/(app)/weight/components/weight-chart.tsx`
- [ ] `app/(app)/weight/components/weight-stats.tsx`

### 5.2 Test Weight
- [ ] Form validation works
- [ ] Chart shows trends
- [ ] Mobile-friendly input

**Deliverable:** Weight tracking page

---

## Phase 6: Settings Page (Day 5)

### 6.1 Create Settings Tabs
- [ ] `app/(app)/settings/page.tsx` - Main page with tabs
- [ ] `app/(app)/settings/components/profile-tab.tsx`
- [ ] `app/(app)/settings/components/training-tab.tsx`
- [ ] `app/(app)/settings/components/equipment-tab.tsx`
- [ ] `app/(app)/settings/components/lifestyle-tab.tsx`
- [ ] `app/(app)/settings/components/preferences-tab.tsx` - With theme toggle

### 6.2 Test Settings
- [ ] All tabs work
- [ ] Theme toggle works
- [ ] Accent color picker works
- [ ] Form validation works
- [ ] Saves to database

**Deliverable:** Complete settings page

---

## Phase 7: Polish & Testing (Day 6)

### 7.1 Cross-Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 7.2 Accessibility Audit
- [ ] Keyboard navigation works everywhere
- [ ] Screen reader friendly
- [ ] ARIA labels correct
- [ ] Focus states visible

### 7.3 Performance Optimization
- [ ] Images optimized (Next.js Image)
- [ ] Code splitting (dynamic imports)
- [ ] No layout shifts (proper skeletons)
- [ ] Fast page loads

### 7.4 Final Checks
- [ ] Run `npm run build` - passes
- [ ] Run `npm run type-check` - passes
- [ ] Run `npm run lint` - passes
- [ ] Pre-commit hook validates
- [ ] No console errors
- [ ] No hardcoded values

**Deliverable:** Production-ready app

---

## Phase 8: Deployment & Documentation (Day 7)

### 8.1 Update Documentation
- [ ] Update README.md with new tech stack
- [ ] Document component usage
- [ ] Add screenshots to docs

### 8.2 Deploy to Production
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Verify everything works
- [ ] Monitor for errors

**Deliverable:** Deployed, documented app

---

## Success Criteria

### Technical
- ✅ Zero hardcoded colors, spacing, or values
- ✅ TypeScript strict mode with no `any` types
- ✅ 100% mobile responsive (375px+)
- ✅ Light/dark theme works everywhere
- ✅ 44px minimum touch targets
- ✅ Accessible (keyboard nav, screen readers)
- ✅ Fast (good Lighthouse scores)

### User Experience
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation
- ✅ Clear visual hierarchy
- ✅ Helpful loading states
- ✅ Clear error messages
- ✅ Feels fun and energetic

### Code Quality
- ✅ All tests pass
- ✅ Pre-commit hooks validate
- ✅ Clean component structure
- ✅ Well documented
- ✅ Easy to maintain

---

## Daily Workflow

### Each Morning:
1. Review yesterday's work
2. Read today's phase goals
3. Read PRE_BUILD_CHECKLIST.md
4. Start building

### Each Component:
1. Plan the component
2. Check if variants exist
3. Build using tokens/variants only
4. Test in both themes
5. Test on mobile
6. Commit (hook validates)

### Each Evening:
1. Review completed work
2. Update this plan (mark completed)
3. Plan tomorrow's work

---

## Current Status

**Phase:** 1 - Design System Setup ✅ COMPLETE
**Next Phase:** 2 - Dashboard Page
**Next Task:** Plan dashboard features and create components
**Blockers:** None
**Notes:**
- Design system foundation is complete and working!
- Theme switching (light/dark) with next-themes ✅
- All base components created (Button, Card, Badge, Skeleton) ✅
- Centralized design tokens and variants ✅
- Test page available at `/test-theme` ✅
- Ready to start building dashboard page!
