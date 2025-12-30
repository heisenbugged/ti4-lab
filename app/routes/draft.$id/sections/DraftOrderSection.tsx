import { ActionIcon, Box, Button, Group, Stack } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { DraftOrder } from "../components/DraftOrder";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { ExportDraftState } from "../components/ExportDraftState";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useState } from "react";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { notifications } from "@mantine/notifications";
import { Link } from "@remix-run/react";
import {
  IconPlayerPlay,
  IconShare,
  IconVolume,
  IconVolumeOff,
  IconArrowBackUp,
  IconPhoto,
  IconPhotoOff,
} from "@tabler/icons-react";
import {
  isAudioAlertEnabled,
  setAudioAlertEnabled,
} from "~/utils/audioAlert";

export function DraftOrderSection() {
  const { adminMode, pickForAnyone, setAdminMode, setPickForAnyone, originalArt, setOriginalArt } =
    useSafeOutletContext();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const replayMode = useDraft((state) => state.replayMode);
  const draftUrl = useDraft((state) => state.draftUrl);
  const { undoLastPick } = useSyncDraft();
  const { hydratedPlayers, currentPick } = useHydratedDraft();
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);
  const adminPassword = useDraft((state) => state.draft.settings.adminPassword);
  const hasAdminPassword = adminPassword !== undefined;

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

  const [audioAlertEnabled, setAudioAlertEnabledState] = useState(
    isAudioAlertEnabled(),
  );

  const handleAudioToggle = () => {
    const newValue = !audioAlertEnabled;
    setAudioAlertEnabled(newValue);
    setAudioAlertEnabledState(newValue);
    notifications.show({
      title: newValue ? "Audio alerts enabled" : "Audio alerts disabled",
      message: newValue
        ? "You'll hear a sound when it's your turn to draft"
        : "You won't hear sounds when it's your turn",
      color: newValue ? "blue" : "gray",
    });
  };

  const handleAdminToggle = () => {
    if (adminMode) {
      setAdminMode(false);
      return;
    }
    if (hasAdminPassword) {
      setPasswordModalOpen(true);
    } else {
      setAdminMode(true);
    }
  };

  const handleUndo = async () => {
    if (confirm("Are you sure you want to undo the last selection?")) {
      await undoLastPick();
    }
  };

  // Compact control bar with grouped controls using Mantine components
  const ControlBar = (
    <Group gap="xs" wrap="wrap">
      {/* Primary action: Share */}
      <Button
        component="a"
        href={`/draft/${draftUrl}.png`}
        target="_blank"
        rel="noreferrer"
        size="compact-xs"
        color="green"
        leftSection={<IconShare size={12} />}
      >
        Share
      </Button>

      {/* Art toggle - prominent with different colors for each state */}
      <Button
        size="compact-xs"
        variant="filled"
        color={originalArt ? "orange" : "violet"}
        leftSection={originalArt ? <IconPhoto size={14} /> : <IconPhotoOff size={14} />}
        onClick={() => setOriginalArt(!originalArt)}
        title={originalArt ? "Switch to abstract tiles" : "Switch to original art"}
      >
        {originalArt ? "Original" : "Lab Art"}
      </Button>

      {/* Other view controls */}
      <Group gap={4}>
        <ActionIcon
          size="sm"
          variant={audioAlertEnabled ? "filled" : "default"}
          color={audioAlertEnabled ? "violet" : "gray"}
          onClick={handleAudioToggle}
          title={audioAlertEnabled ? "Disable audio alerts" : "Enable audio alerts"}
        >
          {audioAlertEnabled ? <IconVolume size={14} /> : <IconVolumeOff size={14} />}
        </ActionIcon>
        <ActionIcon
          component={Link}
          to={`/draft/${draftUrl}/replay`}
          size="sm"
          variant="default"
          color="gray"
          disabled={selections.length === 0}
          title="Watch replay"
          onClick={(e: React.MouseEvent) => selections.length === 0 && e.preventDefault()}
        >
          <IconPlayerPlay size={14} />
        </ActionIcon>
      </Group>

      {/* Admin controls - only show when not in replay mode */}
      {!replayMode && (
        <>
          <Group gap={4}>
            {/* Admin mode toggle */}
            <Button
              size="compact-xs"
              variant={adminMode ? "filled" : "default"}
              color={adminMode ? "violet" : "gray"}
              onClick={handleAdminToggle}
              title="Toggle admin mode"
            >
              Admin
            </Button>

            {/* Pick for anyone - only when allowed */}
            {showPickForAnyoneControl && (
              <Button
                size="compact-xs"
                variant={pickForAnyone ? "filled" : "default"}
                color={pickForAnyone ? "violet" : "gray"}
                onClick={() => setPickForAnyone(!pickForAnyone)}
                title="Pick for any player"
              >
                Pick Any
              </Button>
            )}
          </Group>

          {/* Destructive/admin actions */}
          {(showUndoLastSelection || adminMode) && (
            <Group gap={4}>
              {showUndoLastSelection && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  leftSection={<IconArrowBackUp size={12} />}
                  onClick={handleUndo}
                  disabled={selections.length === 0}
                  title="Undo last selection"
                >
                  Undo
                </Button>
              )}
              {adminMode && <ExportDraftState />}
            </Group>
          )}
        </>
      )}
    </Group>
  );

  return (
    <Stack>
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <SectionTitle title="Draft Order">
        <Box visibleFrom="xs">{ControlBar}</Box>
      </SectionTitle>

      {/* Mobile control bar - below title */}
      <Box hiddenFrom="xs">{ControlBar}</Box>

      <DraftOrder
        players={hydratedPlayers}
        pickOrder={pickOrder}
        currentPick={currentPick}
      />
    </Stack>
  );
}
