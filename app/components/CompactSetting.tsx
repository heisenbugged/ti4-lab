import { Box, Group, Text, ActionIcon } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

export interface CompactSettingProps<T extends string> {
  label: string;
  description?: string;
  property: T;
  value: number | undefined;
  onChange: (property: T, value: number | undefined) => void;
  defaultValue?: number;
  allowUndefined?: boolean;
  minValue?: number;
}

export function CompactSetting<T extends string>({
  label,
  description,
  property,
  value,
  onChange,
  defaultValue,
  allowUndefined = false,
  minValue,
}: CompactSettingProps<T>) {
  const handleDecrease = () => {
    if (value === undefined) return;

    if (minValue !== undefined) {
      onChange(property, Math.max(minValue, value - 1));
      return;
    }

    const newValue = value - 1;
    if (newValue <= 0 && allowUndefined) {
      onChange(property, undefined);
    } else {
      onChange(property, Math.max(0, newValue));
    }
  };

  const handleIncrease = () => {
    if (value === undefined) {
      onChange(property, defaultValue ?? minValue ?? 0);
    } else {
      onChange(property, value + 1);
    }
  };

  const decreaseDisabled =
    value === undefined ||
    (minValue !== undefined && value <= minValue) ||
    (!allowUndefined && value <= 0);

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      gap="xs"
      py={4}
      style={{
        borderBottom: "1px dashed var(--mantine-color-default-border)",
      }}
    >
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

      <Group gap={2} wrap="nowrap">
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          disabled={decreaseDisabled}
          onMouseDown={handleDecrease}
        >
          <IconMinus size={14} />
        </ActionIcon>

        <Text
          size="sm"
          fw={600}
          ta="center"
          miw={28}
          c={value !== undefined ? "purple.3" : "dimmed"}
          fs={value === undefined ? "italic" : undefined}
        >
          {value !== undefined ? value : "off"}
        </Text>

        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          onMouseDown={handleIncrease}
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
