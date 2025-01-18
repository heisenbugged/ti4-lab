import { Button, Group, Stack, Switch } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { DraftOrder } from "../components/DraftOrder";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { ExportDraftState } from "../components/ExportDraftState";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useState } from "react";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { notifications } from "@mantine/notifications";

export function DraftOrderSection() {
  const { adminMode, pickForAnyone, setAdminMode, setPickForAnyone } =
    useSafeOutletContext();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { undoLastSelection } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { hydratedPlayers, currentPick } = useHydratedDraft();
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);
  const adminPassword = useDraft((state) => state.draft.settings.adminPassword);
  const hasAdminPassword = adminPassword !== undefined;

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
      checked={pickForAnyone}
      onChange={(e) => {
        setPickForAnyone(e.currentTarget.checked);
      }}
    />
  );
  const adminControl = (
    <Switch
      // visibleFrom="sm"
      label="Admin mode"
      checked={adminMode}
      onChange={(e) => {
        // can turn off without the password.
        if (!e.currentTarget.checked) {
          setAdminMode(false);
          return;
        }

        if (hasAdminPassword) {
          setPasswordModalOpen(true);
        } else {
          setAdminMode(e.currentTarget.checked);
        }
      }}
    />
  );

  const handleAdminPasswordSubmit = (password: string) => {
    if (password === adminPassword) {
      setAdminMode(true);
    } else {
      notifications.show({
        title: "Incorrect password",
        message: "Please try again",
        color: "red",
      });
    }
    setPasswordModalOpen(false);
  };

  const showPickForAnyoneControl = !hasAdminPassword || adminMode;
  const showUndoLastSelection = !hasAdminPassword || adminMode;

  return (
    <Stack>
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <Group hiddenFrom="sm" justify="flex-end">
        {adminMode && <ExportDraftState />}
        {showUndoLastSelection && UndoLastSelection}
        <OriginalArtToggle />
      </Group>
      <Group hiddenFrom="sm" justify="flex-end">
        {showPickForAnyoneControl && pickForAnyoneControl}
        {adminControl}
      </Group>

      <SectionTitle title="Draft Order">
        <Group visibleFrom="sm" align="center">
          <OriginalArtToggle />
          {adminMode && <ExportDraftState />}
          {showUndoLastSelection && UndoLastSelection}
          {showPickForAnyoneControl && pickForAnyoneControl}
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
