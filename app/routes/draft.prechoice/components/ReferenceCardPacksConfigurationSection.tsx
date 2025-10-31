import { Box, Input } from "@mantine/core";
import { NumberStepper } from "~/components/NumberStepper";
import { useDraftSetup } from "../store";

export function ReferenceCardPacksConfigurationSection() {
  const referenceCardPacks = useDraftSetup((state) => state.referenceCardPacks);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <Input.Wrapper
      label="# of Reference Card Packs"
      description={`Each pack contains 3 factions. Defaults to number of players (${playerCount}), max 10 packs (30 factions total).`}
    >
      <Box mt="xs">
        <NumberStepper
          value={referenceCardPacks.numReferenceCardPacks}
          decrease={() =>
            referenceCardPacks.setNumReferenceCardPacks(
              referenceCardPacks.numReferenceCardPacks - 1,
            )
          }
          increase={() =>
            referenceCardPacks.setNumReferenceCardPacks(
              referenceCardPacks.numReferenceCardPacks + 1,
            )
          }
          decreaseDisabled={
            referenceCardPacks.numReferenceCardPacks <= playerCount
          }
          increaseDisabled={referenceCardPacks.numReferenceCardPacks >= 10}
        />
      </Box>
    </Input.Wrapper>
  );
}
