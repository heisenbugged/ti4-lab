import { Button, Group, Switch, useMantineColorScheme } from "@mantine/core";
import { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";

export default function Draft() {
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
            label="Pick for anyone"
            checked={pickForAnyone}
            onChange={(e) => setPickForAnyone(e.currentTarget.checked)}
          />
          <Switch
            visibleFrom="sm"
            label="Admin mode"
            checked={adminMode}
            onChange={(e) => setAdminMode(e.currentTarget.checked)}
          />
        </Group>
      }
    >
      <Outlet context={{ adminMode, pickForAnyone }} />
    </MainAppShell>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};
