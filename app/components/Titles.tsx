import { Title, TitleProps } from "@mantine/core";

const Slice = ({ children, ...rest }: { children: string } & TitleProps) => (
  <Title order={4} fw={700} size="md" {...rest}>
    {children}
  </Title>
);

const Player = ({ children, ...rest }: { children: string } & TitleProps) => (
  <Title order={4} ta="center" fw={700} c="violet.9" {...rest}>
    {children}
  </Title>
);

export const Titles = {
  Slice,
  Player,
};
