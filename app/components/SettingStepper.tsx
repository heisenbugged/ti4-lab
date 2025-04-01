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
}

export function SettingStepper<T extends string>({
  label,
  description,
  property,
  value,
  onChange,
  defaultValue,
  allowUndefined = false,
}: SettingStepperProps<T>) {
  const handleDecrease = () => {
    if (value === undefined) return;

    if (value <= 0 && allowUndefined) {
      onChange(property, undefined);
    } else {
      onChange(property, Math.max(0, value - 1));
    }
  };

  const handleIncrease = () => {
    if (value === undefined) {
      onChange(property, defaultValue || 0);
    } else {
      onChange(property, value + 1);
    }
  };

  const decreaseDisabled =
    value === undefined || (!allowUndefined && value <= 0);
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
