import type { CSSProperties, ReactNode } from "react";
import { cx } from "~/ui";
import { factionAudios, LineType, FactionAudio } from "~/data/factionAudios";
import type { FactionId } from "~/types";
import styles from "./VoiceLineButton.module.css";

/** Three animated bars shown on the line that is playing. */
export function LevelMeter() {
  return (
    <i className={styles.eq} aria-hidden="true">
      <b />
      <b />
      <b />
    </i>
  );
}

/** Orange "A" badge used for the announcer. */
export function AnnouncerBadge({ size = 24 }: { size?: number }) {
  return (
    <span
      className={styles.announcerBadge}
      style={{ width: size, height: size, fontSize: Math.round(size / 2) }}
      aria-hidden="true"
    >
      A
    </span>
  );
}

type VoiceButtonProps = {
  label: ReactNode;
  playing?: boolean;
  queued?: boolean;
  disabled?: boolean;
  /** Lines left; shown as a bubble when more than one. */
  count?: number;
  /** Combat lines are ion tinted. */
  combat?: boolean;
  size?: "md" | "lg";
  width?: number | string;
  onClick: () => void;
};

/** Presentational soundboard button: idle, playing (gold with level meter) or queued (dashed). */
export function VoiceButton({
  label,
  playing = false,
  queued = false,
  disabled = false,
  count,
  combat = false,
  size = "md",
  width,
  onClick,
}: VoiceButtonProps) {
  const style: CSSProperties | undefined =
    width !== undefined ? { width } : undefined;
  return (
    <button
      type="button"
      className={cx(
        styles.vbtn,
        combat && styles.combat,
        playing && styles.playing,
        queued && styles.queued,
        size === "lg" && styles.lg,
      )}
      disabled={disabled}
      aria-pressed={playing}
      onClick={onClick}
      style={style}
      title={
        playing ? "Stop" : queued ? "Queued. Press to remove from queue" : undefined
      }
    >
      {playing && <LevelMeter />}
      <span className={styles.label}>{queued ? "Queued" : label}</span>
      {!playing && !queued && count !== undefined && count > 1 && (
        <em className={styles.badge} title={`${count} lines left`}>
          {count}
        </em>
      )}
    </button>
  );
}

interface VoiceLineControlProps {
  faction: FactionId;
  type: LineType;
  loadingAudio: string | null;
  onPlay: () => void;
  onStop: () => void;
  onRemoveFromQueue?: () => void;
  width?: number | string;
  label?: string;
  isQueued?: boolean;
  lineCount?: number;
  /** primary = combat line (ion tinted). */
  variant?: "primary" | "secondary" | "tertiary";
  size?: "md" | "lg";
}

export function VoiceLineButton({
  faction,
  type,
  loadingAudio,
  onPlay,
  onStop,
  onRemoveFromQueue,
  width,
  label,
  isQueued = false,
  lineCount,
  variant = "secondary",
  size = "md",
}: VoiceLineControlProps) {
  const isLoading = loadingAudio === `${faction}-${type}`;
  const isDisabled = !factionAudios[faction]?.[type as keyof FactionAudio];

  return (
    <VoiceButton
      label={label}
      playing={isLoading}
      queued={isQueued}
      disabled={isDisabled}
      count={lineCount}
      combat={variant === "primary"}
      size={size}
      width={width}
      onClick={() => {
        if (isLoading) {
          onStop();
          return;
        }
        if (isQueued && onRemoveFromQueue) {
          onRemoveFromQueue();
          return;
        }
        onPlay();
      }}
    />
  );
}
