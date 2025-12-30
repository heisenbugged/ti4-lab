import { ActionIcon, Group, Text } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

type Props = {
  value?: number;
  decrease: (e: React.MouseEvent<HTMLButtonElement>) => void;
  increase: (e: React.MouseEvent<HTMLButtonElement>) => void;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
};

export function NumberStepper({
  value,
  decrease,
  increase,
  decreaseDisabled,
  increaseDisabled,
}: Props) {
  return (
    <Group gap={4}>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        disabled={decreaseDisabled}
        onMouseDown={decrease}
      >
        <IconMinus size={14} />
      </ActionIcon>
      {value !== undefined && (
        <Text size="sm" fw={600} miw={20} ta="center" c="purple.3">
          {value}
        </Text>
      )}
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        disabled={increaseDisabled}
        onMouseDown={increase}
      >
        <IconPlus size={14} />
      </ActionIcon>
    </Group>
  );
}
