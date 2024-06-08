import { Text } from "@mantine/core";

type Props = {
  id: number;
  size: string;
  scale: number;
};

export function SystemId({ id, size, scale }: Props) {
  return (
    <Text size={size} c="white" pos="absolute" top={15 * scale} fw="bolder">
      {id}
    </Text>
  );
}
