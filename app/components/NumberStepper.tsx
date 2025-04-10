import { Button, Group, Text } from "@mantine/core";

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
    <Group gap={value !== undefined ? "sm" : 2}>
      <Button
        size="compact-md"
        color="red"
        variant="filled"
        disabled={decreaseDisabled}
        onMouseDown={decrease}
      >
        -
      </Button>
      {value !== undefined ? <Text>{value}</Text> : undefined}
      <Button
        size="compact-md"
        color="green"
        variant="filled"
        disabled={increaseDisabled}
        onMouseDown={increase}
      >
        +
      </Button>
    </Group>
  );
}
