import { IconHexagons } from "@tabler/icons-react";
import { ListRow, NumberStepper, Panel, Rows } from "~/ui";
import { useDraftSetup } from "../-store";

type Props = {
  maxSlices: number;
};

export function SlicesConfigurationSection({ maxSlices }: Props) {
  const slices = useDraftSetup((state) => state.slices);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <Panel
      title="Slices"
      icon={<IconHexagons />}
      iconTint="var(--legendary)"
    >
      <Rows>
        <ListRow
          label="Slices in pool"
          hint={`Available slices for the draft, up to ${maxSlices}`}
        >
          <NumberStepper
            value={slices.numSlices}
            label="slices in pool"
            decrease={() => slices.setNumSlices(slices.numSlices - 1)}
            increase={() => slices.setNumSlices(slices.numSlices + 1)}
            decreaseDisabled={slices.numSlices <= playerCount}
            increaseDisabled={slices.numSlices >= maxSlices}
          />
        </ListRow>
      </Rows>
    </Panel>
  );
}
