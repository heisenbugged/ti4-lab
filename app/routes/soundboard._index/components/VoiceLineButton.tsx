import { Button, ButtonProps, Loader, Badge, Group } from "@mantine/core";
import { factionAudios, LineType, FactionAudio } from "~/data/factionAudios";
import type { FactionId } from "~/types";
import styles from "./VoiceLineButton.module.css";

interface VoiceLineControlProps {
  faction: FactionId;
  type: LineType;
  loadingAudio: string | null;
  onPlay: () => void;
  onStop: () => void;
  onRemoveFromQueue?: () => void;
  size?: ButtonProps["size"];
  width?: number | string;
  label?: string;
  isQueued?: boolean;
  lineCount?: number;
  variant?: "primary" | "secondary" | "tertiary";
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
  size,
  isQueued = false,
  lineCount,
  variant = "secondary",
}: VoiceLineControlProps) {
  const isLoading = loadingAudio === `${faction}-${type}`;
  const isDisabled = !factionAudios[faction]?.[type as keyof FactionAudio];

  const variantClass =
    variant === "primary"
      ? styles.primary
      : variant === "tertiary"
        ? styles.tertiary
        : styles.secondary;

  return (
    <button
      className={`${styles.voiceLineButton} ${variantClass} ${isQueued ? styles.queued : ""} ${isLoading ? styles.loading : ""} ${isDisabled ? styles.disabled : ""}`}
      disabled={isDisabled}
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
      style={{ width: width }}
    >
      {/* Always render text to maintain button size, hide when loading */}
      <span className={`${styles.label} ${isLoading ? styles.labelHidden : ""}`}>
        {isQueued ? "Queued" : label}
      </span>
      {/* Loader overlays the hidden text */}
      {isLoading && (
        <span className={styles.loaderOverlay}>
          <Loader size={14} type="bars" color="currentColor" />
        </span>
      )}
      {!isLoading && !isQueued && lineCount !== undefined && lineCount > 1 && (
        <span className={styles.badge}>{lineCount}</span>
      )}
    </button>
  );
}
