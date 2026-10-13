import { IconBrandDiscordFilled, IconLayoutDashboard, IconLogout } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { ButtonAnchor, Menu, MenuItem, MenuSeparator } from "~/ui";
import { signInHref, useSignOut, useViewer } from "~/hooks/useViewer";
import classes from "./AccountButton.module.css";

/** Discord avatar with a menu when signed in, otherwise a sign-in button. */
export function AccountButton() {
  const viewer = useViewer();
  const signOut = useSignOut();
  const navigate = useNavigate();

  if (viewer === undefined) return <span className={classes.placeholder} aria-hidden />;

  if (!viewer) {
    return (
      <ButtonAnchor href={signInHref()} size="sm" variant="tertiary" icon={<IconBrandDiscordFilled />}>
        Sign in
      </ButtonAnchor>
    );
  }

  return (
    <Menu
      width={230}
      trigger={
        <button type="button" className={classes.trigger} aria-label={`Account: ${viewer.name}`}>
          <Avatar name={viewer.name} url={viewer.avatarUrl} />
        </button>
      }
    >
      <div className={classes.who}>
        <b>{viewer.name}</b>
        <small>Signed in with Discord</small>
      </div>
      <MenuSeparator />
      {viewer.hubSlug && (
        <MenuItem icon={<IconLayoutDashboard />} onClick={() => navigate({ to: "/hub/$slug", params: { slug: viewer.hubSlug! } })}>
          Your hub
        </MenuItem>
      )}
      <MenuItem
        icon={<IconLogout />}
        onClick={async () => {
          await signOut();
          navigate({ to: "/hub" });
        }}
      >
        Sign out
      </MenuItem>
    </Menu>
  );
}

export function Avatar({ name, url, size = 28 }: { name: string; url: string | null; size?: number }) {
  return url ? (
    <img className={classes.avatar} src={url} alt="" width={size} height={size} />
  ) : (
    <span className={classes.avatar} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
