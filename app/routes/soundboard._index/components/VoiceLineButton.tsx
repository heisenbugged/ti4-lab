import { Button, Loader } from "@mantine/core";
import { factionAudios } from "~/data/factionAudios";
import type { FactionId } from "~/types";

type VoiceLineType = "battleLines" | "homeDefense" | "homeInvasion" | "jokes";

interface VoiceLineControlProps {
  faction: FactionId;
  type: VoiceLineType;
  loadingAudio: string | null;
  onPlay: () => void;
  onStop: () => void;
  width?: number | string;
  label?: string;
}

const voiceLineConfig: Record<
  VoiceLineType,
  {
    color: string;
    width?: string;
  }
> = {
  battleLines: {
    color: "green",
    width: "120px",
  },
  homeDefense: {
    color: "blue",
    width: "140px",
  },
  homeInvasion: {
    color: "red",
    width: "140px",
  },
  jokes: {
    color: "yellow",
  },
  special: {
    color: "purple",
    width: "150px",
  },
};

export function VoiceLineButton({
  faction,
  type,
  loadingAudio,
  onPlay,
  onStop,
  width,
  label,
}: VoiceLineControlProps) {
  const config = voiceLineConfig[type];
  const isLoading = loadingAudio === `${faction}-${type}`;
  const isDisabled = !factionAudios[faction]?.[type];

  return (
    <Button
      variant="light"
      color={config.color}
      size="compact-md"
      disabled={isDisabled}
      onClick={() => {
        if (isLoading) {
          onStop();
          return;
        }
        onPlay();
      }}
      w={width ?? config.width}
    >
      {isLoading ? (
        <Loader size="xs" type="bars" color={config.color} />
      ) : (
        label ?? config.label
      )}
    </Button>
  );
}
