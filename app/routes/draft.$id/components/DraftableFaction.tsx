import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";
import { SelectableCard, PlayerColor } from "~/ui";
import { playerColorOf } from "./draftOrderUtils";
import classes from "./DraftableFaction.module.css";

type Props = {
  faction: Faction;
  player?: HydratedPlayer;
  disabled?: boolean;
  selectTitle?: string;
  selectedOverride?: boolean;
  selectedColorOverride?: PlayerColor;
  /** Selected (main pick), waiting for Lock in pick. */
  pending?: boolean;
  /** Selected as a minor faction, waiting for Lock in pick. */
  pendingMinor?: boolean;
  onSelect?: () => void;
  onSelectMinor?: () => void;
};

/** Faction card: icon, name, Select (or Main / Minor) or the owner, and Info / Wiki. */
export function DraftableFaction({
  selectTitle,
  faction,
  player,
  disabled = false,
  selectedOverride,
  selectedColorOverride,
  pending = false,
  pendingMinor = false,
  onSelect,
  onSelectMinor,
}: Props) {
  const playerColor =
    player?.id !== undefined ? playerColorOf(player.id) : undefined;

  const hasRegularSelectOnly = onSelect && !onSelectMinor;
  const isAlreadySelected = selectedOverride ?? !!player;
  const selectedColor = selectedColorOverride ?? playerColor;

  return (
    <SelectableCard
      selected={isAlreadySelected}
      selectedColor={selectedColor}
      disabled={disabled}
      pending={pending || pendingMinor}
      onSelect={
        hasRegularSelectOnly && !isAlreadySelected ? onSelect : undefined
      }
      header={
        <>
          <FactionIcon faction={faction.id} className={classes.icon} style={{ width: 28, height: 28 }} />
          <span className={classes.name} title={faction.name}>
            {faction.name}
          </span>
          <PlayerChipOrSelect
            player={player}
            selectTitle={selectTitle}
            selected={pending}
            selectedMinor={pendingMinor}
            onSelect={onSelect}
            onSelectMinor={onSelectMinor}
            disabled={disabled}
            isMinor={player?.minorFaction === faction.id}
          />
        </>
      }
      body={<FactionHelpInfo faction={faction} />}
    />
  );
}
