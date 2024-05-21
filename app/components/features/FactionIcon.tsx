import { factions } from "~/data/factionData";
import { FactionId } from "~/types";

type Props = {
  faction: FactionId;
  style?: React.CSSProperties;
};

export function FactionIcon({ faction, style }: Props) {
  return <img src={factions[faction].iconPath} style={style} />;
}
