import { FactionId } from "~/types";
import { Button, Container, Group, Stack } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { SectionTitle } from "~/components/Section";
import { useState } from "react";

type Props = {
  factionIds: FactionId[];
  onFactionSelected: (factionId: FactionId) => void;
};

export function SelectFaction({ factionIds, onFactionSelected }: Props) {
  const [selectedFaction, setSelectedFaction] = useState<FactionId | undefined>(
    undefined,
  );
  const handleFactionPressed = (factionId: FactionId) => {
    setSelectedFaction(factionId);
  };

  const handleContinuePressed = () => {
    if (!selectedFaction) return;
    onFactionSelected(selectedFaction);
  };
  return (
    <Container>
      <Stack gap="lg" mt="xl">
        <SectionTitle title="Select Faction" />
        {factionIds.map((factionId) => (
          <Button
            key={factionId}
            size="xl"
            leftSection={
              <FactionIcon
                faction={factionId}
                style={{
                  width: 32,
                  height: 32,
                  marginRight: 12,
                }}
              />
            }
            onClick={() => handleFactionPressed(factionId)}
            variant={selectedFaction === factionId ? "filled" : "outline"}
            color="blue"
          >
            {factions[factionId].name}
          </Button>
        ))}
        <Button
          size="xl"
          onClick={handleContinuePressed}
          disabled={!selectedFaction}
        >
          Continue
        </Button>
      </Stack>
    </Container>
  );
}
