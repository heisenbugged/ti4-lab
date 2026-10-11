import type { FactionId, Player } from "~/types";
import { FactionIcon } from "../../icons/FactionIcon";
import { playerColors } from "~/data/factionData";
import classes from "./HomeTileContent.module.css";

type PlayerWithFaction = { faction: FactionId } & Player;

type Props = {
  player: Player;
  radius: number;
};

/**
 * Content for home tiles with an assigned player.
 * Shows faction icon and player name.
 */
export function PlayerContent({ player, radius }: Props) {
  const hasFaction = (p: Player): p is PlayerWithFaction => p != null && "faction" in p && typeof p.faction === "string";

  const playerColor = playerColors[player.id] ?? "gray";
  const nameSize = radius >= 60 ? 12 : 10;

  return (
    <div className={classes.player} style={{ width: radius * 1.25 }}>
      {hasFaction(player) && <FactionIcon faction={player.faction} style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }} />}
      <div className={classes.nameBadge} style={{ maxWidth: radius * 1.15 }}>
        <p className={classes.name} style={{ fontSize: nameSize, color: `var(--player-${playerColor})` }} title={player.name}>
          {player.name}
        </p>
      </div>
    </div>
  );
}
