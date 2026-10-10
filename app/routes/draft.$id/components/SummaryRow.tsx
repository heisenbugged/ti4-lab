import { useSlice } from "~/components/Slice";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { Slice, HydratedPlayer } from "~/types";
import { Table, ValuePill } from "~/ui";
import { PlayerChip } from "./PlayerChip";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";
import classes from "./FinalizedDraft.module.css";

type Props = {
  player: HydratedPlayer;
  slice: Slice;
  draftSpeaker: boolean;
  showPlayerColor: boolean;
};

const ordinal = (n: number) =>
  n === 1 ? "Speaker" : `${n}${n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

export function SummaryRow({
  player,
  slice,
  draftSpeaker = false,
  showPlayerColor = false,
}: Props) {
  const faction = factions[player.faction!];
  const { optimal, sliceValue } = useSlice(slice);
  return (
    <Table.Tr>
      <Table.Td className={classes.playerCell}>
        <PlayerChip player={player} size="sm" />
      </Table.Td>
      <Table.Td>
        <span className={classes.faction}>
          <FactionIcon faction={player.faction!} style={{ width: 22, height: 22, flex: "none" }} />
          <span className={classes.factionName} title={faction.name}>
            {faction.name}
          </span>
          <FactionHelpInfo faction={faction} compact />
        </span>
      </Table.Td>
      <Table.Td>{ordinal(player.speakerOrder! + 1)}</Table.Td>
      {draftSpeaker && <Table.Td numeric>{player.seatIdx! + 1}</Table.Td>}

      <Table.Td numeric>
        <b>{sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}</b>
      </Table.Td>
      <Table.Td>
        <ValuePill
          size="sm"
          r={optimal.resources}
          i={optimal.influence}
          f={optimal.flex}
          total={optimal.resources + optimal.influence + optimal.flex}
        />
      </Table.Td>
      <Table.Td>
        <span className={classes.features}>
          <SliceFeatures slice={slice} />
        </span>
      </Table.Td>
      {showPlayerColor && <Table.Td>{player.factionColor}</Table.Td>}
    </Table.Tr>
  );
}
