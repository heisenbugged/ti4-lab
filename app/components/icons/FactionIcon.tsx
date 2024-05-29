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
