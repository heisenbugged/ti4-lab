import type { CSSProperties, ReactNode } from "react";
import { IconArrowBackUp } from "@tabler/icons-react";
import { Button, Chip, Tooltip, cx } from "~/ui";
import classes from "./SimultaneousPhaseHeader.module.css";

/** Phase colours, mapped to the game's own colours. */
export type PhaseColor = "blue" | "red" | "green" | "orange";

const phaseTints: Record<PhaseColor, string> = {
  blue: "var(--influence)",
  red: "var(--anomaly)",
  green: "var(--tech-biotic)",
  orange: "var(--wormhole-alpha)",
};

type PhaseBannerProps = {
  /** Any CSS colour: a phase tint or a player colour. */
  tint: string;
  /** Content of the round badge (a letter or number), or a custom node such as a PlayerHex. */
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Controls on the right (wrap under the text on phones). */
  children?: ReactNode;
  className?: string;
};

/** Tinted banner naming the phase (or the player on the clock) with a one-line instruction. */
export function PhaseBanner({
  tint,
  badge,
  title,
  description,
  children,
  className,
}: PhaseBannerProps) {
  return (
    <div
      className={cx(classes.banner, className)}
      style={{ "--p": tint } as CSSProperties}
    >
      {typeof badge === "string" || typeof badge === "number" ? (
        <span className={classes.badge} aria-hidden>
          {badge}
        </span>
      ) : (
        badge
      )}
      <div className={classes.text}>
        <h2 className={classes.title}>{title}</h2>
        {description && <p className={classes.description}>{description}</p>}
      </div>
      {children && <div className={classes.actions}>{children}</div>}
    </div>
  );
}

type SimultaneousPhaseHeaderProps = {
  phaseName: string;
  phaseColor: PhaseColor;
  description: string;
  adminMode: boolean;
  onAdminToggle: () => void;
  showPickForAnyoneControl: boolean;
  pickForAnyone: boolean;
  onTogglePickForAnyone: () => void;
  showUndo: boolean;
  onUndoPick: () => void;
  onUndoPhase: () => void;
  undoPickDisabled: boolean;
  undoPhaseDisabled: boolean;
  showPickAnyWarning?: boolean;
  maw?: number;
};

export function SimultaneousPhaseHeader({
  phaseName,
  phaseColor,
  description,
  adminMode,
  onAdminToggle,
  showPickForAnyoneControl,
  pickForAnyone,
  onTogglePickForAnyone,
  showUndo,
  onUndoPick,
  onUndoPhase,
  undoPickDisabled,
  undoPhaseDisabled,
  showPickAnyWarning = false,
  maw,
}: SimultaneousPhaseHeaderProps) {
  const pickAnyChip = (
    <Chip pressed={pickForAnyone} onChange={onTogglePickForAnyone}>
      Pick for any player
    </Chip>
  );

  return (
    <div
      className={classes.header}
      style={maw ? ({ "--maw": `${maw}px` } as CSSProperties) : undefined}
    >
      <PhaseBanner
        tint={phaseTints[phaseColor]}
        badge={phaseName.charAt(0).toUpperCase()}
        title={phaseName}
        description={description}
      >
        <Chip pressed={adminMode} onChange={onAdminToggle}>
          Admin
        </Chip>
        {showPickForAnyoneControl &&
          (showPickAnyWarning ? (
            <Tooltip
              label="Reveals hidden information. Use with caution."
              side="bottom"
            >
              {pickAnyChip}
            </Tooltip>
          ) : (
            pickAnyChip
          ))}
        {showUndo && (
          <>
            <Button
              size="sm"
              variant="tertiary"
              icon={<IconArrowBackUp size={15} />}
              onClick={onUndoPick}
              disabled={undoPickDisabled}
            >
              Undo pick
            </Button>
            <Button
              size="sm"
              variant="tertiary"
              icon={<IconArrowBackUp size={15} />}
              onClick={onUndoPhase}
              disabled={undoPhaseDisabled}
            >
              Undo phase
            </Button>
          </>
        )}
      </PhaseBanner>
    </div>
  );
}
