import type { ReactNode } from "react";
import { TechIcon } from "~/components/icons/TechIcon";
import { LegendaryIcon } from "~/components/icons/LegendaryIcon";
import type { TechSpecialty } from "~/types";
import { cx } from "~/ui";
import classes from "./MapStatsOverlay.module.css";

type MapStats = {
  blueTiles: number;
  redTiles: number;
  totalResources: number;
  totalInfluence: number;
  bioticSkips: number;
  warfareSkips: number;
  propulsionSkips: number;
  cyberneticSkips: number;
  redTraits: number;
  greenTraits: number;
  blueTraits: number;
  totalLegendary: number;
};

type Props = {
  stats: MapStats;
  className?: string;
};

function Glyph({
  icon,
  count,
  title,
}: {
  icon: ReactNode;
  count: number;
  title: string;
}) {
  return (
    <span className={classes.glyph} title={title}>
      {icon}
      <b>{count}</b>
    </span>
  );
}

const SKIPS: Array<{
  key: keyof MapStats;
  tech: TechSpecialty;
  label: string;
}> = [
  { key: "bioticSkips", tech: "BIOTIC", label: "biotic" },
  { key: "warfareSkips", tech: "WARFARE", label: "warfare" },
  { key: "propulsionSkips", tech: "PROPULSION", label: "propulsion" },
  { key: "cyberneticSkips", tech: "CYBERNETIC", label: "cybernetic" },
];

export function MapStatsOverlay({ stats, className }: Props) {
  const skips = SKIPS.filter(({ key }) => (stats[key] ?? 0) > 0);
  return (
    <dl className={cx(classes.stats, className)}>
      <div>
        <dt>Blue/red</dt>
        <dd>
          {stats.blueTiles}/{stats.redTiles}
        </dd>
      </div>
      <div>
        <dt>Resources/influence</dt>
        <dd>
          {stats.totalResources}/{stats.totalInfluence}
        </dd>
      </div>
      <div>
        <dt>Tech skips</dt>
        <dd className={classes.glyphs}>
          {skips.length === 0 && <span className={classes.none}>None</span>}
          {skips.map(({ key, tech, label }) => (
            <Glyph
              key={key}
              icon={<TechIcon techSpecialty={tech} size={20} />}
              count={stats[key]}
              title={`${stats[key]} ${label}`}
            />
          ))}
        </dd>
      </div>
      {(stats.totalLegendary ?? 0) > 0 && (
        <div>
          <dt>Legendaries</dt>
          <dd className={classes.glyphs}>
            <Glyph
              icon={<LegendaryIcon size={20} />}
              count={stats.totalLegendary}
              title={`${stats.totalLegendary} legendary`}
            />
          </dd>
        </div>
      )}
      <div>
        <dt>Traits R/G/B</dt>
        <dd>
          {stats.redTraits}/{stats.greenTraits}/{stats.blueTraits}
        </dd>
      </div>
    </dl>
  );
}
