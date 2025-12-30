import { Group, Text } from "@mantine/core";

import classes from "./Logo.module.css";

export function Logo() {
  return (
    <Group align="center" gap="xs" className={classes.logo}>
      <img src="/logo.webp" style={{ width: 32 }} alt="TI4 Lab logo" />
      <Text
        fw={700}
        size="sm"
        tt="uppercase"
        style={{
          fontFamily: "Orbitron",
          letterSpacing: "0.05em",
        }}
      >
        TI4 Lab
      </Text>
    </Group>
  );
}
