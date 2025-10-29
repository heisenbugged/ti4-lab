import { ReactNode } from "react";
import { Group, Title } from "@mantine/core";
import classes from "./SectionHeader.module.css";

export interface SectionHeaderProps {
  title: string;
  sticky?: boolean;
  actions?: ReactNode;
}

export function SectionHeader({ title, sticky, actions }: SectionHeaderProps) {
  const Wrapper = sticky ? "div" : "div";
  const wrapperProps = sticky
    ? { style: { position: "sticky" as const, top: 60, zIndex: 11 } }
    : {};

  return (
    <Wrapper {...wrapperProps}>
      <Group className={classes.section} justify="space-between" px="sm" py="sm">
        <Title order={3}>{title}</Title>
        {actions}
      </Group>
    </Wrapper>
  );
}
