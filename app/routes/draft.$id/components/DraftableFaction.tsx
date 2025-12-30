import { Flex, Text } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";
import { playerColors } from "~/data/factionData";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";
import { PlayerColor } from "~/ui";
import classes from "./DraftableFaction.module.css";

type Props = {
  faction: Faction;
  player?: HydratedPlayer;
  disabled?: boolean;
  selectTitle?: string;
  onSelect?: () => void;
  onSelectMinor?: () => void;
};

export function DraftableFaction({
  selectTitle,
  faction,
  player,
  disabled = false,
  onSelect,
  onSelectMinor,
}: Props) {
  const playerColor =
    player?.id !== undefined ? (playerColors[player.id] as PlayerColor) : undefined;

  const hasRegularSelectOnly = onSelect && !onSelectMinor;
  const isAlreadySelected = !!player;
  const isAvailable = hasRegularSelectOnly && !isAlreadySelected && !disabled;

  const cardClasses = [
    classes.factionCard,
    isAvailable && classes.available,
    isAlreadySelected && classes.claimed,
    isAlreadySelected && playerColor && classes[playerColor],
    disabled && !isAlreadySelected && classes.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (isAvailable && onSelect) {
      onSelect();
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className={classes.header}>
        <div className={classes.iconContainer}>
          <FactionIcon
            faction={faction.id}
            style={{ width: 28, height: 28 }}
          />
        </div>
        <Text className={classes.factionName}>{faction.name}</Text>
        <PlayerChipOrSelect
          player={player}
          selectTitle={selectTitle}
          onSelect={
            onSelect
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect();
                }
              : undefined
          }
          onSelectMinor={onSelectMinor}
          disabled={disabled}
          isMinor={player?.minorFaction === faction.id}
        />
      </div>
      <div className={classes.details}>
        <FactionHelpInfo faction={faction} />
      </div>
    </div>
  );
}
