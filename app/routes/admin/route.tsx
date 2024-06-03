import { Outlet } from "@remix-run/react";
import { MainAppShell } from "~/components/MainAppShell";

export default function AdminLayout() {
  return (
    <MainAppShell>
      <Outlet />
    </MainAppShell>
  );
}
