import { CSSProperties, ReactNode } from "react";
import { cx } from "~/ui";
import { useSimultaneousUndo } from "~/hooks/useSimultaneousUndo";
import { SimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { AdminPasswordModal } from "./AdminPasswordModal";
import { PlayerSelectionSidebar } from "./PlayerSelectionSidebar";
import { PhaseColor, SimultaneousPhaseHeader } from "./SimultaneousPhaseHeader";
import { SpectatorModeNotice } from "./SpectatorModeNotice";
import { useAdminControls } from "./useAdminControls";
import classes from "./SimultaneousPhaseLayout.module.css";

type Props = {
  phase: SimultaneousPickPhase;
  phaseName: string;
  phaseColor: PhaseColor;
  description: string;
  showPickAnyWarning?: boolean;
  maw: number;
  /** Below this breakpoint the player list stacks above the content. */
  stackBelow?: "md" | "lg";
  children: ReactNode;
};

export function SimultaneousPhaseLayout({
  phase,
  phaseName,
  phaseColor,
  description,
  showPickAnyWarning,
  maw,
  stackBelow = "md",
  children,
}: Props) {
  const {
    adminMode,
    showPickForAnyoneControl,
    showUndoLastSelection,
    passwordModalOpen,
    setPasswordModalOpen,
    handleAdminPasswordSubmit,
    handleAdminToggle,
  } = useAdminControls();
  const undo = useSimultaneousUndo(
    phase.phase,
    phase.currentPlayer?.id,
    phase.stagingValues,
  );

  const waitingCount = phase.hydratedPlayers.filter(
    (p) => phase.stagingValues?.[p.id] === undefined,
  ).length;
  const sentence = /[.!?]$/.test(description) ? description : `${description}.`;
  const fullDescription =
    waitingCount > 0
      ? `${sentence} ${waitingCount === 1 ? "1 player is" : `${waitingCount} players are`} still choosing.`
      : sentence;

  return (
    <div
      className={classes.page}
      style={{ "--maw": `${maw}px` } as CSSProperties}
    >
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <SimultaneousPhaseHeader
        phaseName={phaseName}
        phaseColor={phaseColor}
        description={fullDescription}
        adminMode={adminMode}
        onAdminToggle={handleAdminToggle}
        showPickForAnyoneControl={showPickForAnyoneControl}
        pickForAnyone={phase.pickForAnyone}
        onTogglePickForAnyone={phase.togglePickForAnyone}
        showUndo={showUndoLastSelection}
        onUndoPick={undo.handleUndoPick}
        onUndoPhase={undo.handleUndoPhase}
        undoPickDisabled={undo.undoPickDisabled}
        undoPhaseDisabled={undo.undoPhaseDisabled}
        showPickAnyWarning={showPickAnyWarning}
        maw={maw}
      />

      {phase.isSpectatorMode && (
        <div className={classes.notice}>
          <SpectatorModeNotice />
        </div>
      )}

      <div
        className={cx(
          classes.grid,
          stackBelow === "lg" ? classes.stackBelowLg : classes.stackBelowMd,
        )}
      >
        <PlayerSelectionSidebar
          players={phase.hydratedPlayers}
          pickForAnyone={phase.pickForAnyone}
          selectedPlayerId={phase.selectedPlayerId}
          defaultPlayerId={phase.defaultPlayerId}
          stagingValues={phase.stagingValues}
          onPlayerSelect={phase.setSelectedPlayerId}
          onPlayerHover={phase.setHoveredPlayerId}
          currentPlayerId={phase.currentPlayer?.id}
          spectatorMode={phase.isSpectatorMode}
        />

        <div className={classes.content}>{children}</div>
      </div>
    </div>
  );
}
