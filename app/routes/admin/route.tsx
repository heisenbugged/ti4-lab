import { Outlet } from "react-router";
import { MainAppShell } from "~/components/MainAppShell";

export default function AdminLayout() {
  return (
    <MainAppShell>
      <Outlet />
    </MainAppShell>
  );
}
