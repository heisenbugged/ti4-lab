import { useState, type ReactNode } from "react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { IconBrandDiscordFilled, IconMenu2 } from "@tabler/icons-react";
import { ButtonAnchor, Drawer, IconButton, cx } from "~/ui";
import { Logo } from "~/components/Logo";
import { AccountButton } from "~/components/Account/AccountButton";
import { trackButtonClick } from "~/lib/analytics";
import classes from "./MainAppShell.module.css";

const DISCORD_INVITE_URL = "https://discord.gg/2ezSTQpAVC";

type Props = {
  children: ReactNode;
  headerRightSection?: ReactNode;
  /** Full-bleed pages (map generator) manage their own padding. */
  flush?: boolean;
  /** No max width (live drafts use the whole screen, as before). */
  wide?: boolean;
};

export function MainAppShell({ children, headerRightSection, flush, wide }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const matchRoute = useMatchRoute();
  const matches = (to: string, fuzzy = false) => Boolean(matchRoute({ to, fuzzy }));

  const items = [
    { to: "/draft/prechoice", label: "Draft", active: matches("/draft", true) },
    { to: "/hub", label: "Hub", active: matches("/hub", true) },
    { to: "/map-generator", label: "Map generator", active: matches("/map-generator") },
    { to: "/map-presets", label: "Community maps", active: matches("/map-presets") || matches("/maps", true) },
    { to: "/about", label: "About", active: matches("/about") },
    { to: "/voices", label: "Soundboard", active: matches("/voices", true) },
  ] as const;

  const go = (to: string) => () => {
    if (to === "/voices") {
      trackButtonClick({ buttonType: "load_soundboard", context: "main_app_shell" });
    }
    setMenuOpen(false);
  };

  return (
    <div className={classes.shell}>
      <header className={classes.header}>
        <Link to="/draft/prechoice" className={classes.brand} aria-label="TI4 Lab home">
          <Logo />
        </Link>
        <nav className={classes.nav} aria-label="Main">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className={classes.link} aria-current={it.active ? "page" : undefined} onClick={go(it.to)}>
              {it.label}
            </Link>
          ))}
        </nav>
        <div className={classes.end}>
          {headerRightSection && <div className={classes.desktopOnly}>{headerRightSection}</div>}
          <ButtonAnchor href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" size="sm" icon={<IconBrandDiscordFilled />} className={classes.desktopOnly}>
            Join Discord
          </ButtonAnchor>
          <AccountButton />
          <IconButton label="Menu" className={classes.burger} onClick={() => setMenuOpen(true)}>
            <IconMenu2 />
          </IconButton>
        </div>
      </header>

      <Drawer opened={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav className={classes.drawerNav} aria-label="Main">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className={classes.drawerLink} aria-current={it.active ? "page" : undefined} onClick={go(it.to)}>
              {it.label}
            </Link>
          ))}
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" className={classes.drawerLink} onClick={() => setMenuOpen(false)}>
            <IconBrandDiscordFilled size={16} color="var(--discord)" /> Discord
          </a>
        </nav>
        {headerRightSection && <div className={classes.drawerExtra}>{headerRightSection}</div>}
      </Drawer>

      <main className={cx(classes.main, wide && classes.wide, flush && classes.flush)}>{children}</main>
    </div>
  );
}
