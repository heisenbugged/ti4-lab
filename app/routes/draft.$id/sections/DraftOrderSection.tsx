import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconArrowBackUp,
  IconBell,
  IconBellOff,
  IconChevronDown,
  IconCopy,
  IconHandFinger,
  IconLink,
  IconPhoto,
  IconPlayerPlay,
  IconShare,
  IconUserShield,
} from "@tabler/icons-react";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  MenuSeparator,
  notify,
  useClipboard,
} from "~/ui";
import { DraftOrder } from "../components/DraftOrder";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { useAdminControls } from "../components/useAdminControls";
import { getDraftOrderEntries, shortSelectionLabel } from "../components/draftOrderUtils";
import { isAudioAlertEnabled,
  AUDIO_ALERT_CHANGE_EVENT, setAudioAlertEnabled } from "~/utils/audioAlert";
import classes from "../components/DraftLayout.module.css";

/** Pick order with every round, the draft link and the draft tools. */
export function DraftOrderSection() {
  const navigate = useNavigate();
  const { originalArt, setOriginalArt } = useSafeOutletContext();
  const {
    adminMode,
    pickForAnyone,
    setPickForAnyone,
    showPickForAnyoneControl,
    showUndoLastSelection,
    passwordModalOpen,
    setPasswordModalOpen,
    handleAdminPasswordSubmit,
    handleAdminToggle,
  } = useAdminControls();

  const replayMode = useDraft((state) => state.replayMode);
  const draftUrl = useDraft((state) => state.draftUrl);
  const slices = useDraft((state) => state.draft.slices);
  const { undoLastPick } = useSyncDraft();
  const { hydratedPlayers, currentPick } = useHydratedDraft();
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);
  const [audioAlertEnabled, setAudioAlertEnabledState] = useState(false);
  // Read the stored preference after hydration (the server has no localStorage).
  useEffect(() => {
    const sync = () => setAudioAlertEnabledState(isAudioAlertEnabled());
    sync();
    window.addEventListener(AUDIO_ALERT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(AUDIO_ALERT_CHANGE_EVENT, sync);
  }, []);
  const { copy } = useClipboard();

  const link = `https://tidraft.com/draft/${draftUrl}`;
  const entries = getDraftOrderEntries(pickOrder, hydratedPlayers, currentPick);
  const position = entries.findIndex((e) => e.isActive);

  const lastSelection = selections[selections.length - 1];
  const lastPlayer =
    lastSelection && "playerId" in lastSelection
      ? hydratedPlayers.find((p) => p.id === lastSelection.playerId)
      : undefined;
  const undoHint = lastSelection
    ? `Takes back ${lastPlayer ? `${lastPlayer.name}'s ` : ""}${shortSelectionLabel(lastSelection, { slices }) ?? "last pick"}`
    : "Nothing to undo yet";

  const handleAudioToggle = () => {
    const newValue = !audioAlertEnabled;
    setAudioAlertEnabled(newValue);
    setAudioAlertEnabledState(newValue);
    notify({
      title: newValue ? "Sound alerts on" : "Sound alerts off",
      message: newValue
        ? "You'll hear a sound when it's your turn to draft"
        : "You won't hear sounds when it's your turn",
      tone: "info",
    });
  };

  return (
    <section className={classes.orderSection}>
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <div className={classes.orderbar}>
        <h3 className={classes.orderTitle}>Pick order</h3>
        {position >= 0 && (
          <span className={classes.progress}>
            Pick {position + 1} of {entries.length}
          </span>
        )}
        <span className={classes.url} title={link}>
          <IconLink size={14} />
          <span>tidraft.com/draft/{draftUrl}</span>
        </span>
        <div className={classes.tools}>
          <div className={classes.toolgrp} role="toolbar" aria-label="Draft tools">
            <IconButton
              size="sm"
              label={audioAlertEnabled ? "Sound alerts on" : "Sound alerts off"}
              pressed={audioAlertEnabled}
              onClick={handleAudioToggle}
            >
              {audioAlertEnabled ? <IconBell /> : <IconBellOff />}
            </IconButton>
            <IconButton
              size="sm"
              label="Watch replay"
              disabled={selections.length === 0}
              onClick={() => navigate(`/draft/${draftUrl}/replay`)}
            >
              <IconPlayerPlay />
            </IconButton>
            <IconButton
              size="sm"
              label={originalArt ? "Original art (switch to Lab art)" : "Lab art (switch to original art)"}
              pressed={originalArt}
              onClick={() => setOriginalArt(!originalArt)}
            >
              <IconPhoto />
            </IconButton>
            <IconButton
              size="sm"
              label="Share draft image"
              onClick={() => window.open(`/draft/${draftUrl}.png`, "_blank", "noreferrer")}
            >
              <IconShare />
            </IconButton>
          </div>
          <Menu
            trigger={
              <Button size="sm" iconRight={<IconChevronDown size={14} />}>
                More
              </Button>
            }
          >
            <MenuItem
              icon={<IconCopy />}
              description={`tidraft.com/draft/${draftUrl}`}
              onClick={() => {
                copy(link);
                notify({ title: "Draft link copied", tone: "success" });
              }}
            >
              Copy draft link
            </MenuItem>
            {!replayMode && showUndoLastSelection && (
              <MenuItem
                icon={<IconArrowBackUp />}
                description={undoHint}
                disabled={selections.length === 0}
                onClick={undoLastPick}
              >
                Undo last pick
              </MenuItem>
            )}
            {!replayMode && (
              <>
                <MenuSeparator />
                {showPickForAnyoneControl && (
                  <MenuItem
                    icon={<IconHandFinger />}
                    description="Shows hidden choices to everyone"
                    checked={pickForAnyone}
                    onClick={() => setPickForAnyone(!pickForAnyone)}
                  >
                    Pick for any player
                  </MenuItem>
                )}
                <MenuItem
                  icon={<IconUserShield />}
                  description="Asks for the draft password"
                  checked={adminMode}
                  onClick={handleAdminToggle}
                >
                  Admin mode
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>

      <DraftOrder
        players={hydratedPlayers}
        pickOrder={pickOrder}
        currentPick={currentPick}
        draft={{ slices, selections }}
      />
    </section>
  );
}
