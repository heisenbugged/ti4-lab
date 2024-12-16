import { Button, Group, Stack, Switch } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { DraftOrder } from "../components/DraftOrder";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { ExportDraftState } from "../components/ExportDraftState";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export function DraftOrderSection() {
  const { adminMode, pickForAnyone, setAdminMode, setPickForAnyone } =
    useSafeOutletContext();
  const { undoLastSelection } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { hydratedPlayers, currentPick } = useHydratedDraft();
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);

  const UndoLastSelection = (
    <Button
      onClick={() => {
        if (confirm("Are you sure you want to undo the last selection?")) {
          undoLastSelection();
          syncDraft();
        }
      }}
      disabled={selections.length === 0}
    >
      Undo Last Selection
    </Button>
  );
  const pickForAnyoneControl = (
    <Switch
      label="Pick for anyone"
      // visibleFrom="sm"
      checked={pickForAnyone}
      onChange={(e) => {
        setPickForAnyone(e.currentTarget.checked);
        if (e.currentTarget.checked) {
          setAdminMode(false);
        }
      }}
    />
  );
  const adminControl = (
    <Switch
      // visibleFrom="sm"
      label="Admin mode"
      checked={adminMode}
      onChange={(e) => {
        setAdminMode(e.currentTarget.checked);
        if (e.currentTarget.checked) {
          setPickForAnyone(false);
        }
      }}
    />
  );

  return (
    <Stack>
      <Group hiddenFrom="sm" justify="flex-end">
        <OriginalArtToggle />
      </Group>
      <Group hiddenFrom="sm" justify="flex-end">
        {pickForAnyoneControl}
        {adminControl}
      </Group>

      <Group hiddenFrom="sm" justify="flex-end">
        {adminMode && <ExportDraftState />}
        {UndoLastSelection}
      </Group>

      <SectionTitle title="Draft Order">
        <Group visibleFrom="sm" align="center">
          <OriginalArtToggle />
          {adminMode && <ExportDraftState />}
          {UndoLastSelection}
          {pickForAnyoneControl}
          {adminControl}
        </Group>
      </SectionTitle>
      <DraftOrder
        players={hydratedPlayers}
        pickOrder={pickOrder}
        currentPick={currentPick}
      />
    </Stack>
  );
}
