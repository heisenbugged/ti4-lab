import { Button, ButtonProps, Loader } from "@mantine/core";
import { factionAudios, LineType } from "~/data/factionAudios";
import type { FactionId } from "~/types";

interface VoiceLineControlProps {
  faction: FactionId;
  type: LineType;
  loadingAudio: string | null;
  onPlay: () => void;
  onStop: () => void;
  width?: number | string;
  label?: string;
}

const voiceLineConfig: Record<
  LineType,
  {
    color: ButtonProps["color"];
    width?: string;
    size?: ButtonProps["size"];
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
      size={config.size ?? "compact-md"}
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
