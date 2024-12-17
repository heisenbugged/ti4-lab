import { Box, Button, Grid, Group, SimpleGrid, Text } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { BaseSlice } from "~/components/Slice";
import { systemIdsToSlice } from "~/utils/slice";
import { draftConfig } from "~/draft";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";
import { useCreateDraft } from "./draft.new/useCreateDraft";
import { randomizeFactions } from "~/draftStore";
import { getFactionPool } from "~/utils/factions";
import { generateEmptyMap } from "~/utils/map";
import {
  IconBook,
  IconBook2,
  IconLink,
  IconNotes,
  IconPaperclip,
  IconUserPlus,
} from "@tabler/icons-react";

export default function LGCS4() {
  const slices = [
    {
      name: "Austin",
      systems: ["25", "37", "46", "74", "67"],
    },
    {
      name: "Corpus Christi",
      systems: ["64", "59", "68", "42", "65"],
    },
    {
      name: "DFW",
      systems: ["26", "69", "41", "47", "71"],
    },
    {
      name: "El Paso",
      systems: ["62", "73", "35", "49", "48"],
    },
    {
      name: "Houston",
      systems: ["27", "39", "34", "43", "75"],
    },
    {
      name: "Nagodoches",
      systems: ["79", "38", "28", "22", "50"],
    },
    {
      name: "San Antonio",
      systems: ["44", "66", "32", "40", "24"],
    },
  ].map((slice) =>
    systemIdsToSlice(draftConfig.milty, slice.name, slice.systems),
  );

  const config = draftConfig.milty;

  const createDraft = useCreateDraft();

  const handleCreateDraft = () => {
    createDraft({
      settings: {
        type: "milty",
        factionGameSets: ["base", "pok"],
        tileGameSets: ["base", "pok"],
        draftSpeaker: false,
        allowEmptyTiles: false,
        allowHomePlanetSearch: false,
        numFactions: 8,
        numSlices: 6,
        randomizeMap: true,
        randomizeSlices: true,
        modifiers: { banFactions: { numFactions: 1 } },
      },
      integrations: {},
      players: [
        { id: 0, name: "Player 1" },
        { id: 1, name: "Player 2" },
        { id: 2, name: "Player 3" },
        { id: 3, name: "Player 4" },
        { id: 4, name: "Player 5" },
        { id: 5, name: "Player 6" },
      ],
      slices,
      presetMap: generateEmptyMap(config),
      availableFactions: randomizeFactions(
        8,
        getFactionPool(["base", "pok"]),
        [],
        null,
        null,
      ),
      selections: [],
    });
  };

  return (
    <Box mt="lg">
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SectionTitle title="Lone Star Galactic Council Tournament 4" />
          <Text pl="sm" pr="sm" mt="sm">
            Welcome to the Fourth Lone Star Galactic Council tournament, a
            weekend of intense Twilight Imperium competition complemented by
            casual “For Fun” sessions. Players of all skill levels are invited
            to join this epic gathering, test their strategies, and strive for
            victory under tournament conditions. Prepare for thrilling battles,
            swift diplomacy, and alliances forged among the stars.
          </Text>

          <Group pl="sm" pr="sm" mt="md">
            <Button
              component="a"
              href="https://forms.gle/5QZpx1ZCdtJVtfbx5"
              variant="filled"
              leftSection={<IconUserPlus />}
            >
              Sign up sheet
            </Button>
            <Button
              component="a"
              href="https://docs.google.com/document/d/1_KswlcLCIwlMnRfgO9VxQFIXe8HZaI9m8iMesWsHBUc/edit?tab=t.0"
              variant="filled"
              color="blue"
              leftSection={<IconBook2 />}
            >
              Community Rules
            </Button>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <SectionTitle title="What's Milty Draft?" />
          <Text pl="sm" pr="sm" mt="sm">
            In the Milty Draft format of Twilight Imperium, players draft both
            factions and slices. Each slice contains 3 'blue' tiles with planets
            and 2 'red' tiles (either without planets or with anomalies),
            ensuring an even distribution of resources. Players take turns
            selecting factions, slices, and their starting position on the map.
          </Text>

          <Text pl="sm" pr="sm" mt="sm">
            Use the preview button to see a draft in action.
          </Text>

          <Text pl="sm" pr="sm" mt="sm">
            Note: Use 'pick for anyone' to progress through the draft while
            previewing.
          </Text>

          <Box pl="sm" mt="lg">
            <Button size="xl" onClick={handleCreateDraft}>
              Preview Draft
            </Button>
          </Box>
        </Grid.Col>

        <Grid.Col span={12}>
          <SectionTitle title="Slices">
            <OriginalArtToggle />
          </SectionTitle>
          <SimpleGrid
            mt="lg"
            flex={1}
            cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: 6 }}
            spacing="lg"
            style={{ alignItems: "flex-start" }}
          >
            {slices.map((slice, idx) => (
              <BaseSlice id={`slice-${idx}`} config={config} slice={slice} />
            ))}
          </SimpleGrid>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
