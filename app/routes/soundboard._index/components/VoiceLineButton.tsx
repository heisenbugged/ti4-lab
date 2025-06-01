import { Button, ButtonProps, Loader } from "@mantine/core";
import { factionAudios, LineType } from "~/data/factionAudios";
import type { FactionId } from "~/types";

interface VoiceLineControlProps {
  faction: FactionId;
  type: LineType;
  loadingAudio: string | null;
  onPlay: () => void;
  onStop: () => void;
  size?: ButtonProps["size"];
  width?: number | string;
  label?: string;
  isQueued?: boolean;
}

const voiceLineConfig: Record<
  LineType,
  {
    color: ButtonProps["color"];
    size?: ButtonProps["size"];
    width?: string;
  }
> = {
  battleLines: {
    color: "green",
    width: "120px",
  },
  defenseOutnumbered: {
    color: "teal",
    width: "110px",
    size: "compact-xs",
  },
  offenseSuperior: {
    color: "teal",
    width: "110px",
    size: "compact-xs",
  },
  homeDefense: {
    color: "blue",
    width: "200px",
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
    width: "180px",
  },
  special2: {
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
  size,
  isQueued = false,
}: VoiceLineControlProps) {
  const config = voiceLineConfig[type];
  const isLoading = loadingAudio === `${faction}-${type}`;
  const isDisabled = !factionAudios[faction]?.[type];

  return (
    <Button
      variant={isQueued ? "outline" : "light"}
      color={config.color}
      size={size ?? config.size ?? "compact-md"}
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
      ) : isQueued ? (
        "Queued"
      ) : (
        label
      )}
    </Button>
  );
}
