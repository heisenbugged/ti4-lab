import { IconEye, IconMoon, IconSun } from "@tabler/icons-react";
import { IconButton, Row, useTheme } from "~/ui";

type Props = {
  accessibleColors: boolean;
  onAccessibleColorsChange: (value: boolean) => void;
};

export function HeaderControls({ accessibleColors, onAccessibleColorsChange }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <Row gap={1} wrap={false}>
      <IconButton label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggle}>
        {theme === "dark" ? <IconSun /> : <IconMoon />}
      </IconButton>
      <IconButton
        label={accessibleColors ? "Accessible colours on" : "Accessible colours off"}
        pressed={accessibleColors}
        onClick={() => onAccessibleColorsChange(!accessibleColors)}
      >
        <IconEye />
      </IconButton>
    </Row>
  );
}
