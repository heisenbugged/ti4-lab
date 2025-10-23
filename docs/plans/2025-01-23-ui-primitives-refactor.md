# UI Primitives Refactor

**Date:** 2025-01-23
**Status:** Design Complete
**Estimated Effort:** 6 days

## Problem Statement

The codebase has significant duplication across UI components:
- **12 files** repeat the same `className` chain: `${classes.surface} ${classes.withBorder} ${classes.hoverable} ${classes[playerColor]}`
- **4 card components** implement nearly identical two-part card patterns with different sizing
- **100+ lines** of player color CSS duplicated across 3 module files
- **10 section components** repeat the same header + actions pattern
- No standardized component library for project-specific patterns

## Goals

1. **Reduce duplication** - Consolidate repeated styling patterns into reusable primitives
2. **Improve type safety** - Standardize component APIs with TypeScript
3. **Standardize component patterns** - Create consistent UI patterns across the app

## Solution: UI Primitives Library

Create `app/ui/` directory with 6 styled components that encapsulate common patterns.

### Component Specifications

#### 1. Surface

**Purpose:** Replaces repetitive className chains for surface styling

**API:**
```tsx
interface SurfaceProps extends ComponentPropsWithoutRef<'div'> {
  variant?: "card" | "interactive" | "badge" | "flat";
  color?: PlayerColor;
  children: ReactNode;
}
```

**Variants:**
- `card` - Static bordered surface (default)
- `interactive` - Bordered surface with hover effects
- `badge` - Colored background without border
- `flat` - Background color only

**Usage:**
```tsx
// Before
<Stack className={`${classes.surface} ${classes.withBorder} ${classes.hoverable} ${classes.blue}`}>

// After
<Surface variant="interactive" color="blue">
```

**Files to migrate:** 12 files with surface className chains

---

#### 2. SelectableCard

**Purpose:** Two-part card with header/body and absolute-positioned actions

**API:**
```tsx
interface SelectableCardProps {
  selected?: boolean;
  selectedColor?: PlayerColor;
  hoverable?: boolean;
  onSelect?: () => void;
  header: ReactNode;
  body: ReactNode;
}
```

**Features:**
- Header: rounded top corners, flat bottom
- Body: flat top, rounded bottom corners, no top border
- Automatic action slot positioning (absolute top-right)
- Player color border when selected

**Usage:**
```tsx
<SelectableCard
  selected={!!player}
  selectedColor={playerColor}
  hoverable
  onSelect={handleSelect}
  header={
    <>
      <FactionIcon faction={faction.id} />
      <Text>{faction.name}</Text>
      <PlayerChipOrSelect player={player} />
    </>
  }
  body={<FactionHelpInfo faction={faction} />}
/>
```

**Files to migrate:**
- `app/routes/draft.$id/components/DraftableFaction.tsx`
- `app/routes/draft.$id/components/CompactReferenceCard.tsx`
- `app/routes/draft.$id/components/DraftableReferenceCard.tsx`
- `app/routes/draft.new/components/NewDraftReferenceCard.tsx`

---

#### 3. OptionCard

**Purpose:** Hover-lift selection card with transitions

**API:**
```tsx
interface OptionCardProps {
  title: string;
  description: string;
  checked: boolean;
  icon?: ReactNode;
  onSelect: () => void;
  children?: ReactNode; // optional footer
}
```

**Styling:**
- Hover lift effect: `translateY(-2px)`
- Border color change on hover
- Description opacity transition (0.7 → 1.0)
- Active state: blue background + border

**Usage:**
```tsx
<OptionCard
  title="Milty Draft"
  description="Standard balanced draft"
  checked={selected}
  icon={<IconDice />}
  onSelect={handleSelect}
>
  <Badge>6 players</Badge>
</OptionCard>
```

**Files to migrate:**
- `app/components/HoverRadioCard.tsx` (move to ui/)

---

#### 4. SliceCard

**Purpose:** Multi-section card with player color theming

**API:**
```tsx
interface SliceCardProps {
  name: string;
  playerColor?: PlayerColor;
  editable?: boolean;
  onNameChange?: (name: string) => void;
  header?: ReactNode;
  stats: ReactNode;
  features: ReactNode;
  children: ReactNode; // map content
}
```

**Sections:**
- **Header:** Player color background (10% opacity mix), rounded top
- **Stats:** Resource/influence display, gray background
- **Map:** Transparent/dark background for hex grid
- **Features:** Inset shadow, darker background, rounded bottom

**Styling:**
- 8 player color variants with border + background
- Text contrast adjustments per color
- Editable name input styling

**Usage:**
```tsx
<SliceCard
  name="Slice Alpha"
  playerColor="blue"
  editable={adminMode}
  onNameChange={handleNameChange}
  header={<Button>Select</Button>}
  stats={<PlanetStatsPill resources={3} influence={2} />}
  features={<SliceFeatures slice={slice} />}
>
  <SliceMap tiles={slice.tiles} />
</SliceCard>
```

**Files to migrate:**
- `app/components/Slice/BaseSlice.tsx` (consolidate with new component)
- `app/routes/draft.$id/components/DraftableSlice.tsx`
- `app/routes/draft.new/components/BuildableSlice.tsx`

---

#### 5. NotificationBanner

**Purpose:** Fixed or relative colored banner with subtitle

**API:**
```tsx
interface NotificationBannerProps {
  color: PlayerColor;
  title: string;
  subtitle?: string;
  position?: "fixed" | "relative";
  children?: ReactNode;
}
```

**Styling:**
- Position: `fixed` (top: 60px, z-index: 90) or `relative`
- Height: 60px
- Bottom border: 4px
- Color transitions: 500ms ease-in-out
- Subtitle badge with player color background
- 8 player color variants

**Usage:**
```tsx
<NotificationBanner
  color={playerColors[activePlayer.id]}
  title={`It's ${activePlayer.name}'s turn to pick!`}
  subtitle={lastEvent}
  position="fixed"
/>
```

**Files to migrate:**
- `app/routes/draft.$id/components/CurrentPickBanner.tsx`

---

#### 6. SectionHeader

**Purpose:** Section title with actions, optional sticky positioning

**API:**
```tsx
interface SectionHeaderProps {
  title: string;
  sticky?: boolean;
  actions?: ReactNode;
}
```

**Styling:**
- Background: spaceBlue-1/dark-7
- Border bottom
- Rounded top-left corner
- Sticky: `position: sticky, top: 60px, z-index: 11`

**Usage:**
```tsx
<SectionHeader
  title="Available Factions"
  sticky
  actions={
    <Group>
      <Button>Randomize</Button>
      <NumberStepper />
    </Group>
  }
/>
```

**Files to migrate:**
- Enhance existing `app/components/Section.tsx`
- Update 10 section files to use new API

---

## Implementation Plan

### Phase 1: Foundation (Days 1-2)

**Day 1: Setup + Core Components**
1. Create `app/ui/` directory structure
2. Implement Surface component
   - Create `Surface.tsx` + `Surface.module.css`
   - Move relevant styles from `components/Surface.module.css`
   - Add PlayerColor type to `ui/types.ts`
3. Implement OptionCard
   - Move HoverRadioCard to `ui/OptionCard.tsx`
   - Update imports in existing files

**Day 2: Card Components**
4. Implement SelectableCard
   - Create component with header/body slots
   - Extract two-part card border radius styles
   - Handle absolute action positioning
5. Implement NotificationBanner
   - Move CurrentPickBanner styles
   - Add position prop
6. Create barrel export `ui/index.ts`

### Phase 2: Complex Components (Day 3)

**Day 3: SliceCard + SectionHeader**
7. Implement SliceCard
   - Consolidate BaseSlice styles
   - Move 100+ lines of player color CSS
   - Create multi-section layout
8. Enhance SectionHeader
   - Add sticky positioning
   - Update Section component

### Phase 3: Migration (Days 4-5)

**Day 4: High-Impact Migrations**
9. Migrate SelectableCard usage (4 files)
   - DraftableFaction
   - CompactReferenceCard
   - DraftableReferenceCard
   - NewDraftReferenceCard
10. Migrate Surface usage (6 files)
    - DraftableFactionsSection
    - DraftablePlayerColorsSection
    - DraftableMinorFactionsSection
    - NewDraftFaction
    - 2 other high-usage files

**Day 5: Remaining Migrations**
11. Migrate remaining Surface usage (6 files)
12. Migrate SliceCard usage (3 files)
13. Migrate SectionHeader usage (10 files)

### Phase 4: Cleanup (Day 6)

**Day 6: Consolidation**
14. Remove duplicate CSS from old modules
15. Update Section component integration
16. Verify all imports updated
17. Remove unused className chains
18. Run build + verify no type errors

---

## Directory Structure

```
app/ui/
  Surface.tsx
  Surface.module.css
  SelectableCard.tsx
  SelectableCard.module.css
  OptionCard.tsx
  OptionCard.module.css
  SliceCard.tsx
  SliceCard.module.css
  NotificationBanner.tsx
  NotificationBanner.module.css
  SectionHeader.tsx
  SectionHeader.module.css
  types.ts              # PlayerColor, shared types
  index.ts              # Barrel export
```

---

## Migration Examples

### Surface Migration

**Before:**
```tsx
<Stack
  className={`${classes.surface} ${classes.withBorder} ${classes.hoverable} ${classes.blue}`}
  px="sm"
  py={8}
>
  {content}
</Stack>
```

**After:**
```tsx
<Surface variant="interactive" color="blue">
  <Stack px="sm" py={8}>
    {content}
  </Stack>
</Surface>
```

### SelectableCard Migration

**Before:**
```tsx
<Stack gap={0}>
  <Stack
    gap={4}
    px="sm"
    py={8}
    className={`${classes.surface} ${classes.withBorder} ${classes.hoverable} ${playerColor ? classes[playerColor] : ""}`}
    style={{
      borderRadius: "var(--mantine-radius-md)",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }}
    onClick={onSelect}
  >
    <Group>
      <FactionIcon />
      <Text>{faction.name}</Text>
    </Group>
    <PlayerChipOrSelect player={player} onSelect={onSelect} />
  </Stack>
  <Box
    className={`${classes.surface} ${classes.withBorder}`}
    style={{
      borderRadius: "0 0 var(--mantine-radius-md) var(--mantine-radius-md)",
      borderTop: 0,
    }}
  >
    <FactionHelpInfo faction={faction} />
  </Box>
</Stack>
```

**After:**
```tsx
<SelectableCard
  selected={!!player}
  selectedColor={playerColor}
  hoverable
  onSelect={onSelect}
  header={
    <>
      <FactionIcon />
      <Text>{faction.name}</Text>
      <PlayerChipOrSelect player={player} />
    </>
  }
  body={<FactionHelpInfo faction={faction} />}
/>
```

### SectionHeader Migration

**Before:**
```tsx
<Section>
  <div style={{ position: "sticky", top: 60, zIndex: 11 }}>
    <Group className={classes.section} justify="space-between" px="sm" py="sm">
      <Title order={3}>Available Factions</Title>
      <Button>Randomize</Button>
    </Group>
  </div>
  <SimpleGrid>...</SimpleGrid>
</Section>
```

**After:**
```tsx
<Section>
  <SectionHeader
    title="Available Factions"
    sticky
    actions={<Button>Randomize</Button>}
  />
  <SimpleGrid>...</SimpleGrid>
</Section>
```

---

## Success Metrics

**Code Reduction:**
- 12 files with Surface className chains → `<Surface variant="...">`
- 4 card components → `<SelectableCard>`
- 10 section files → `<SectionHeader sticky>`
- ~150 lines of duplicate player color CSS → Single source
- **Estimated net reduction:** ~400 lines of code

**Consistency:**
- Standardized player color theming across 6 components
- Consistent border radius patterns (no more inline styles)
- Type-safe component APIs

**Maintainability:**
- Single source of truth for UI patterns
- Easier to add new features (new player colors, etc.)
- Clear component hierarchy

---

## Risks & Mitigations

**Risk:** Breaking existing styling during migration
**Mitigation:** Migrate incrementally, test each component visually

**Risk:** Props mismatch between old and new APIs
**Mitigation:** TypeScript will catch at compile time, review each migration

**Risk:** CSS specificity conflicts
**Mitigation:** Use CSS modules, maintain same specificity as original

---

## Future Enhancements

After this refactor, additional improvements could include:
1. Consolidate draft configs (separate effort)
2. Extract common hook patterns (useDraftSelection)
3. Create compound component patterns for modals
4. Add Storybook documentation for UI primitives

---

## Approval

Ready to proceed with implementation?
