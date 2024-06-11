import { Text } from "@mantine/core";
import { SystemId as SystemIdType } from "~/types";

type Props = {
  id: SystemIdType;
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
