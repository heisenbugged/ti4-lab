import {
  AppShell,
  Badge,
  Box,
  Burger,
  Drawer,
  Group,
  rem,
  Stack,
  Text,
  UnstyledButton,
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

type NavItemProps = {
  to?: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  mobile?: boolean;
};

function NavItem({
  to,
  label,
  isActive,
  onClick,
  badge,
  badgeColor = "orange",
  mobile = false,
}: NavItemProps) {
  const content = (
    <Box
      className={classes.navItem}
      data-active={isActive || undefined}
      data-mobile={mobile || undefined}
    >
      <Box className={classes.navItemIndicator} />
      <Text
        size="sm"
        fw={isActive ? 600 : 500}
      >
        {label}
      </Text>
      {badge && (
        <Badge
          size="xs"
          variant="filled"
          color={badgeColor}
          className={classes.navBadge}
        >
          {badge}
        </Badge>
      )}
    </Box>
  );

  if (to) {
    return (
      <UnstyledButton component={Link} to={to} onClick={onClick}>
        {content}
      </UnstyledButton>
    );
  }

  return <UnstyledButton onClick={onClick}>{content}</UnstyledButton>;
}

export function MainAppShell({ children, headerRightSection }: Props) {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isPresetsActive = location.pathname === "/draft/presets";
  const isAboutActive = location.pathname === "/about";
  const isSoundboardActive = location.pathname === "/voices";
  const isMapGeneratorActive = location.pathname === "/map-generator";

  const handleSoundboardClick = () => {
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
        <NavItem
          key={item.to}
          to={item.to}
          label={item.label}
          isActive={item.isActive}
          onClick={() => setMobileMenuOpened(false)}
          mobile={mobile}
        />
      ))}
      <NavItem
        label="Soundboard"
        isActive={isSoundboardActive}
        onClick={handleSoundboardClick}
        badge="NEW"
        badgeColor="orange"
        mobile={mobile}
      />
    </>
  );

  return (
    <AppShell header={{ height: 48 }} px="md">
      <AppShell.Header className={classes.header}>
        <Group align="center" h="100%" px="sm" gap={0}>
          <Box className={classes.logoContainer}>
            <Link
              to="/draft/prechoice"
              className="logo"
              style={{ textDecoration: "none" }}
            >
              <Logo />
            </Link>
          </Box>

          <Box className={classes.navDivider} />

          <Burger
            opened={mobileMenuOpened}
            onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
            size="sm"
            className={classes.burger}
          />
          <nav className={classes.desktopMenu}>
            <Group gap={0}>{renderMenuItems()}</Group>
            <div style={{ flex: 1 }} />
            {headerRightSection}
          </nav>
        </Group>
      </AppShell.Header>

      <Drawer
        opened={mobileMenuOpened}
        onClose={() => setMobileMenuOpened(false)}
        size="100%"
        padding="md"
        title={
          <Text
            size="xs"
            fw={600}
            tt="uppercase"
            c="dimmed"
            style={{ fontFamily: "Orbitron", letterSpacing: "0.1em" }}
          >
            Navigation
          </Text>
        }
        zIndex={1000}
        styles={{
          header: {
            borderBottom: "1px dashed var(--mantine-color-default-border)",
          },
          body: {
            paddingTop: rem(16),
          },
        }}
      >
        <Stack gap="xs">{renderMenuItems(true)}</Stack>
        {headerRightSection && <Box mt="xl">{headerRightSection}</Box>}
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
