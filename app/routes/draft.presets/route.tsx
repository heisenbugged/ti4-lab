import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Input,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { SectionTitle } from "~/components/Section";
import { BaseSlice } from "~/components/Slice";
import { draftConfig } from "~/draft";
import { SystemId } from "~/types";
import { generateEmptyMap, optimalStatsForSystems } from "~/utils/map";
import { systemIdsToSlice } from "~/utils/slice";
import { systemsFromIds } from "~/utils/system";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { NumberStepper } from "~/components/NumberStepper";
import { getFactionPool } from "~/utils/factions";
import { useCreateDraft } from "../draft.new/useCreateDraft";
import { shuffle } from "~/draft/helpers/randomization";

type PresetCardProps = {
  sliceIDs: SystemId[][];
  title: string;
  badge: string;
  onClick: () => void;
};

const defaultPlayers = [
  { name: "", id: 0 },
  { name: "", id: 1 },
  { name: "", id: 2 },
  { name: "", id: 3 },
  { name: "", id: 4 },
  { name: "", id: 5 },
];

function usePresetCardStats(sliceIds: SystemId[][]) {
  const slices = sliceIds.map((ids, idx) => {
    const slice = systemIdsToSlice(draftConfig.milty, `Slice ${idx + 1}`, ids);
    const systems = systemsFromIds(ids);
    const { resources, influence, flex } = optimalStatsForSystems(systems);
    return {
      slice,
      optimalStats: {
        resources: resources + flex * 0.5,
        influence: influence + flex * 0.5,
      },
    };
  });

  const totalWormholes = sliceIds.flat().reduce((acc, id) => {
    const system = systemsFromIds([id])[0];
    return acc + system.wormholes.length;
  }, 0);

  const totalStats = slices.reduce(
    (acc, slice) => {
      acc.resources += slice.optimalStats.resources;
      acc.influence += slice.optimalStats.influence;
      return acc;
    },
    { resources: 0, influence: 0 },
  );

  const totalPlanets = sliceIds.flat().reduce((acc, id) => {
    const system = systemsFromIds([id])[0];
    return acc + system.planets.length;
  }, 0);

  const normalize = (value: number) => {
    return Math.round(value * (6 / sliceIds.length));
  };

  return {
    totalResources: normalize(totalStats.resources),
    totalInfluence: normalize(totalStats.influence),
    totalWormholes: normalize(totalWormholes),
    totalPlanets: normalize(totalPlanets),
  };
}

type PresetDraftStartProps = {
  modalOpen: boolean;
  sliceIds: SystemId[][];
  title: string;
  onClick: () => void;
  onClose: () => void;
};

function PresetDraftStart({
  modalOpen,
  sliceIds,
  title,
  onClose,
}: PresetDraftStartProps) {
  const [players, setPlayers] = useState(defaultPlayers);
  const { totalResources, totalInfluence, totalWormholes, totalPlanets } =
    usePresetCardStats(sliceIds);

  const [numFactions, setNumFactions] = useState(6);
  const maxFactionCount = getFactionPool(["base", "pok"]).length;

  const createDraft = useCreateDraft();

  const handleCreateDraft = () => {
    const availableFactions = shuffle(getFactionPool(["base", "pok"])).slice(
      0,
      numFactions,
    );
    createDraft({
      availableFactions,
      settings: {
        numFactions,
        numSlices: sliceIds.length,
        allowEmptyTiles: false,
        allowHomePlanetSearch: false,
        draftSpeaker: false,
        factionGameSets: ["base", "pok"],
        tileGameSets: ["base", "pok"],
        randomizeMap: false,
        randomizeSlices: false,
        type: "milty",
        draftPlayerColors: false,
      },
      integrations: {},
      players: defaultPlayers,
      presetMap: generateEmptyMap(draftConfig.milty),
      selections: [],
      slices: sliceIds.map((slice, idx) =>
        systemIdsToSlice(draftConfig.milty, `Slice ${idx + 1}`, slice),
      ),
    });
  };

  return (
    <Modal
      opened={modalOpen}
      onClose={onClose}
      fullScreen
      title="Loading Preset"
    >
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }} order={{ base: 2, md: 1 }}>
          <SimpleGrid
            cols={{ base: 1, xs: 2, sm: 3, md: 2, lg: 3, xxl: 3 }}
            spacing="lg"
            style={{ alignItems: "flex-start" }}
          >
            {sliceIds.map((slice, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <BaseSlice
                  id={idx.toString()}
                  slice={systemIdsToSlice(
                    draftConfig.milty,
                    `Slice ${idx + 1}`,
                    slice,
                  )}
                  mapModifiable={false}
                  config={draftConfig.milty}
                />
              </div>
            ))}
          </SimpleGrid>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }} order={{ base: 1, md: 2 }}>
          <Stack>
            <SectionTitle title={title} />
            <Table verticalSpacing={4}>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Planets</Table.Td>
                  <Table.Td>{totalPlanets}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Resources</Table.Td>
                  <Table.Td>{totalResources}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Influence</Table.Td>
                  <Table.Td>{totalInfluence}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Wormholes</Table.Td>
                  <Table.Td>{totalWormholes}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <PlayerInputSection
              players={players}
              discordData={{
                guildId: "",
                channelId: "",
                players: [],
              }}
              onChangeName={(id, name) => {
                setPlayers((p) =>
                  p.map((p) => (p.id === id ? { ...p, name } : p)),
                );
              }}
            />

            <Input.Wrapper
              label="# of Factions"
              description="The number factions available for the draft."
            >
              <Box mt="xs">
                <NumberStepper
                  value={numFactions}
                  decrease={() => setNumFactions((v) => v - 1)}
                  increase={() => setNumFactions((v) => v + 1)}
                  decreaseDisabled={numFactions <= 6}
                  increaseDisabled={numFactions >= maxFactionCount}
                />
              </Box>
            </Input.Wrapper>
          </Stack>

          <Button onClick={handleCreateDraft} mt="xl" fullWidth size="lg">
            Start Draft
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}

function PresetCard({ sliceIDs, title, onClick }: PresetCardProps) {
  const { totalResources, totalInfluence, totalWormholes, totalPlanets } =
    usePresetCardStats(sliceIDs);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder miw={300}>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{title}</Text>
        {/* <Badge color="blue">{badge}</Badge> */}
      </Group>

      <Table verticalSpacing={4}>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Planets</Table.Td>
            <Table.Td>{totalPlanets}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Resources</Table.Td>
            <Table.Td>{totalResources}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Influence</Table.Td>
            <Table.Td>{totalInfluence}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Wormholes</Table.Td>
            <Table.Td>{totalWormholes}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>

      <Button fullWidth mt="md" radius="md" onClick={onClick}>
        Load
      </Button>
    </Card>
  );
}

const pastDrafts = [
  {
    title: "SCPT 2025 Qualifiers",
    badge: "milty",
    sliceIDs: [
      ["27", "73", "47", "44", "26"],
      ["30", "39", "76", "80", "65"],
      ["79", "37", "50", "71", "66"],
      ["42", "64", "75", "72", "49"],
      ["34", "41", "70", "78", "25"],
      ["40", "20", "36", "45", "74"],
    ],
  },
  {
    title: "SCPT 2024 Finals",
    badge: "milty",
    sliceIDs: [
      ["34", "22", "67", "77", "66"],
      ["41", "32", "47", "59", "69"],
      ["35", "25", "44", "73", "49"],
      ["40", "75", "42", "24", "26"],
      ["39", "76", "62", "43", "64"],
      ["27", "50", "72", "79", "65"],
    ],
  },
  {
    title: "SCPT 2024 Semifinals",
    badge: "milty",
    sliceIDs: [
      ["68", "49", "36", "25", "63"],
      ["23", "79", "75", "62", "50"],
      ["64", "32", "42", "70", "67"],
      ["39", "66", "19", "48", "76"],
      ["26", "74", "78", "24", "43"],
      ["20", "27", "59", "40", "41"],
    ],
  },
  {
    title: "SCPT 2024 Prelims",
    badge: "milty",
    sliceIDs: [
      ["33", "62", "41", "25", "32"],
      ["44", "36", "19", "40", "72"],
      ["45", "70", "35", "64", "78"],
      ["50", "74", "65", "26", "63"],
      ["69", "21", "23", "79", "49"],
      ["38", "59", "42", "39", "24"],
    ],
  },
  {
    title: "SCPT 2024 Qualifiers",
    badge: "milty",
    sliceIDs: [
      ["32", "66", "68", "63", "39"],
      ["26", "76", "49", "19", "41"],
      ["64", "35", "65", "22", "79"],
      ["50", "37", "45", "61", "36"],
      ["25", "73", "78", "59", "62"],
      ["72", "75", "80", "21", "40"],
    ],
  },
  {
    title: "SCPT 2023 Finals",
    badge: "milty",
    sliceIDs: [
      ["77", "22", "59", "67", "65"],
      ["46", "25", "29", "31", "45"],
      ["78", "64", "74", "37", "41"],
      ["61", "40", "70", "68", "36"],
      ["73", "39", "24", "80", "71"],
      ["42", "26", "72", "35", "47"],
      ["49", "79", "28", "62", "76"],
    ],
  },
  {
    title: "SCPT 2023 Semifinals",
    badge: "milty",
    sliceIDs: [
      ["75", "59", "48", "66", "39"],
      ["47", "69", "79", "19", "30"],
      ["64", "50", "29", "42", "72"],
      ["25", "37", "46", "41", "71"],
      ["49", "34", "26", "67", "27"],
      ["45", "24", "28", "38", "40"],
      ["35", "78", "76", "43", "65"],
    ],
  },
  {
    title: "SCPT 2023 Prelims",
    badge: "milty",
    sliceIDs: [
      ["63", "40", "72", "46", "68"],
      ["45", "64", "34", "62", "49"],
      ["36", "25", "24", "50", "41"],
      ["48", "22", "66", "79", "32"],
      ["39", "61", "59", "43", "71"],
      ["42", "26", "73", "78", "21"],
      ["47", "70", "65", "44", "19"],
    ],
  },
  {
    title: "SCPT 2023 Qualifiers",
    badge: "milty",
    sliceIDs: [
      ["30", "63", "46", "67", "61"],
      ["21", "66", "69", "40", "80"],
      ["27", "23", "48", "79", "62"],
      ["35", "78", "42", "26", "72"],
      ["45", "75", "24", "64", "50"],
      ["31", "37", "49", "25", "41"],
      ["65", "47", "59", "39", "36"],
    ],
  },
  {
    title: "SCPT 2022 Finals",
    badge: "milty",
    sliceIDs: [
      ["79", "35", "34", "64", "77"],
      ["40", "37", "31", "65", "41"],
      ["27", "29", "49", "45", "25"],
      ["39", "66", "69", "47", "74"],
      ["67", "28", "50", "73", "26"],
      ["78", "76", "68", "20", "19"],
    ],
  },
  {
    title: "SCPT 2022 Semifinals",
    badge: "milty",
    sliceIDs: [
      ["48", "25", "70", "67", "28"],
      ["23", "64", "33", "78", "65"],
      ["21", "40", "69", "50", "38"],
      ["35", "39", "34", "44", "61"],
      ["41", "26", "30", "77", "73"],
      ["72", "79", "32", "22", "66"],
    ],
  },
  {
    title: "SCPT 2022 Qualifiers",
    badge: "milty",
    sliceIDs: [
      ["39", "35", "41", "66", "74"],
      ["26", "30", "59", "67", "49"],
      ["27", "69", "78", "64", "44"],
      ["43", "61", "36", "40", "73"],
      ["50", "37", "76", "20", "68"],
      ["65", "24", "46", "79", "28"],
      ["42", "25", "29", "47", "62"],
    ],
  },
  {
    title: "SCPT 2022 Prelims",
    badge: "milty",
    sliceIDs: [
      ["28", "19", "25", "43", "47"],
      ["34", "77", "36", "41", "64"],
      ["37", "60", "39", "50", "67"],
      ["42", "75", "78", "59", "24"],
      ["76", "66", "40", "62", "44"],
      ["68", "73", "79", "20", "65"],
      ["46", "71", "63", "31", "26"],
    ],
  },
  {
    title: "SCPT 2022 Qualifiers",
    badge: "milty",
    sliceIDs: [
      ["39", "35", "41", "66", "74"],
      ["26", "30", "59", "67", "49"],
      ["27", "69", "78", "64", "44"],
      ["43", "61", "36", "40", "73"],
      ["50", "37", "76", "20", "68"],
      ["65", "24", "46", "79", "28"],
      ["42", "25", "29", "47", "62"],
    ],
  },
  {
    title: "SCPT 2021 Invitational",
    badge: "milty",
    sliceIDs: [
      ["66", "34", "47", "62", "41"],
      ["29", "67", "48", "22", "61"],
      ["65", "69", "39", "20", "80"],
      ["35", "45", "26", "19", "78"],
      ["73", "40", "21", "60", "68"],
      ["23", "63", "79", "49", "37"],
      ["72", "42", "59", "77", "25"],
      ["64", "76", "24", "46", "44"],
    ],
  },
];

export default function DraftPresets() {
  const [selectedPastDraft, setSelectedPastDraft] = useState<
    (typeof pastDrafts)[number] | undefined
  >(undefined);

  return (
    <Box mt="lg">
      <SectionTitle title="Draft Compendium" />
      <Text size="lg" px="lg" my="lg">
        The compendium contains popular draft presets that can be used to
        quickly start a draft. These presets come from past tournaments,
        community events, and other sources.
      </Text>

      <SectionTitle title="SCPT Tournaments" />

      <Group align="flex-start" px="lg" mt="lg">
        {pastDrafts.map((draft) => (
          <PresetCard
            key={draft.title}
            sliceIDs={draft.sliceIDs}
            title={draft.title}
            badge={draft.badge}
            onClick={() => setSelectedPastDraft(draft)}
          />
        ))}
      </Group>

      <PresetDraftStart
        modalOpen={selectedPastDraft !== undefined}
        sliceIds={selectedPastDraft?.sliceIDs ?? []}
        title={selectedPastDraft?.title ?? ""}
        onClick={() => setSelectedPastDraft(undefined)}
        onClose={() => setSelectedPastDraft(undefined)}
      />
    </Box>
  );
}
