import { Button, Group, Switch, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

type Props = {
  accessibleColors: boolean;
  onAccessibleColorsChange: (value: boolean) => void;
};

export function HeaderControls({
  accessibleColors,
  onAccessibleColorsChange,
}: Props) {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <Group>
      <Button
        variant="light"
        color="gray"
        onMouseDown={() => setColorScheme("dark")}
        size="compact-xs"
        darkHidden
      >
        <IconMoon />
      </Button>
      <Button
        variant="light"
        color="gray"
        onMouseDown={() => setColorScheme("light")}
        lightHidden
        size="compact-xs"
      >
        <IconSun />
      </Button>
      <Switch
        id="a11y-switch"
        label="A11Y"
        checked={accessibleColors}
        onChange={(e) => onAccessibleColorsChange(e.currentTarget.checked)}
      />
    </Group>
  );
}
