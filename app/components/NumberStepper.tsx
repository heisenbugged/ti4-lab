import { Button, Group, Text, Tooltip } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

type Props = {
  value?: number;
  decrease: (e: React.MouseEvent<HTMLButtonElement>) => void;
  increase: (e: React.MouseEvent<HTMLButtonElement>) => void;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
  forcedValue?: number;
  disabledTooltip?: string;
};

export function NumberStepper({
  value,
  decrease,
  increase,
  decreaseDisabled,
  increaseDisabled,
  forcedValue,
  disabledTooltip,
}: Props) {
  const val = forcedValue ?? value;

  const content = (
    <Group gap={val !== undefined ? "sm" : 2}>
      <Button
        size="compact-md"
        color="red"
        variant="filled"
        disabled={decreaseDisabled}
        onMouseDown={decrease}
      >
        -
      </Button>
      {val !== undefined ? <Text>{val}</Text> : undefined}
      <Button
        size="compact-md"
        color="green"
        variant="filled"
        disabled={increaseDisabled}
        onMouseDown={increase}
      >
        <IconPlus size={14} />
      </Button>
    </Group>
  );

  if (disabledTooltip) {
    return (
      <Tooltip label={disabledTooltip} withArrow>
        <div>{content}</div>
      </Tooltip>
    );
  }

  return content;
}
