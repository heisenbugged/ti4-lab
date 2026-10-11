import { useState, type ReactNode } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Button, Modal, PickButton, Stack, Text, cx } from "~/ui";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useSimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { useDraft } from "~/draftStore";
import { SimultaneousPickType, SystemId } from "~/types";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { FaceDownTile } from "~/components/tiles/FaceDownTile";
import { SimultaneousPhaseLayout } from "../-components/SimultaneousPhaseLayout";
import classes from "./TexasTileDraftPhase.module.css";

type Props = {
  phase: SimultaneousPickType;
  title: string;
  description: string;
  color: "blue" | "red";
};

export function TexasTileDraftPhase({
  phase: phaseType,
  title,
  description,
  color,
}: Props) {
  const { stageSimultaneousPick } = useSyncDraft();
  const texasDraft = useDraft((state) => state.draft.texasDraft);
  const [pendingPick, setPendingPick] = useState<SystemId | null>(null);

  const phase = useSimultaneousPickPhase(phaseType);

  const options: SystemId[] =
    phase.currentPlayer && texasDraft?.tileHands
      ? (texasDraft.tileHands[color][phase.currentPlayer.id] ?? [])
      : [];
  const selectedTile =
    phase.currentPlayer && phase.stagingValues
      ? (phase.stagingValues[phase.currentPlayer.id] as SystemId | undefined)
      : undefined;

  const keptTiles: SystemId[] =
    phase.currentPlayer && texasDraft?.tileKeeps
      ? [
          ...(texasDraft.tileKeeps.blue[phase.currentPlayer.id] ?? []),
          ...(texasDraft.tileKeeps.red[phase.currentPlayer.id] ?? []),
        ]
      : [];

  const confirmPendingPick = () => {
    if (!pendingPick || !phase.currentPlayer) return;
    stageSimultaneousPick(phaseType, phase.currentPlayer.id, pendingPick);
    setPendingPick(null);
  };

  const canClick = phase.canSelect && !!phase.currentPlayer;

  return (
    <SimultaneousPhaseLayout
      phase={phase}
      phaseName={title}
      phaseColor={color}
      description={description}
      showPickAnyWarning
      maw={1400}
    >
      <Stack gap={5}>
        {keptTiles.length > 0 && (
          <div>
            <p className={cx(classes.label, classes.kept)}>
              <IconCheck size={14} />
              Kept
            </p>
            <div className={classes.tray}>
              {keptTiles.map((systemId) => (
                <TexasTile
                  key={systemId}
                  systemId={systemId}
                  radius={44}
                  className={classes.keptTile}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className={classes.label}>Choose a tile to keep</p>
          {options.length === 0 && (
            <Text size="sm" tone="muted">
              Tile hands stay hidden until you pick for a player.
            </Text>
          )}
          <div className={classes.options}>
            {options.map((systemId) => {
              const isSelected = selectedTile === systemId;
              return (
                <TexasTile
                  key={systemId}
                  systemId={systemId}
                  radius={56}
                  selected={isSelected}
                  onClick={
                    canClick && !isSelected
                      ? () => setPendingPick(systemId)
                      : undefined
                  }
                  footer={
                    isSelected ? (
                      <PickButton selected />
                    ) : canClick ? (
                      <PickButton
                        aria-label={`Keep tile ${systemId}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingPick(systemId);
                        }}
                      >
                        Keep
                      </PickButton>
                    ) : null
                  }
                />
              );
            })}
          </div>
        </div>
      </Stack>

      <Modal
        opened={pendingPick !== null}
        onClose={() => setPendingPick(null)}
        title="Keep this tile?"
        size="sm"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setPendingPick(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmPendingPick} autoFocus>
              Keep tile
            </Button>
          </>
        }
      >
        {pendingPick && (
          <div className={classes.preview}>
            <RawSystemTile
              mapId={`texas-confirm-${pendingPick}`}
              tile={{
                idx: 0,
                type: "SYSTEM",
                systemId: pendingPick,
                position: { x: 0, y: 0 },
              }}
              radius={64}
              disablePopover
            />
          </div>
        )}
        <Text size="sm" tone="muted" align="center">
          Tile {pendingPick}
        </Text>
      </Modal>
    </SimultaneousPhaseLayout>
  );
}

/** A system tile in a framed slot. Gold frame when selected. */
export function TexasTile({
  systemId,
  radius,
  selected = false,
  faceDown = false,
  faceDownColor = "blue",
  onClick,
  footer,
  className,
}: {
  systemId: SystemId;
  radius: number;
  selected?: boolean;
  faceDown?: boolean;
  faceDownColor?: "blue" | "red";
  onClick?: () => void;
  footer?: ReactNode;
  className?: string;
}) {
  const art = faceDown ? (
    <FaceDownTile
      mapId={`texas-tile-${systemId}`}
      radius={radius}
      color={faceDownColor}
    />
  ) : (
    <RawSystemTile
      mapId={`texas-tile-${systemId}`}
      tile={{ idx: 0, type: "SYSTEM", systemId, position: { x: 0, y: 0 } }}
      radius={radius}
      disablePopover
    />
  );

  // With a footer the footer holds the button; otherwise the tile itself is the button.
  if (footer !== undefined) {
    return (
      <div
        className={cx(classes.tile, className)}
        data-selected={selected || undefined}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : undefined }}
      >
        {art}
        <div className={classes.tileFoot}>{footer}</div>
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={cx(classes.tile, className)}
        aria-pressed={selected}
        aria-label={faceDown ? "Hidden tile" : `Tile ${systemId}`}
        onClick={onClick}
      >
        {art}
      </button>
    );
  }

  return (
    <div
      className={cx(classes.tile, className)}
      data-selected={selected || undefined}
    >
      {art}
    </div>
  );
}
