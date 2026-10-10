import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { IconBrandDiscordFilled, IconMenu2 } from "@tabler/icons-react";
import { ButtonAnchor, Drawer, IconButton, cx } from "~/ui";
import { Logo } from "~/components/Logo";
import { trackButtonClick } from "~/lib/analytics.client";
import classes from "./MainAppShell.module.css";

const DISCORD_INVITE_URL = "https://discord.gg/2ezSTQpAVC";

type Props = {
  children: ReactNode;
  headerRightSection?: ReactNode;
  /** Full-bleed pages (map generator) manage their own padding. */
  flush?: boolean;
};

export function MainAppShell({ children, headerRightSection, flush }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { to: "/draft/prechoice", label: "Draft", active: pathname.startsWith("/draft") },
    { to: "/map-generator", label: "Map generator", active: pathname === "/map-generator" },
    { to: "/map-presets", label: "Community maps", active: pathname === "/map-presets" || pathname.startsWith("/maps/") },
    { to: "/about", label: "About", active: pathname === "/about" },
    { to: "/voices", label: "Soundboard", active: pathname.startsWith("/voices") },
  ];

  const go = (to: string) => (e: React.MouseEvent) => {
    if (to === "/voices") {
      e.preventDefault();
      trackButtonClick({ buttonType: "load_soundboard", context: "main_app_shell" });
      navigate("/voices");
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

      <main className={cx(classes.main, flush && classes.flush)}>{children}</main>
    </div>
  );
}
