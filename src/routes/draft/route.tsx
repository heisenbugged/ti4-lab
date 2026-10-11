import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import { HeaderControls } from "~/components/HeaderControls";
import { useDraftUiSettings } from "~/draftUiSettings";

export const Route = createFileRoute("/draft")({
  head: () => ({
    meta: [
      { title: "TI4 Lab Draft" },
      { name: "description", content: "TI4 Lab, for drafting and map creation." },
    ],
  }),
  component: DraftLayout,
});

function DraftLayout() {
  const { accessibleColors, setAccessibleColors, reset } = useDraftUiSettings();

  // Accessible colours switch the hazard reds site-wide through a token override.
  useEffect(() => {
    document.documentElement.dataset.a11y = accessibleColors ? "true" : "false";
  }, [accessibleColors]);

  // The toggles belong to this visit to the draft pages.
  useEffect(() => reset, [reset]);

  // Draft pages (live, finished, replay) use the full width; the setup pages keep the page cap.
  const wide = useParams({ strict: false, select: (p) => p.id !== undefined });

  return (
    <MainAppShell
      wide={wide}
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
