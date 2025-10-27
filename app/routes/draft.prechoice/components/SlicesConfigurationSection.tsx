import { Box, Input } from "@mantine/core";
import { NumberStepper } from "~/components/NumberStepper";
import { useDraftSetup } from "../store";

export function SlicesConfigurationSection() {
  const slices = useDraftSetup((state) => state.slices);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <Input.Wrapper
      label="# of Slices"
      description="The number of slices that will be available for the draft. Can be changed during draft building."
    >
      <Box mt="xs">
        <NumberStepper
          value={slices.numSlices}
          decrease={() => slices.setNumSlices(slices.numSlices - 1)}
          increase={() => slices.setNumSlices(slices.numSlices + 1)}
          decreaseDisabled={slices.numSlices <= playerCount}
          increaseDisabled={slices.numSlices >= 9}
        />
      </Box>
    </Input.Wrapper>
  );
}
