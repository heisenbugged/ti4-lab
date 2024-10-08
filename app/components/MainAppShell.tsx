import { AppShell, Box, Group, VisuallyHidden } from "@mantine/core";
import { Link } from "@remix-run/react";
import { Logo } from "~/components/Logo";

type Props = {
  children: React.ReactNode;
  headerRightSection?: React.ReactNode;
};
export function MainAppShell({ children, headerRightSection }: Props) {
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Group align="center" h="100%" px="sm" gap="sm">
          <Box visibleFrom="xs">
            <Link
              to="/draft/prechoice"
              className="logo"
              style={{ textDecoration: "none" }}
            >
              <Logo />
            </Link>
          </Box>

          <div style={{ flex: 1 }} />

          {headerRightSection}
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
