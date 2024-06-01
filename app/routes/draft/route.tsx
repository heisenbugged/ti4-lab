import { AppShell, Group, Switch, Title } from "@mantine/core";
import { Link, Outlet } from "@remix-run/react";
import { useState } from "react";

export default function Draft() {
  const [adminMode, setAdminMode] = useState(false);
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Group align="center" h="100%" px="sm" gap="sm">
          <Link
            to="/draft/prechoice"
            className="logo"
            style={{ textDecoration: "none" }}
          >
            <Group align="center" gap="xs">
              <img src="/logo.webp" style={{ width: 40 }} />
              <Title fw="bolder" order={3} c="purple.8">
                TI4 Lab
              </Title>
            </Group>
          </Link>
          <div style={{ flex: 1 }} />
          <Switch
            label="Pick for anyone"
            checked={adminMode}
            onChange={(e) => setAdminMode(e.currentTarget.checked)}
          />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet context={{ adminMode }} />
      </AppShell.Main>
    </AppShell>
  );
}
