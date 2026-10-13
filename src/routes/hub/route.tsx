import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MainAppShell } from "~/components/MainAppShell";

export const Route = createFileRoute("/hub")({
  component: () => (
    <MainAppShell>
      <Outlet />
    </MainAppShell>
  ),
});
