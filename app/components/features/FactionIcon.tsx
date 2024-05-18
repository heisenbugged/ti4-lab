import { Faction } from "~/types";

const factionIcon: Record<Faction, string> = {
  mentak: "/mentak.png",
  yssaril: "/yssaril.png",
};

type Props = {
  faction: Faction;
  style?: React.CSSProperties;
};

export function FactionIcon({ faction, style }: Props) {
  return <img src={factionIcon[faction]} style={style} />;
}
