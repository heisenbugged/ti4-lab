import { useSearchParams } from "@remix-run/react";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { useState } from "react";
import { Player } from "~/types";
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { BaseSlice } from "~/components/Slice";
import { systemIdsToSlice } from "~/utils/slice";
import { DraftConfig, draftConfig } from "~/draft";
import { useCreateDraft } from "../draft.new/useCreateDraft";
import { generateEmptyMap } from "~/utils/map";
import { randomizeFactions } from "~/draftStore";
import { getFactionPool } from "~/utils/factions";
import { fisherYatesShuffle } from "~/stats";

const configByPlayerCount: Record<number, DraftConfig> = {
  4: draftConfig.milty4p,
  5: draftConfig.milty5p,
  6: draftConfig.milty,
  7: draftConfig.milty7p,
  8: draftConfig.milty8p,
};

export default function DraftTournament() {
  const [searchParams] = useSearchParams();
  const [tableName, setTableName] = useState("");
  const [players, setPlayers] = useState<Player[]>([
    ...[0, 1, 2, 3, 4, 5].map((i) => ({
      id: i,
      name: "",
    })),
  ]);
  const createDraft = useCreateDraft();

  const config = configByPlayerCount[players.length] as DraftConfig;
  const draftDisabled =
    players.some((player) => player.name === "") || !tableName;

  const slicesParam = searchParams.get("slices")!;
  const slices = slicesParam
    .split(";")
    .map((subStr) => {
      const parts = subStr.split(",");
      const [name, ...systemIds] = parts;
      return { name, systemIds };
    })
    .map((slice) => systemIdsToSlice(config, slice.name, slice.systemIds));
  const factionBan = searchParams.get("factionBan") === "1";
  const numFactions = searchParams.get("numFactions") ?? 8;
  const urlPrefix = searchParams.get("urlPrefix");

  const handleCreateDraft = () => {
    const adjustedFactions =
      Number(numFactions) - Math.max(0, 6 - players.length);
    const adjustedSliceCount = slices.length - Math.max(0, 6 - players.length);
    const adjustedSlices = fisherYatesShuffle(slices, adjustedSliceCount).sort(
      (a, b) => a.name.localeCompare(b.name),
    );

    createDraft({
      settings: {
        type: config.type,
        factionGameSets: ["base", "pok"],
        tileGameSets: ["base", "pok"],
        draftSpeaker: false,
        allowEmptyTiles: false,
        allowHomePlanetSearch: false,
        numFactions: adjustedFactions,
        numSlices: adjustedSliceCount,
        randomizeMap: true,
        randomizeSlices: true,
        modifiers: factionBan ? { banFactions: { numFactions: 1 } } : {},
      },
      integrations: {},
      players,
      slices: adjustedSlices,
      presetMap: generateEmptyMap(config),
      availableFactions: randomizeFactions(
        adjustedFactions,
        getFactionPool(["base", "pok"]),
        [],
        null,
        null,
      ),
      selections: [],
      presetUrl: `${urlPrefix}-${tableName}`,
    });
  };

  const handleChangeName = (playerIdx: number, name: string) => {
    setPlayers((players) =>
      players.map((player) =>
        player.id === playerIdx ? { ...player, name } : player,
      ),
    );
  };

  const handleAddPlayer = () =>
    setPlayers((players) => [...players, { id: players.length, name: "" }]);

  const handleRemovePlayer = () =>
    setPlayers((players) => players.slice(0, players.length - 1));

  const errorMessages = [
    players.some((player) => player.name === "") &&
      "Please fill in all player names",
    !tableName && "Please enter a table name",
  ]
    .filter(Boolean)
    .join(", ");

  const maxPlayers = Math.min(8, slices.length);

  return (
    <Box mt="lg">
      <SectionTitle title="Tournament Table Setup" />
      <Grid gutter="xl" mt="xl">
        <Grid.Col span={12} pl="xl" pr="xl">
          <PlayerInputSection
            players={players}
            discordData={undefined}
            onChangeName={handleChangeName}
            onIncreasePlayers={handleAddPlayer}
            onDecreasePlayers={handleRemovePlayer}
            maxPlayers={maxPlayers}
          />
          {players.length < 6 && (
            <Alert color="orange.9" mt="xs" variant="filled" fw="bold">
              With fewer than 6 players, one slice and one faction will be
              randomly removed from the pool for each missing player
            </Alert>
          )}

          <Text size="xl" fw={700} mb="sm" mt="lg">
            URL name
          </Text>
          <Group>
            <TextInput
              size="xl"
              placeholder="Enter table prefix..."
              value={urlPrefix ?? ""}
              readOnly
              disabled
            />
            -
            <TextInput
              size="xl"
              placeholder="Enter table name..."
              flex={1}
              value={tableName}
              miw={200}
              onChange={(e) => setTableName(e.target.value)}
            />
          </Group>
          <Button
            mt="xl"
            size="xl"
            disabled={draftDisabled}
            fullWidth
            onMouseDown={handleCreateDraft}
          >
            Create Draft
          </Button>

          {errorMessages && (
            <Text c="red" size="sm" mt="xs">
              {errorMessages}
            </Text>
          )}
        </Grid.Col>

        <Grid.Col span={12}>
          <SectionTitle title="Slices" />
          <SimpleGrid
            mt="lg"
            flex={1}
            cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: 6 }}
            spacing="lg"
            style={{ alignItems: "flex-start" }}
          >
            {slices.map((slice, idx) => (
              <BaseSlice
                key={idx}
                id={`slice-${idx}`}
                config={config}
                slice={slice}
              />
            ))}
          </SimpleGrid>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
