import { Box, Group, Text } from "@mantine/core";
import { NumberStepper } from "~/components/NumberStepper";

export interface SettingStepperProps<T extends string> {
  label: string;
  description?: string;
  property: T;
  value: number | undefined;
  onChange: (property: T, value: number | undefined) => void;
  defaultValue?: number;
  allowUndefined?: boolean;
  minValue?: number;
}

export function SettingStepper<T extends string>({
  label,
  description,
  property,
  value,
  onChange,
  defaultValue,
  allowUndefined = false,
  minValue,
}: SettingStepperProps<T>) {
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
  const increaseDisabled = false;

  return (
    <Group>
      <Box style={{ maxWidth: description ? "75%" : undefined }}>
        <Text>{label}</Text>
        {description && (
          <Text size="xs" color="dimmed">
            {description}
          </Text>
        )}
      </Box>
      <NumberStepper
        value={value}
        decrease={handleDecrease}
        increase={handleIncrease}
        decreaseDisabled={decreaseDisabled}
        increaseDisabled={increaseDisabled}
      />
    </Group>
  );
}
