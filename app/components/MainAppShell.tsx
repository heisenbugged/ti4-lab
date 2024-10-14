import {
  Anchor,
  AppShell,
  Box,
  Divider,
  Group,
  VisuallyHidden,
} from "@mantine/core";
import { Link, useLocation } from "@remix-run/react";
import { Logo } from "~/components/Logo";

type Props = {
  children: React.ReactNode;
  headerRightSection?: React.ReactNode;
};
export function MainAppShell({ children, headerRightSection }: Props) {
  const location = useLocation();
  const isPresetsActive = location.pathname === "/draft/presets";

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

          <Anchor
            component={Link}
            to="/draft/presets"
            underline="hover"
            fw={500}
            c={isPresetsActive ? "blue.8" : "blue"}
            bg={isPresetsActive ? "blue.0" : "transparent"}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Presets
          </Anchor>

          <div style={{ flex: 1 }} />

          {headerRightSection}
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
