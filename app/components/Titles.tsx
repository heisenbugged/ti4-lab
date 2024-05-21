import { Text, TextProps, Title, TitleProps } from "@mantine/core";

const Slice = ({ children, ...rest }: { children: string } & TitleProps) => (
  <Title order={4} c="gray.8" fw="bold" {...rest}>
    {children}
  </Title>
);

const Player = ({ children, ...rest }: { children: string } & TextProps) => (
  <Text ta="center" lh={1} c="violet.9" fw="bold" tt="uppercase" {...rest}>
    {children}
  </Text>
);

export const Titles = {
  Slice,
  Player,
};