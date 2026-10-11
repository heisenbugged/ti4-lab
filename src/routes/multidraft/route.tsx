import { createFileRoute, Outlet } from "@tanstack/react-router";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { MainAppShell } from "~/components/MainAppShell";
import { IconButton, useTheme } from "~/ui";

export const Route = createFileRoute("/multidraft")({
  head: () => ({
    meta: [
      { title: "TI4 Lab Multidraft" },
      { name: "description", content: "TI4 Lab, for drafting and map creation." },
    ],
  }),
  component: MultiDraft,
});

function MultiDraft() {
  const { theme, setTheme } = useTheme();

  return (
    <MainAppShell
      headerRightSection={
        theme === "dark" ? (
          <IconButton label="Light theme" onMouseDown={() => setTheme("light")}>
            <IconSun />
          </IconButton>
        ) : (
          <IconButton label="Dark theme" onMouseDown={() => setTheme("dark")}>
            <IconMoon />
          </IconButton>
        )
      }
    >
      <Outlet />
    </MainAppShell>
  );
}
