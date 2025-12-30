import { ActionIcon, Group, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NumberStepper } from "~/components/NumberStepper";
import { IconDice6Filled, IconSettings } from "@tabler/icons-react";
import { NewDraftFaction } from "../components/NewDraftFaction";
import { useDraft, useHasBanPhase } from "~/draftStore";
import type { FactionId } from "~/types";

export function AvailableFactionsSection() {
  const {
    addRandomFaction,
    removeLastFaction,
    randomizeFactions,
    removeFaction,
    openFactionSettings,
  } = useDraft((state) => state.actions);

  const hasBanPhase = useHasBanPhase();

  const factionPool = useDraft((state) =>
    state.factionPool.filter(
      (f: FactionId) => !state.draft.availableMinorFactions?.includes(f),
    ),
  );

  const { numFactions, availableFactions } = useDraft((state) => ({
    numFactions: state.draft.settings.numFactions,
    availableFactions: state.draft.availableFactions,
  }));

  const draftGameMode = useDraft(
    (state) => state.draft.settings.draftGameMode,
  );

  // Hide faction section entirely for Twilight's Fall mode
  if (draftGameMode === "twilightsFall") return null;

  if (hasBanPhase) {
    return (
      <Section>
        <SectionTitle title="Faction Pool">
          <Group gap="sm">
            <Group gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                Count
              </Text>
              <Text size="sm" fw={600} c="purple.3">
                {numFactions}
              </Text>
            </Group>
            <NumberStepper
              decrease={removeLastFaction}
              increase={addRandomFaction}
              decreaseDisabled={numFactions <= 6}
              increaseDisabled={numFactions >= factionPool.length}
            />
          </Group>
        </SectionTitle>

        <Text c="dimmed" px="sm">
          Factions pool will be made during the draft after the ban phase
        </Text>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group gap="sm">
          <Group gap={4}>
            <Tooltip label="Randomize factions" withArrow position="top">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onMouseDown={randomizeFactions}
              >
                <IconDice6Filled size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Configure pool" withArrow position="top">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onMouseDown={openFactionSettings}
              >
                <IconSettings size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Group gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Count
            </Text>
            <Text size="sm" fw={600} c="purple.3">
              {numFactions}
            </Text>
          </Group>
          <NumberStepper
            decrease={removeLastFaction}
            increase={addRandomFaction}
            decreaseDisabled={numFactions <= 6}
            increaseDisabled={numFactions >= factionPool.length}
          />
        </Group>
      </SectionTitle>
      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 3, md: 4, xl: 6, xxl: 8 }}
        spacing="xs"
      >
        {availableFactions.map((factionId, idx) => (
          <NewDraftFaction
            key={`${factionId}-${idx}`}
            faction={factions[factionId]}
            onRemove={() => removeFaction(factionId)}
            removeEnabled={availableFactions.length > 6}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
