import { Box, Group, Switch, Text, ActionIcon } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { ReactNode } from "react";

type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Optional numeric value that appears when switch is on */
  numericValue?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  /** Optional content to show when expanded/checked */
  children?: ReactNode;
};

export function CompactSwitch({
  label,
  description,
  checked,
  onChange,
  disabled,
  numericValue,
  onIncrease,
  onDecrease,
  increaseDisabled,
  decreaseDisabled,
  children,
}: Props) {
  const showStepper =
    checked && numericValue !== undefined && onIncrease && onDecrease;

  return (
    <Box
      py={6}
      style={{
        borderBottom: "1px dashed var(--mantine-color-default-border)",
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} lh={1.3}>
            {label}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" lh={1.3} mt={2}>
              {description}
            </Text>
          )}
        </Box>

        <Group gap="xs" wrap="nowrap">
          {showStepper && (
            <Group gap={2} wrap="nowrap">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                disabled={decreaseDisabled}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onDecrease();
                }}
              >
                <IconMinus size={14} />
              </ActionIcon>

              <Text size="sm" fw={600} ta="center" miw={24} c="purple.3">
                {numericValue}
              </Text>

              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                disabled={increaseDisabled}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onIncrease();
                }}
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Group>
          )}

          <Switch
            size="sm"
            checked={checked}
            onChange={(e) => onChange(e.currentTarget.checked)}
            disabled={disabled}
          />
        </Group>
      </Group>

      {checked && children && <Box mt="xs">{children}</Box>}
    </Box>
  );
}
