import { useSearchParams } from "react-router";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { useState } from "react";
import { Player } from "~/types";
import { IconPlayerPlay } from "@tabler/icons-react";
import { Button, Heading, Notice, SectionHeader, Text, TextInput } from "~/ui";
import classes from "./tournament.module.css";
import { BaseSlice } from "~/components/Slice";
import { systemIdsToSlice } from "~/utils/slice";
import { DraftConfig, draftConfig } from "~/draft";
import { useCreateDraft } from "../draft.new/useCreateDraft";
import { generateEmptyMap } from "~/utils/map";
import { randomizeFactions } from "~/draft/buildInitialDraft";
import { getFactionPool } from "~/utils/factions";
import { shuffle } from "~/draft/helpers/randomization";

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

  const adminPassword = searchParams.get("adminPassword") ?? undefined;

  const handleCreateDraft = () => {
    const adjustedFactions =
      Number(numFactions) - Math.max(0, 6 - players.length);
    const adjustedSliceCount = slices.length - Math.max(0, 6 - players.length);
    const adjustedSlices = shuffle(slices, adjustedSliceCount).sort((a, b) =>
      a.name.localeCompare(b.name),
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
        adminPassword,
        modifiers: factionBan ? { banFactions: { numFactions: 1 } } : {},
      },
      integrations: {},
      players,
      slices: adjustedSlices,
      presetMap: generateEmptyMap(config),
      availableFactions: randomizeFactions(
        adjustedFactions,
        getFactionPool(["base", "pok"]),
        undefined,
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
    <div className={classes.page}>
      <Heading variant="title" as="h1">
        Tournament table setup
      </Heading>

      <section className={classes.setup}>
        <PlayerInputSection
          players={players}
          discordData={undefined}
          onChangeName={handleChangeName}
          onIncreasePlayers={handleAddPlayer}
          onDecreasePlayers={handleRemovePlayer}
          maxPlayers={maxPlayers}
        />
        {players.length < 6 && (
          <Notice tone="warning">
            With fewer than 6 players, one slice and one faction will be
            randomly removed from the pool for each missing player.
          </Notice>
        )}

        <div className={classes.urlName}>
          <SectionHeader title="URL name" />
          <div className={classes.urlRow}>
            <TextInput
              aria-label="Table prefix"
              placeholder="Enter table prefix..."
              value={urlPrefix ?? ""}
              readOnly
              disabled
              className={classes.prefix}
            />
            <span aria-hidden className={classes.dash}>
              -
            </span>
            <TextInput
              aria-label="Table name"
              placeholder="Enter table name..."
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className={classes.tableName}
            />
          </div>
        </div>

        <div className={classes.create}>
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconPlayerPlay />}
            disabled={draftDisabled}
            onMouseDown={handleCreateDraft}
          >
            Create draft
          </Button>

          {errorMessages && (
            <Text tone="danger" size="sm">
              {errorMessages}
            </Text>
          )}
        </div>
      </section>

      <section className={classes.slicesSection}>
        <SectionHeader title="Slices" meta={`${slices.length} slices`} />
        <div className={classes.slices}>
          {slices.map((slice, idx) => (
            <div key={idx} className={classes.slice}>
              <BaseSlice id={`slice-${idx}`} config={config} slice={slice} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
