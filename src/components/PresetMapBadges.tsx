import type { ReactNode } from "react";
import type { TechSkipsData } from "~/drizzle/presetMap.server";
import { TechIcon } from "~/components/icons/TechIcon";
import { LegendaryIcon } from "~/components/icons/LegendaryIcon";
import { TechSpecialty } from "~/types";
import { cx } from "~/ui";
import classes from "./PresetMapBadges.module.css";

type BadgeSize = "sm" | "md";

const ICON_SIZE: Record<BadgeSize, number> = { sm: 20, md: 26 };

const TECH_LABEL: Record<TechSpecialty, string> = {
  BIOTIC: "biotic",
  WARFARE: "warfare",
  PROPULSION: "propulsion",
  CYBERNETIC: "cybernetic",
};

/** A game glyph with a small count bubble on its lower right. */
function CountBadge({
  icon,
  count,
  size,
  title,
}: {
  icon: ReactNode;
  count: number;
  size: BadgeSize;
  title: string;
}) {
  return (
    <span
      className={cx(classes.glyph, size === "md" && classes.big)}
      title={title}
    >
      {icon}
      <b>{count}</b>
    </span>
  );
}

function TechSkipIcon({
  techSpecialty,
  count,
  size = "sm",
}: {
  techSpecialty: TechSpecialty;
  count: number;
  size?: BadgeSize;
}) {
  if (count === 0) return null;
  return (
    <CountBadge
      icon={<TechIcon techSpecialty={techSpecialty} size={ICON_SIZE[size]} />}
      count={count}
      size={size}
      title={`${count} ${TECH_LABEL[techSpecialty]} ${count === 1 ? "skip" : "skips"}`}
    />
  );
}

/** Parses the stored tech-skip JSON; null when malformed or all zero. */
export function parseTechSkips(techSkips: string | null): TechSkipsData | null {
  if (!techSkips) return null;
  try {
    const data = JSON.parse(techSkips) as TechSkipsData;
    return data.G > 0 || data.R > 0 || data.B > 0 || data.Y > 0 ? data : null;
  } catch {
    return null;
  }
}

export function TechSkipsDisplay({
  techSkips,
  size = "sm",
}: {
  techSkips: string | null;
  size?: BadgeSize;
}) {
  const data = parseTechSkips(techSkips);
  if (!data) return null;
  return (
    <span className={cx(classes.row, size === "md" && classes.rowBig)}>
      <TechSkipIcon techSpecialty="BIOTIC" count={data.G} size={size} />
      <TechSkipIcon techSpecialty="WARFARE" count={data.R} size={size} />
      <TechSkipIcon techSpecialty="PROPULSION" count={data.B} size={size} />
      <TechSkipIcon techSpecialty="CYBERNETIC" count={data.Y} size={size} />
    </span>
  );
}

export function LegendaryDisplay({
  count,
  size = "sm",
}: {
  count: number | null;
  size?: BadgeSize;
}) {
  if (!count) return null;
  return (
    <CountBadge
      icon={<LegendaryIcon size={ICON_SIZE[size]} />}
      count={count}
      size={size}
      title={`${count} legendary ${count === 1 ? "planet" : "planets"}`}
    />
  );
}
