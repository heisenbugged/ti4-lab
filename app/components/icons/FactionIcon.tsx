import { Box, MantineSize } from "@mantine/core";
import { factions } from "~/data/factionData";
import { FactionId } from "~/types";

type Props = {
  faction: FactionId;
  style?: React.CSSProperties;
  visibleFrom?: MantineSize;
  hiddenFrom?: MantineSize;
  className?: string;
};

export function FactionIcon({
  faction,
  style,
  visibleFrom,
  hiddenFrom,
  className,
}: Props) {
  // Box can mess with layout for reasons not totally understood,
  // so avoid its use, if possible
  if (!visibleFrom && !hiddenFrom) {
    return (
      <img
        src={factions[faction].iconPath}
        style={{
          objectFit: "contain",
          ...style,
          ...(className && { className }),
        }}
        alt={factions[faction].name}
      />
    );
  }

  return (
    <Box
      visibleFrom={visibleFrom}
      hiddenFrom={hiddenFrom}
      style={style}
      className={className}
    >
      <img
        src={factions[faction].iconPath}
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
        }}
        alt={factions[faction].name}
      />
    </Box>
  );
}
