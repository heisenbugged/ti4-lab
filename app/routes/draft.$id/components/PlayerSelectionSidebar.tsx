import { IconCheck } from "@tabler/icons-react";
import { Bracket, Panel, PlayerHex, Tag, cx } from "~/ui";
import type { CSSProperties } from "react";
import { factions as allFactions, playerColors } from "~/data/factionData";
import { HydratedPlayer } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import classes from "./PlayerSelectionSidebar.module.css";

interface PlayerSelectionSidebarProps {
  players: HydratedPlayer[];
  pickForAnyone: boolean;
  selectedPlayerId: number | null;
  defaultPlayerId: number | undefined;
  stagingValues: Record<number, string> | undefined;
  onPlayerSelect: (playerId: number) => void;
  onPlayerHover: (playerId: number | null) => void;
  currentPlayerId?: number;
  spectatorMode?: boolean;
}

export function PlayerSelectionSidebar({
  players,
  pickForAnyone,
  selectedPlayerId,
  defaultPlayerId,
  stagingValues,
  onPlayerSelect,
  onPlayerHover,
  currentPlayerId,
  spectatorMode = false,
}: PlayerSelectionSidebarProps) {
  const readyCount = players.filter(
    (p) => stagingValues?.[p.id] !== undefined,
  ).length;

  return (
    <Panel
      title="Players to pick"
      flush
      action={
        <span className={classes.count}>
          {readyCount} of {players.length} ready
        </span>
      }
    >
      <div className={classes.list}>
        {players.map((player) => {
          const isReady = stagingValues?.[player.id] !== undefined;
          const isSelected = pickForAnyone
            ? selectedPlayerId === player.id ||
              (selectedPlayerId === null && defaultPlayerId === player.id)
            : currentPlayerId === player.id;
          const faction = player.faction
            ? allFactions[player.faction]
            : undefined;
          const canClick = spectatorMode || pickForAnyone;

          const priorityValueFaction = player.priorityValueFactionId
            ? allFactions[player.priorityValueFactionId]
            : undefined;

          const speakerOrderLabel =
            player.speakerOrder !== undefined
              ? speakerOrderLabels[player.speakerOrder]
              : undefined;

          const color = playerColors[player.id];
          const Element = canClick ? "button" : "div";

          return (
            <Bracket key={player.id} active={isSelected}>
              <Element
                type={canClick ? "button" : undefined}
                className={cx(classes.player, isReady && classes.ready)}
                style={{ "--p": `var(--player-${color})` } as CSSProperties}
                aria-pressed={canClick ? isSelected : undefined}
                onMouseEnter={() => canClick && onPlayerHover(player.id)}
                onMouseLeave={() => onPlayerHover(null)}
                onClick={() => canClick && onPlayerSelect(player.id)}
              >
                <span className={classes.top}>
                  {faction ? (
                    <img
                      className={classes.faction}
                      src={faction.iconPath}
                      alt={faction.name}
                    />
                  ) : (
                    <PlayerHex color={color}>
                      {String.fromCharCode(65 + player.id)}
                    </PlayerHex>
                  )}
                  <span className={classes.name} title={player.name}>
                    {player.name}
                  </span>
                  {speakerOrderLabel && (
                    <Tag tone="ion">{speakerOrderLabel}</Tag>
                  )}
                  {isReady ? (
                    <span className={classes.tick} aria-label="Ready">
                      <IconCheck size={14} stroke={3} />
                    </span>
                  ) : (
                    <span className={classes.waiting}>Choosing</span>
                  )}
                </span>
                {priorityValueFaction && (
                  <span className={classes.priority}>
                    <FactionIcon
                      faction={priorityValueFaction.id}
                      style={{ width: 16, height: 16, flex: "none" }}
                    />
                    <span>
                      Priority {priorityValueFaction.priorityOrder}:{" "}
                      {priorityValueFaction.name}
                    </span>
                  </span>
                )}
              </Element>
            </Bracket>
          );
        })}
      </div>
    </Panel>
  );
}

const speakerOrderLabels = [
  "Speaker",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
];
