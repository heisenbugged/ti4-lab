import { Group, Title } from "@mantine/core";

import classes from "./Logo.module.css";

export function Logo() {
  return (
    <Group align="center" gap="xs" className={classes.logo}>
      <img src="/logo.webp" style={{ width: 40 }} alt="TI4 Lab logo" />
      <Title fw="bolder" order={3}>
        TI4 Lab
      </Title>
    </Group>
  );
}
