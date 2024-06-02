import {
  AppShell,
  Button,
  Group,
  Switch,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { Link, Outlet } from "@remix-run/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState } from "react";
import { Logo } from "~/components/Logo";

export default function Draft() {
  const [adminMode, setAdminMode] = useState(false);
  const { setColorScheme } = useMantineColorScheme();

  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Group align="center" h="100%" px="sm" gap="sm">
          <Link
            to="/draft/prechoice"
            className="logo"
            style={{ textDecoration: "none" }}
          >
            <Logo />
          </Link>
          <div style={{ flex: 1 }} />
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
              checked={adminMode}
              onChange={(e) => setAdminMode(e.currentTarget.checked)}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet context={{ adminMode }} />
      </AppShell.Main>
    </AppShell>
  );
}
