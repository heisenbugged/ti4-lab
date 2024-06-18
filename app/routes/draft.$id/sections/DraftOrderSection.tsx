import { Box, Button, Stack } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { DraftOrder } from "../components/DraftOrder";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useOutletContext } from "@remix-run/react";
import { useSyncDraft } from "~/hooks/useSyncDraft";

export function DraftOrderSection() {
  const { adminMode } = useOutletContext<{ adminMode: boolean }>();
  const { undoLastSelection } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const players = useDraft((state) => state.draft.players);
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const discord = useDraft((state) => state.draft.integrations.discord);
  const selections = useDraft((state) => state.draft.selections);
  const currentPick = useHydratedDraft().currentPick;

  return (
    <Stack>
      <SectionTitle title="Draft Order" />
      <DraftOrder
        players={players}
        pickOrder={pickOrder}
        currentPick={currentPick}
        discordPlayers={discord?.players ?? []}
      />
      {adminMode && (
        <Box>
          <Button
            onClick={() => {
              undoLastSelection();
              syncDraft();
            }}
            disabled={selections.length === 0}
          >
            Undo Last Selection
          </Button>
        </Box>
      )}
    </Stack>
  );
}
