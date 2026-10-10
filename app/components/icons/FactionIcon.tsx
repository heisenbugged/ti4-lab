import classes from "./FactionIcon.module.css";
import { factions } from "~/data/factionData";
import { FactionId } from "~/types";

type Props = {
  faction: FactionId;
  style?: React.CSSProperties;
  visibleFrom?: "xs" | "sm" | "md" | "lg";
  hiddenFrom?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

export function FactionIcon({
  faction,
  style,
  visibleFrom,
  hiddenFrom,
  className,
}: Props) {
  // Box can mess with layout for reasons not totally understood,
  // so avoid its use, if possible
  if (!visibleFrom && !hiddenFrom) {
    return (
      <img
        src={factions[faction].iconPath}
        className={className}
        style={{ objectFit: "contain", ...style }}
        alt={factions[faction].name}
      />
    );
  }

  return (
    <div
      style={style}
      className={[className, visibleFrom && classes[`from-${visibleFrom}`], hiddenFrom && classes[`below-${hiddenFrom}`]].filter(Boolean).join(" ")}
    >
      <img
        src={factions[faction].iconPath}
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
        alt={factions[faction].name}
      />
    </div>
  );
}
