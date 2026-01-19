import { Group } from "@mantine/core";
import { DraftPick, HydratedPlayer } from "~/types";
import { DraftOrderChip } from "./DraftOrderChip";
import { getDraftOrderEntries } from "./draftOrderUtils";

type Props = {
  pickOrder: DraftPick[];
  currentPick: number;
  players: HydratedPlayer[];
};

export function DraftOrder({ pickOrder, currentPick, players }: Props) {
  const entries = getDraftOrderEntries(pickOrder, players, currentPick);

  return (
    <Group gap={1}>
      {entries.map((entry) => (
        <DraftOrderChip
          key={`${entry.player.id}-${entry.idx}`}
          entry={entry}
          showDiscord={true}
        />
      ))}
    </Group>
  );
}
