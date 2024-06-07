import { Box, MantineSize } from "@mantine/core";
import { factions } from "~/data/factionData";
import { FactionId } from "~/types";

type Props = {
  faction: FactionId;
  style?: React.CSSProperties;
  visibleFrom?: MantineSize;
  hiddenFrom?: MantineSize;
};

export function FactionIcon({
  faction,
  style,
  visibleFrom,
  hiddenFrom,
}: Props) {
  // Box can mess with layout for reasons not totally understood,
  // so avoid its use, if possible
  if (!visibleFrom && !hiddenFrom) {
    return (
      <img
        src={factions[faction].iconPath}
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
          ...style,
        }}
      />
    );
  }

  return (
    <Box visibleFrom={visibleFrom} hiddenFrom={hiddenFrom} style={style}>
      <img
        src={factions[faction].iconPath}
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
}
