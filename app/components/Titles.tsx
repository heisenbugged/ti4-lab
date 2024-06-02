import { Title, TitleProps } from "@mantine/core";

const Slice = ({ children, ...rest }: { children: string } & TitleProps) => (
  <Title order={4} fw="bold" {...rest}>
    {children}
  </Title>
);

const Player = ({ children, ...rest }: { children: string } & TitleProps) => (
  <Title order={4} ta="center" c="violet.9" {...rest}>
    {children}
  </Title>
);

export const Titles = {
  Slice,
  Player,
};
