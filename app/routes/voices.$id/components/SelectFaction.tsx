import { FactionId } from "~/types";
import { Button, Container, Group, Stack, Box } from "@mantine/core";
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
    <Box style={{ position: "relative", minHeight: "100vh" }}>
      <Container style={{ paddingBottom: "100px" }}>
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
        </Stack>
      </Container>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          backgroundColor: "var(--mantine-color-body)",
          borderTop: "1px solid var(--mantine-color-gray-8)",
          zIndex: 100,
        }}
      >
        <Container>
          <Button
            size="xl"
            onClick={handleContinuePressed}
            disabled={!selectedFaction}
            fullWidth
          >
            Continue
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
