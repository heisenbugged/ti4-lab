import { Group } from "@mantine/core";

type Props = {
  selected?: boolean;
  children: React.ReactNode;
  right?: React.ReactNode;
};

export function SliceHeader({ children, right, selected = false }: Props) {
  return (
    <Group
      gap={0}
      align="center"
      justify="space-between"
      bg={selected ? "gray.3" : "spaceBlue"}
      py="xs"
      px="lg"
      style={{
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottom: "1px solid #e1e1e1",
      }}
    >
      <Group gap={2}>{children}</Group>
      {right}
    </Group>
  );
}
