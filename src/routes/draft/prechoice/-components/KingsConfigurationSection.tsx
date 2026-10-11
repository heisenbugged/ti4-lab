import { IconCrown } from "@tabler/icons-react";
import { ListRow, NumberStepper, Panel, Rows } from "~/ui";
import { useDraftSetup } from "../-store";

export function KingsConfigurationSection() {
  const kings = useDraftSetup((state) => state.kings);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <Panel
      title="Kings"
      icon={<IconCrown />}
      iconTint="var(--legendary)"
    >
      <Rows>
        <ListRow label="Kings in pool" hint="Mahact kings available for drafting">
          <NumberStepper
            value={kings.numKings}
            label="kings in pool"
            decrease={() => kings.setNumKings(kings.numKings - 1)}
            increase={() => kings.setNumKings(kings.numKings + 1)}
            decreaseDisabled={kings.numKings <= playerCount}
            increaseDisabled={kings.numKings >= 8}
          />
        </ListRow>
      </Rows>
    </Panel>
  );
}
