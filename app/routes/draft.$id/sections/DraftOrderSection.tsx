import { Stack } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { DraftOrder } from "../components/DraftOrder";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";

export function DraftOrderSection() {
  const players = useDraft((state) => state.draft.players);
  const pickOrder = useDraft((state) => state.draft.pickOrder);
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
