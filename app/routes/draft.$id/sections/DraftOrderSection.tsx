import { Stack } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { DraftOrder } from "../components/DraftOrder";
import { useDraftV2 } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";

export function DraftOrderSection() {
  const players = useDraftV2((state) => state.draft.players);
  const pickOrder = useDraftV2((state) => state.draft.pickOrder);
  const currentPick = useHydratedDraft().currentPick;

  return (
    <Stack>
      <SectionTitle title="Draft Order" />
      <DraftOrder
        players={players}
        pickOrder={pickOrder}
        currentPick={currentPick}
      />
    </Stack>
  );
}
