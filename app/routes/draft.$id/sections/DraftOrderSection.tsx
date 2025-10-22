import { Anchor, Button, Group, Stack, Switch } from "@mantine/core";
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
import { Link } from "@remix-run/react";
import { IconPlayerPlay, IconShare } from "@tabler/icons-react";

export function DraftOrderSection() {
  const { adminMode, pickForAnyone, setAdminMode, setPickForAnyone } =
    useSafeOutletContext();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { undoLastSelection } = useDraft((state) => state.draftActions);
  const replayMode = useDraft((state) => state.replayMode);
  const draftUrl = useDraft((state) => state.draftUrl);
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

  const ReplayButton = (
    <Button
      component={Link}
      to={`/draft/${draftUrl}/replay`}
      variant="subtle"
      size="compact-sm"
      leftSection={<IconPlayerPlay size={14} />}
      disabled={selections.length === 0}
    >
      Replay
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

      {!replayMode && (
        <>
          <Group hiddenFrom="sm" justify="flex-end">
            {adminMode && <ExportDraftState />}
            {showUndoLastSelection && UndoLastSelection}
            {ReplayButton}
            <OriginalArtToggle />
          </Group>
          <Group hiddenFrom="sm" justify="flex-end">
            {showPickForAnyoneControl && pickForAnyoneControl}
            {adminControl}
          </Group>
        </>
      )}

      {replayMode && (
        <Group hiddenFrom="sm" justify="flex-end">
          <OriginalArtToggle />
        </Group>
      )}

      <SectionTitle title="Draft Order">
        <Group visibleFrom="sm" align="center">
          <Anchor href={`/draft/${draftUrl}.png`} target="_blank">
            <Button
              size="xs"
              color="green"
              leftSection={<IconShare size={18} />}
            >
              Share
            </Button>
          </Anchor>
          <OriginalArtToggle />
          {!replayMode && (
            <>
              {adminMode && <ExportDraftState />}
              {showUndoLastSelection && UndoLastSelection}
              {ReplayButton}
              {showPickForAnyoneControl && pickForAnyoneControl}
              {adminControl}
            </>
          )}
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
