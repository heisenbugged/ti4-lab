import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import { HeaderControls } from "~/components/HeaderControls";

export const Route = createFileRoute("/voices")({
  head: () => ({
    meta: [
      { title: "TI4 Voice Lines" },
      {
        name: "description",
        content:
          "Voice lines and music for the game Twilight Imperium 4th Edition.",
      },
    ],
  }),
  component: VoiceLinesShell,
});

function VoiceLinesShell() {
  const [accessibleColors, setAccessibleColors] = useState(false);

  return (
    <MainAppShell
      headerRightSection={
        <HeaderControls
          accessibleColors={accessibleColors}
          onAccessibleColorsChange={setAccessibleColors}
        />
      }
    >
      <Outlet />
    </MainAppShell>
  );
}
