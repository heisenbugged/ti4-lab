import { Box, Button, Group, Text, MantineColor, Tooltip } from "@mantine/core";
import { IconArrowBackUp } from "@tabler/icons-react";

type SimultaneousPhaseHeaderProps = {
  phaseName: string;
  phaseColor: MantineColor;
  description: string;
  adminMode: boolean;
  onAdminToggle: () => void;
  showPickForAnyoneControl: boolean;
  pickForAnyone: boolean;
  onTogglePickForAnyone: () => void;
  showUndo: boolean;
  onUndoPick: () => void;
  onUndoPhase: () => void;
  undoPickDisabled: boolean;
  undoPhaseDisabled: boolean;
  showPickAnyWarning?: boolean;
};

export function SimultaneousPhaseHeader({
  phaseName,
  phaseColor,
  description,
  adminMode,
  onAdminToggle,
  showPickForAnyoneControl,
  pickForAnyone,
  onTogglePickForAnyone,
  showUndo,
  onUndoPick,
  onUndoPhase,
  undoPickDisabled,
  undoPhaseDisabled,
  showPickAnyWarning = false,
}: SimultaneousPhaseHeaderProps) {
  return (
    <Box
      style={{
        borderBottom: "1px solid var(--mantine-color-dark-4)",
      }}
    >
      <Group justify="space-between" align="center" px="md" py="sm">
        <Group gap="sm">
          <Text
            size="sm"
            fw={600}
            tt="uppercase"
            style={{
              letterSpacing: "0.04em",
              color: `var(--mantine-color-${phaseColor}-4)`,
            }}
          >
            {phaseName}
          </Text>
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        </Group>
        <Group gap={4}>
          <Button
            size="compact-xs"
            variant={adminMode ? "filled" : "default"}
            color={adminMode ? "violet" : "gray"}
            onClick={onAdminToggle}
          >
            Admin
          </Button>
          {showPickForAnyoneControl && (
            <Tooltip
              label="Reveals hidden information. Use with caution."
              color="orange"
              withArrow
              position="bottom"
              disabled={!showPickAnyWarning}
            >
              <Button
                size="compact-xs"
                variant={pickForAnyone ? "filled" : "default"}
                color={pickForAnyone ? (showPickAnyWarning ? "orange" : "violet") : "gray"}
                onClick={onTogglePickForAnyone}
              >
                Pick Any
              </Button>
            </Tooltip>
          )}
          {showUndo && (
            <>
              <Button
                size="compact-xs"
                variant="subtle"
                color="red"
                leftSection={<IconArrowBackUp size={12} />}
                onClick={onUndoPick}
                disabled={undoPickDisabled}
              >
                Undo Pick
              </Button>
              <Button
                size="compact-xs"
                variant="subtle"
                color="red"
                leftSection={<IconArrowBackUp size={12} />}
                onClick={onUndoPhase}
                disabled={undoPhaseDisabled}
              >
                Undo Phase
              </Button>
            </>
          )}
        </Group>
      </Group>
    </Box>
  );
}
