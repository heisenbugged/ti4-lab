import { Box, Group, HoverCard, Stack, Text } from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { Slice } from "~/types";
import { SliceValueBreakdown, useSliceValueBreakdown } from "~/hooks/useSliceValueBreakdown";

type Props = {
  slice?: Slice;
  breakdown?: SliceValueBreakdown;
  title?: string;
  /** Use light variant for dark backgrounds, dark variant for light backgrounds */
  variant?: "light" | "dark";
};

function formatValue(value: number, showSign = false): string {
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
  if (showSign && value > 0) return `+${formatted}`;
  if (showSign && value < 0) return formatted; // negative already has sign
  return formatted;
}

export function SliceValuePopover({ slice, breakdown: providedBreakdown, title = "Slice Value", variant = "light" }: Props) {
  const computedBreakdown = useSliceValueBreakdown(slice);
  const breakdown = providedBreakdown ?? computedBreakdown;

  if (!breakdown) return null;

  // Separate positive modifiers (bonuses) from negative modifiers (penalties)
  const bonuses = breakdown.modifiers.filter((mod) => mod.value >= 0);
  const penalties = breakdown.modifiers.filter((mod) => mod.value < 0);

  const hasBonuses = bonuses.length > 0;
  const hasPenalties = penalties.length > 0;
  const hasEquidistant = breakdown.equidistantPenalty !== null;
  const hasAnyPenalty = hasPenalties || hasEquidistant;

  // Icon colors based on variant - dark variant for light backgrounds (like green home tiles)
  const iconColor = variant === "dark"
    ? "rgba(0, 0, 0, 0.55)"
    : "rgba(255, 255, 255, 0.7)";

  return (
    <HoverCard
      width={260}
      position="top"
      withArrow
      shadow="md"
      openDelay={100}
      closeDelay={50}
    >
      <HoverCard.Target>
        <Box
          component="span"
          style={{
            cursor: "help",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
        >
          <IconInfoCircleFilled
            size={14}
            color={iconColor}
            style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" }}
          />
        </Box>
      </HoverCard.Target>

      <HoverCard.Dropdown
        style={{
          background: "var(--mantine-color-body)",
          border: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Stack gap={0}>
          {/* Header */}
          <Group
            justify="space-between"
            pb="xs"
            mb="xs"
            style={{
              borderBottom: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              c="dimmed"
              style={{ fontFamily: "Orbitron", letterSpacing: "0.05em" }}
            >
              {title}
            </Text>
            <Text size="sm" fw={700} c="yellow.5">
              {formatValue(breakdown.total)}
            </Text>
          </Group>

          {/* Base Optimal */}
          <Box
            pb="xs"
            mb={(hasBonuses || hasAnyPenalty) ? "xs" : 0}
            style={{
              borderBottom: (hasBonuses || hasAnyPenalty)
                ? "1px dashed var(--mantine-color-default-border)"
                : "none",
            }}
          >
            <Text size="xs" c="dimmed" fw={500} mb={4}>
              Base Optimal
            </Text>
            <Group justify="space-between" gap="xs">
              <Text size="xs">
                <Text component="span" c="orange.5">R</Text>
                <Text component="span" c="dimmed">+</Text>
                <Text component="span" c="blue.5">I</Text>
                <Text component="span" c="dimmed">+</Text>
                <Text component="span" c="violet.5">F</Text>
                <Text component="span" c="dimmed" size="xs" ml={4}>
                  ({breakdown.optimal.resources}+{breakdown.optimal.influence}+{breakdown.optimal.flex})
                </Text>
              </Text>
              <Text size="xs" fw={600} ff="monospace">
                {formatValue(breakdown.optimal.sum)}
              </Text>
            </Group>
          </Box>

          {/* Bonuses (positive modifiers) */}
          {hasBonuses && (
            <Box
              pb={hasAnyPenalty ? "xs" : 0}
              mb={hasAnyPenalty ? "xs" : 0}
              style={{
                borderBottom: hasAnyPenalty
                  ? "1px dashed var(--mantine-color-default-border)"
                  : "none",
              }}
            >
              <Text size="xs" c="dimmed" fw={500} mb={4}>
                Bonuses
              </Text>
              <Stack gap={2}>
                {bonuses.map((mod, idx) => (
                  <Group key={idx} justify="space-between" gap="xs">
                    <Text size="xs">
                      {mod.label}
                      {mod.count !== undefined && (
                        <Text component="span" c="dimmed" size="xs">
                          {" "}({mod.count})
                        </Text>
                      )}
                    </Text>
                    <Text size="xs" fw={600} ff="monospace" c="green.5">
                      {formatValue(mod.value, true)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Box>
          )}

          {/* Penalties (negative modifiers + equidistant) */}
          {hasAnyPenalty && (
            <Box>
              <Text size="xs" c="dimmed" fw={500} mb={4}>
                Penalties
              </Text>
              <Stack gap={2}>
                {penalties.map((mod, idx) => (
                  <Group key={idx} justify="space-between" gap="xs">
                    <Text size="xs">
                      {mod.label}
                    </Text>
                    <Text size="xs" fw={600} ff="monospace" c="red.4">
                      {formatValue(mod.value, true)}
                    </Text>
                  </Group>
                ))}
                {hasEquidistant && (
                  <Group justify="space-between" gap="xs">
                    <Text size="xs">
                      {/* Show percentage only if using fixed multiplier system (multiplier != 1) */}
                      {breakdown.equidistantMultiplier !== 1
                        ? `Equidistant (${Math.round((1 - breakdown.equidistantMultiplier) * 100)}%)`
                        : "Equidistant"}
                    </Text>
                    <Text size="xs" fw={600} ff="monospace" c="red.4">
                      {formatValue(-breakdown.equidistantPenalty!, true)}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
