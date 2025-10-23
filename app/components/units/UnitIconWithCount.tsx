import { Box, Image, Text } from "@mantine/core";
import styles from "./UnitIconWithCount.module.css";

type Props = {
  unit: string; // filename without extension, e.g. "carrier"
  count: number;
  size?: number; // square px
};

export function UnitIconWithCount({ unit, count, size = 28 }: Props) {
  const src = `/units/${unit}.png`;
  return (
    <Box
      className={styles.iconWrapper}
      w={size}
      h={size}
      style={{ display: "inline-block" }}
    >
      <Image src={src} w={size} h={size} alt={unit} fit="contain" />
      <Text className={styles.count} fz={Math.round(size * 0.6)}>
        {count}
      </Text>
    </Box>
  );
}
