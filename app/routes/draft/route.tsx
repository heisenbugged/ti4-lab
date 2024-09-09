import { Button, Group, Switch, useMantineColorScheme } from "@mantine/core";
import { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";

export default function Draft() {
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
          <Switch
            label="Pick for anyone"
            checked={pickForAnyone}
            onChange={(e) => {
              setPickForAnyone(e.currentTarget.checked);
              if (e.currentTarget.checked) {
                setAdminMode(false);
              }
            }}
          />
          <Switch
            visibleFrom="sm"
            label="Admin mode"
            checked={adminMode}
            onChange={(e) => {
              setAdminMode(e.currentTarget.checked);
              if (e.currentTarget.checked) {
                setPickForAnyone(false);
              }
            }}
          />
        </Group>
      }
    >
      <Outlet context={{ adminMode, pickForAnyone, accessibleColors }} />
    </MainAppShell>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};
