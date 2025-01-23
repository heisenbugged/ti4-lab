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
}

const voiceLineConfig: Record<
  VoiceLineType,
  {
    color: string;
    label: string;
    width?: string;
  }
> = {
  battleLines: {
    color: "green",
    label: "Battle Line",
    width: "120px",
  },
  homeDefense: {
    color: "blue",
    label: "Home Defense",
    width: "140px",
  },
  homeInvasion: {
    color: "red",
    label: "Home Invasion",
    width: "140px",
  },
  jokes: {
    color: "yellow",
    label: "Joke",
  },
};

export function VoiceLineButton({
  faction,
  type,
  loadingAudio,
  onPlay,
  onStop,
  width,
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
        config.label
      )}
    </Button>
  );
}
