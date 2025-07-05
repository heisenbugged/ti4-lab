import { Button, ButtonProps, Loader, Badge, Group } from "@mantine/core";
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
  lineCount?: number; // Remaining count of voice lines
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
  roleplayYes: {
    color: "gray",
    width: "80px",
  },
  roleplayNo: {
    color: "gray",
    width: "80px",
  },
  roleplayIRefuse: {
    color: "gray",
    width: "120px",
  },
  roleplayDealWithIt: {
    color: "gray",
    width: "120px",
  },
  roleplayNotEnough: {
    color: "gray",
    width: "120px",
  },
  roleplayTooMuch: {
    color: "gray",
    width: "120px",
  },
  roleplaySabotage: {
    color: "gray",
    width: "120px",
  },
  roleplayFire: {
    color: "gray",
    width: "80px",
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
  lineCount,
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
      style={{ position: "relative", overflow: "visible" }}
    >
      {isLoading ? (
        <Loader size="xs" type="bars" color={config.color} />
      ) : isQueued ? (
        "Queued"
      ) : (
        label
      )}
      {!isLoading && !isQueued && lineCount !== undefined && lineCount > 1 && (
        <Badge
          size="xs"
          variant="filled"
          c="white"
          pos="absolute"
          top="-6px"
          right="-6px"
          fz="11px"
          h="16px"
          miw="16px"
          p="0 4px"
        >
          {lineCount}
        </Badge>
      )}
    </Button>
  );
}
