import { AppShell, Group, Switch, Title } from "@mantine/core";
import { Outlet } from "@remix-run/react";
import { useState } from "react";

export default function Draft() {
  const [adminMode, setAdminMode] = useState(false);
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Group align="center" h="100%" px="sm" gap="sm">
          <img src="/logo.webp" style={{ width: 40 }} />
          <Title fw="bolder" order={3} c="purple.8">
            TI4 Lab
          </Title>
          <div style={{ flex: 1 }} />
          <Switch
            label="Admin Mode"
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
