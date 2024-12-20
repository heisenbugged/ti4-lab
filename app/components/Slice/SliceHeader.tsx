import { Group } from "@mantine/core";

import classes from "./Slice.module.css";

type Props = {
  selected?: boolean;
  children: React.ReactNode;
  right?: React.ReactNode;
};

export function SliceHeader({ children, right, selected = false }: Props) {
  return (
    <Group className={`${classes.header} ${selected ? classes.selected : ""}`}>
      <Group gap={2} flex={1}>
        {children}
      </Group>
      {right}
    </Group>
  );
}
