import {
  Anchor,
  AppShell,
  Box,
  Burger,
  Divider,
  Drawer,
  Group,
  rem,
  Stack,
} from "@mantine/core";

import { Link, useLocation } from "@remix-run/react";
import { useState } from "react";
import { Logo } from "~/components/Logo";
import classes from "./MainAppShell.module.css";

type Props = {
  children: React.ReactNode;
  headerRightSection?: React.ReactNode;
};
export function MainAppShell({ children, headerRightSection }: Props) {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const location = useLocation();
  const isPresetsActive = location.pathname === "/draft/presets";
  const isAboutActive = location.pathname === "/about";

  const menuItems = [
    { to: "/draft/presets", label: "Presets", isActive: isPresetsActive },
    { to: "/about", label: "About", isActive: isAboutActive },
  ];

  const renderMenuItems = (mobile = false) =>
    menuItems.map((item) => (
      <Anchor
        key={item.to}
        component={Link}
        to={item.to}
        underline="hover"
        fw={500}
        c={item.isActive ? "blue.8" : "blue"}
        bg={item.isActive ? "blue.0" : "transparent"}
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          ...(mobile && { fontSize: rem(18), padding: "8px 16px" }),
        }}
        onClick={() => setMobileMenuOpened(false)}
      >
        {item.label}
      </Anchor>
    ));

  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Group align="center" h="100%" px="sm" gap="sm">
          <Box>
            <Link
              to="/draft/prechoice"
              className="logo"
              style={{ textDecoration: "none" }}
            >
              <Logo />
            </Link>
          </Box>
          <Divider orientation="vertical" m="md" />

          <Burger
            opened={mobileMenuOpened}
            onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
            size="sm"
            className={classes.burger}
          />
          <div className={classes.desktopMenu}>
            <Group>{renderMenuItems()}</Group>
            <div style={{ flex: 1 }} />
            {headerRightSection}
          </div>
        </Group>
      </AppShell.Header>
      <Drawer
        opened={mobileMenuOpened}
        onClose={() => setMobileMenuOpened(false)}
        size="100%"
        padding="md"
        title="Menu"
        zIndex={1000}
      >
        <Stack>{renderMenuItems(true)}</Stack>
        {headerRightSection && <Box mt="xl">{headerRightSection}</Box>}
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
