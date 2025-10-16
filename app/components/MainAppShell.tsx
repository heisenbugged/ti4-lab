import {
  Anchor,
  AppShell,
  Badge,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  rem,
  Stack,
} from "@mantine/core";

import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Logo } from "~/components/Logo";
import { trackButtonClick } from "~/lib/analytics.client";
import classes from "./MainAppShell.module.css";

type Props = {
  children: React.ReactNode;
  headerRightSection?: React.ReactNode;
};
export function MainAppShell({ children, headerRightSection }: Props) {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isPresetsActive = location.pathname === "/draft/presets";
  const isAboutActive = location.pathname === "/about";
  const isSoundboardActive = location.pathname === "/voices";
  const isMapGeneratorActive = location.pathname === "/map-generator";

  const handleSoundboardClick = () => {
    // Track button click with PostHog
    trackButtonClick({
      buttonType: "load_soundboard",
      context: "main_app_shell",
    });

    navigate("/voices");
    setMobileMenuOpened(false);
  };

  const menuItems = [
    {
      to: "/map-generator",
      label: "Map Generator",
      isActive: isMapGeneratorActive,
    },
    { to: "/draft/presets", label: "Presets", isActive: isPresetsActive },
    { to: "/about", label: "About", isActive: isAboutActive },
  ];

  const renderMenuItems = (mobile = false) => (
    <>
      {menuItems.map((item) => (
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
      ))}
      <Box pos="relative">
        <Badge
          size="xs"
          variant="filled"
          color="orange"
          pos="absolute"
          top={-6}
          right={-6}
          style={{ zIndex: 1 }}
        >
          NEW
        </Badge>
        <Anchor
          underline="hover"
          fw={500}
          c={isSoundboardActive ? "orange.8" : "orange"}
          bg={isSoundboardActive ? "orange.0" : "transparent"}
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            ...(mobile && { fontSize: rem(18), padding: "8px 16px" }),
          }}
          onClick={handleSoundboardClick}
        >
          Soundboard
        </Anchor>
      </Box>
    </>
  );

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
