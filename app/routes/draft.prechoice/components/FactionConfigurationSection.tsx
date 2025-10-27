import { Box, Button, Input } from "@mantine/core";
import { IconAlienFilled } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { FactionSettingsModal } from "~/components/FactionSettingsModal";
import { NumberStepper } from "~/components/NumberStepper";
import { getFactionPool } from "~/utils/factions";
import { FactionId, FactionStratification } from "~/types";
import { useDraftSetup } from "../store";

export function FactionConfigurationSection() {
  const faction = useDraftSetup((state) => state.faction);
  const playerCount = useDraftSetup((state) => state.player.players.length);
  const factionGameSets = useDraftSetup((state) =>
    state.content.getFactionGameSets(),
  );
  const factionConstraints = faction.getFactionConstraints();

  const [
    factionSettingsOpened,
    { open: openFactionSettings, close: closeFactionSettings },
  ] = useDisclosure(false);

  const handleSaveFactionSettings = (
    allowedFactionsParam: FactionId[],
    requiredFactionsParam: FactionId[],
    stratifiedConfigParam: FactionStratification | undefined,
  ) => {
    faction.setStratification(
      allowedFactionsParam,
      requiredFactionsParam,
      stratifiedConfigParam,
    );
    closeFactionSettings();
  };

  return (
    <>
      <FactionSettingsModal
        buttonText="Save"
        opened={factionSettingsOpened}
        numPlayers={playerCount}
        factionPool={getFactionPool(factionGameSets)}
        factionGameSets={factionGameSets}
        savedAllowedFactions={faction.allowedFactions}
        savedRequiredFactions={faction.requiredFactions}
        savedStratifiedConfig={faction.stratifiedConfig}
        onClose={closeFactionSettings}
        onSave={handleSaveFactionSettings}
      />

      <Input.Wrapper
        label="# of Factions"
        description="The number factions available for the draft. Recommended is player count + 3. Can be changed during draft building."
      >
        <Box mt="xs">
          <NumberStepper
            value={faction.numFactions}
            decrease={faction.decrementNumFactions}
            increase={faction.incrementNumFactions}
            decreaseDisabled={
              !!faction.preassignedFactions ||
              faction.numFactions <= factionConstraints.minNumFactions
            }
            increaseDisabled={
              !!faction.preassignedFactions ||
              faction.numFactions >= factionConstraints.maxNumFactions
            }
          />
        </Box>
      </Input.Wrapper>

      <Button
        variant="outline"
        color="orange"
        w="fit-content"
        rightSection={<IconAlienFilled />}
        onMouseDown={openFactionSettings}
      >
        Configure faction pool
      </Button>
    </>
  );
}
