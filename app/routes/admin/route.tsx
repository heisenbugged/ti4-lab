import { Form, NavLink, Outlet, useLoaderData, useLocation } from "react-router";
import { IconLogout, IconShieldLock } from "@tabler/icons-react";
import { MainAppShell } from "~/components/MainAppShell";
import { Button, cx } from "~/ui";
import { adminAuthEnabled } from "~/utils/adminAuth.server";
import classes from "./styles.module.css";

export async function loader() {
  return { authEnabled: adminAuthEnabled() };
}

const SECTIONS = [
  { to: "/admin/drafts", label: "Drafts" },
  { to: "/admin/maps", label: "Community maps" },
];

export default function AdminLayout() {
  const { authEnabled } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const onLogin = pathname.startsWith("/admin/login");

  return (
    <MainAppShell>
      {!onLogin && (
        <div className={classes.bar}>
          <span className={classes.badge}>
            <IconShieldLock size={15} />
            Admin
          </span>
          <nav className={classes.tabs} aria-label="Admin sections">
            {SECTIONS.map((s) => (
              <NavLink key={s.to} to={s.to} className={({ isActive }) => cx(classes.tab, isActive && classes.active)}>
                {s.label}
              </NavLink>
            ))}
          </nav>
          {authEnabled && (
            <Form method="post" action="/admin/logout" className={classes.logout}>
              <Button type="submit" size="sm" variant="tertiary" icon={<IconLogout size={15} />}>
                Log out
              </Button>
            </Form>
          )}
        </div>
      )}
      <Outlet />
    </MainAppShell>
  );
}
