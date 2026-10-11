import { IconShieldLock } from "@tabler/icons-react";
import { Button, Heading, Panel, Stack, Text, TextInput } from "~/ui";
import classes from "./styles.module.css";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { loginAdmin } from "~/server/admin.functions";

/** Only allow sending people back into the admin pages. */
function safeRedirect(value: unknown) {
  const target = typeof value === "string" ? value : "";
  return target.startsWith("/admin") && !target.startsWith("//")
    ? target
    : "/admin/drafts";
}

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search): { redirectTo?: string } => ({
    redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.isAdmin) throw redirect({ href: safeRedirect(search.redirectTo) });
  },
  head: () => ({ meta: [{ title: "Admin Login - TI4 Lab" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { redirectTo } = Route.useSearch();
  const router = useRouter();
  const login = useServerFn(loginAdmin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await login({ data: { password } });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    // Re-run the admin guard with the new session, then go where we were headed.
    await router.invalidate();
    await router.navigate({ href: safeRedirect(redirectTo) });
  };

  return (
    <div className={classes.wrap}>
      <Panel className={classes.panel}>
        <div className={classes.head}>
          <span className={classes.icon}>
            <IconShieldLock size={20} />
          </span>
          <div>
            <Heading variant="section">Admin</Heading>
            <Text size="sm" tone="muted">
              Enter the admin password to manage drafts and community maps.
            </Text>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <Stack gap={3}>
            <TextInput
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              error={error}
            />
            <Button
              type="submit"
              variant="primary"
              block
              loading={submitting}
            >
              Log in
            </Button>
          </Stack>
        </form>
      </Panel>
    </div>
  );
}
