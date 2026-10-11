import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { IconLogout, IconShieldLock } from "@tabler/icons-react";
import { MainAppShell } from "~/components/MainAppShell";
import { Button } from "~/ui";
import { getAdminStatus, logoutAdmin } from "~/server/admin.functions";
import classes from "./styles.module.css";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { authEnabled, isAdmin } = await getAdminStatus();
    const onLogin = location.pathname.startsWith("/admin/login");
    if (!isAdmin && !onLogin) {
      throw redirect({
        to: "/admin/login",
        search: { redirectTo: location.href },
      });
    }
    return { authEnabled, isAdmin };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { authEnabled } = Route.useRouteContext();
  const onLogin = Boolean(useMatch({ from: "/admin/login", shouldThrow: false }));
  const router = useRouter();
  const logout = useServerFn(logoutAdmin);

  const handleLogout = async () => {
    await logout();
    await router.navigate({ to: "/" });
    await router.invalidate();
  };

  return (
    <MainAppShell>
      {!onLogin && (
        <div className={classes.bar}>
          <span className={classes.badge}>
            <IconShieldLock size={15} />
            Admin
          </span>
          <nav className={classes.tabs} aria-label="Admin sections">
            <Link to="/admin/drafts" className={classes.tab} activeProps={{ className: classes.active }}>
              Drafts
            </Link>
            <Link to="/admin/maps" className={classes.tab} activeProps={{ className: classes.active }}>
              Community maps
            </Link>
          </nav>
          {authEnabled && (
            <div className={classes.logout}>
              <Button size="sm" variant="tertiary" icon={<IconLogout size={15} />} onClick={handleLogout}>
                Log out
              </Button>
            </div>
          )}
        </div>
      )}
      <Outlet />
    </MainAppShell>
  );
}
