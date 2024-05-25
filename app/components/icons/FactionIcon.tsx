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
    <Box visibleFrom={visibleFrom} hiddenFrom={hiddenFrom}>
      <img src={factions[faction].iconPath} style={style} />
    </Box>
  );
}
