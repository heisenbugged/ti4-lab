# TI4 Lab design system (`~/ui`)

Behaviour comes from **Base UI** (`@base-ui/react`); the look comes from our tokens and CSS modules.
The visual reference is the design artifact (Deep space theme, Saira type, chamfered plates, gold commit, ion links).
Import everything from `~/ui`. Mantine and PostCSS have been removed; plain CSS modules only.

## Rules

- **Colours, spacing, radii:** only CSS variables from `tokens.css` (`--hull`, `--rule`, `--text-muted`, `--gold`, `--ion`, `--space-3`…). No hex values in component CSS, except in map/tile art, which uses the `--pal-*` palette in `palette.css` so the production lab art looks exactly as before.
- **Gold appears once per view as a fill:** the single primary `Button`. Selection is gold as a line (brackets, underline).
- **Player colours** are `--player-{blue|red|green|magenta|violet|orange|gray|cyan}` and identify players only.
- **Sentence case** for every label, button, tab and heading. No tracked all-caps labels.
- **Long player names** must truncate with an ellipsis (`Text truncate`, `PlayerTag`); never let them push layout.
- **Styling:** CSS modules next to the component (`Foo.module.css`), using tokens. Light theme is `[data-theme="light"]` on `<html>`; tokens handle it, so components rarely need theme selectors.
- **Breakpoints:** 576 / 768 / 992 / 1200 / 1408px (`xs sm md lg xl`). Use media queries in CSS modules or `Grid cols={{ base, sm, lg }}`.

## Components

| Need | Use |
|---|---|
| Vertical / horizontal flow | `Stack gap={0-8}`, `Row gap align justify wrap` |
| Responsive grid | `Grid cols={{ base: 1, sm: 2, lg: 3 }}` or `Grid minWidth={240}` |
| Text | `Text size="xs·sm·md·lg·xl" tone="muted·faint·danger·success·gold·ion" weight truncate lines numeric label` |
| Headings | `Heading variant="display·title·section·heading"` |
| Page section heading with actions | `SectionHeader title meta sticky>{actions}</SectionHeader>` |
| Buttons | `Button variant="primary·secondary·tertiary·danger·discord" size="sm·md·lg" icon iconRight block loading`; `ButtonLink` (router), `ButtonAnchor` (href) |
| Icon-only | `IconButton label variant="ghost·outline·danger·solid" size pressed` |
| Pick something | `PickButton selected tone="ion·minor·danger"` |
| Copy | `CopyButton value` |
| Panels | `Panel title icon iconTint action well flush collapsible defaultOpen summary` + `Rows` + `ListRow label hint` |
| Cards | `Card interactive selected playerColor off sunken padding`; `SelectableCard header body selected selectedColor pending onSelect` |
| Tables | `Table` with `Table.Thead/Tbody/Tr/Th/Td` (same shape as before) |
| Inputs | `TextInput label hint error leftIcon right accent size`, `Textarea mono`, `Select options value onChange`, `MultiSelect`, `NumberField`, `Slider` |
| Toggles | `Switch label description checked onChange`, `Checkbox …`, `RadioGroup options layout="list·cards"`, `Segmented options value onChange label block size`, `Chip pressed onChange` |
| Small counts | `NumberStepper value decrease increase decreaseDisabled increaseDisabled label size display` |
| Overlays | `Modal opened onClose title description footer size dismissible`, `Drawer`, `Popover trigger openOnHover side width title`, `Tooltip label`, `Menu trigger` + `MenuItem icon description checked danger` + `MenuSeparator` |
| Views | `Tabs items label value onChange variant="line·pills"` + `TabPanel value`; `Accordion items`; `Steps active items`; `Pagination` |
| Feedback | `notify({ title, message, tone })` (replaces `notifications.show`), `Notice tone title onClose`, `Tag tone icon`, `Count`, `Spinner`, `LoadingOverlay`, `Progress` |
| Game atoms | `PlayerHex color`, `PlayerTag color name letter`, `PlayerDot`, `ValuePill r i f total`, `Stat value label`, `NamePlate`, `Bracket` |
| Hooks | `useDisclosure`, `useMediaQuery`, `useLocalStorage`, `useClipboard`, `useTheme` |

## Converting from Mantine

| Mantine | `~/ui` |
|---|---|
| `Box` | `div` (or a semantic element) with a module class |
| `Group gap="xs"` | `Row gap={2}` (xs→2, sm→3, md→4, lg→5, xl→6) |
| `Stack gap="md"` | `Stack gap={4}` |
| `SimpleGrid cols={{ base:1, md:2 }}` | `Grid cols={{ base: 1, md: 2 }}` |
| `Grid` / `Grid.Col span` | CSS grid in the module, or `Grid cols` |
| `Text size="sm" c="dimmed" fw={600}` | `Text size="sm" tone="muted" weight={600}` |
| `Title order={2}` | `Heading variant="section"` |
| `Button variant="filled"` (the main action) | `Button variant="primary"` |
| `Button variant="default"/"light"/"outline"` | `Button` (secondary) |
| `Button variant="subtle"` | `Button variant="tertiary"` |
| `Button color="red"` | `Button variant="danger"` |
| `ActionIcon` | `IconButton label="…"` |
| `Badge` | `Tag` (or `PlayerTag` for a player) |
| `Paper` / `Card` / `Surface` | `Panel` or `Card` |
| `Modal opened onClose title` | `Modal opened onClose title footer` |
| `Tooltip label` | `Tooltip label` |
| `Popover` + `Target` + `Dropdown`, `HoverCard` | `Popover trigger={…} openOnHover?` |
| `Menu` | `Menu trigger` + `MenuItem` |
| `SegmentedControl data value onChange` | `Segmented options value onChange label` |
| `Switch/Checkbox onChange={(e) => …e.currentTarget.checked}` | `onChange={(checked) => …}` |
| `TextInput/Textarea/NumberInput/Select` | same names in `~/ui` (`NumberInput` → `NumberField`) |
| `Alert` | `Notice` |
| `Loader` | `Spinner` |
| `notifications.show({ title, message, color: "red" })` | `notify({ title, message, tone: "danger" })` |
| `useMantineTheme().colors.x[n]` | a token, or `var(--pal-x-n)` for map art |
| `var(--mantine-color-x-n)` in CSS | a token, or `var(--pal-x-n)` for map/tile art |
| `@mixin dark { … } @mixin light { … }` | default rule = dark, `:global([data-theme="light"]) .x { … }` for light |
| `visibleFrom="sm"` / `hiddenFrom="sm"` | media query in the module, or `Visible from/below` |
