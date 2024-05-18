import { Title } from "@mantine/core";

type Props = {
  children: string;
};

export function SliceTitle({ children }: Props) {
  return (
    <Title
      order={6}
      c="gray.8"
      tt="uppercase"
      bg="gray.3"
      py="xs"
      px="lg"
      mb="xs"
      fw="bold"
      style={{
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottom: "1px solid #e1e1e1",
      }}
    >
      {children}
    </Title>
  );
}
