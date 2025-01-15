import { Button, Group, Switch, useMantineColorScheme } from "@mantine/core";
import { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";

export type DraftOrderContext = {
  adminMode: boolean;
  pickForAnyone: boolean;
  originalArt: boolean;
  accessibleColors: boolean;
  setAdminMode: (value: boolean) => void;
  setPickForAnyone: (value: boolean) => void;
  setOriginalArt: (value: boolean) => void;
  setAccessibleColors: (value: boolean) => void;
};

export default function LSGC4Index() {
  const [originalArt, setOriginalArt] = useState(false);
  const [accessibleColors, setAccessibleColors] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [pickForAnyone, setPickForAnyone] = useState(false);
  const { setColorScheme } = useMantineColorScheme();

  return (
    <MainAppShell
      headerRightSection={
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
            label="A11Y"
            checked={accessibleColors}
            onChange={(e) => {
              setAccessibleColors(e.currentTarget.checked);
            }}
          />
        </Group>
      }
    >
      <Outlet
        context={{
          adminMode,
          pickForAnyone,
          originalArt,
          accessibleColors,
          setAdminMode,
          setPickForAnyone,
          setOriginalArt,
          setAccessibleColors,
        }}
      />
    </MainAppShell>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Audio" },
    {
      name: "description",
      content: "Audio tool.",
    },
  ];
};
