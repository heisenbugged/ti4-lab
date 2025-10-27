import { SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import { IconDice, IconUser, IconUsersGroup } from "@tabler/icons-react";
import { HoverRadioCard } from "~/components/HoverRadioCard";
import { NumberStepper } from "~/components/NumberStepper";
import { useDraftSetup } from "../store";
import { isMiltyVariant, isMiltyEqVariant } from "../maps";

export function MinorFactionsSection() {
  const faction = useDraftSetup((state) => state.faction);
  const mapType = useDraftSetup((state) => state.map.selectedMapType);
  const factionConstraints = faction.getFactionConstraints();

  // Only show for Milty variants
  if (!isMiltyVariant(mapType) && !isMiltyEqVariant(mapType)) {
    return null;
  }

  return (
    <Stack>
      <Switch
        label="Minor Factions"
        description="Enable minor factions variant"
        checked={!!faction.minorFactionsMode}
        onChange={faction.toggleMinorFactions}
      />
      {faction.minorFactionsMode && isMiltyEqVariant(mapType) && (
        <>
          <Text size="sm" c="dimmed" mt="xs">
            Choose minor factions mode:
          </Text>
          <SimpleGrid cols={3} spacing="md">
            <HoverRadioCard
              title="Random"
              icon={<IconDice size={24} />}
              description="Randomly preplaces home systems"
              checked={faction.minorFactionsMode.mode === "random"}
              onMouseDown={() => faction.setMinorFactionsMode("random")}
            />

            <HoverRadioCard
              title="Shared Pool"
              icon={<IconUsersGroup size={24} />}
              description="Draft minor factions from the same pool as regular factions"
              checked={faction.minorFactionsMode.mode === "sharedPool"}
              onMouseDown={() => faction.setMinorFactionsMode("shared")}
            />

            <HoverRadioCard
              title="Separate Pool"
              icon={<IconUser size={24} />}
              description="Draft minor factions from a separate pool"
              checked={faction.minorFactionsMode.mode === "separatePool"}
              onMouseDown={() => faction.setMinorFactionsMode("separate")}
            >
              {faction.minorFactionsMode.mode === "separatePool" && (
                <NumberStepper
                  value={faction.minorFactionsMode.numMinorFactions}
                  decrease={(e) => {
                    e.stopPropagation();
                    faction.decrementMinorFactions();
                  }}
                  increase={(e) => {
                    e.stopPropagation();
                    faction.incrementMinorFactions();
                  }}
                  decreaseDisabled={
                    faction.minorFactionsMode.numMinorFactions <=
                    factionConstraints.minMinorFactions
                  }
                  increaseDisabled={
                    faction.minorFactionsMode.numMinorFactions >=
                    factionConstraints.maxMinorFactions
                  }
                />
              )}
            </HoverRadioCard>
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}
