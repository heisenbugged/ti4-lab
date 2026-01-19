import { Card, Group, Stack, Table, Text } from "@mantine/core";
import { useDraft } from "~/draftStore";
import { PlayerChip } from "./PlayerChip";
import { factions } from "~/data/factionData";
import { optimalStatsForSystems } from "~/utils/map";
import { Slice, Faction, HydratedPlayer, System } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { DraftConfig } from "~/draft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValue } from "~/hooks/useSliceValue";

import classes from "./MidDraftSummary.module.css";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";

export function MidDraftSummary() {
  const config = useDraftConfig();
  const slices = useDraft((state) => state.draft.slices);
  const draftPlayerColors = useDraft(
    (state) => state.draft.settings.draftPlayerColors,
  );
  const draftSpeaker = useDraft((state) => state.draft.settings.draftSpeaker);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const { hydratedPlayers } = useHydratedDraft();
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const usingMinorFactions = useDraft(
    (state) =>
      state.draft.settings.minorFactionsInSharedPool ||
      state.draft.availableMinorFactions !== undefined,
  );
  const showSeat = draftSpeaker || draftGameMode === "texasStyle";
  const showSlice = draftGameMode !== "texasStyle";
  const playerOrder =
    draftGameMode === "texasStyle"
      ? [...hydratedPlayers]
          .sort((a, b) => (a.speakerOrder ?? 0) - (b.speakerOrder ?? 0))
          .map((player) => player.id)
      : pickOrder
          .filter((entry): entry is number => typeof entry === "number")
          .slice(0, hydratedPlayers.length);

  return (
    <>
      <Stack mt="lg" hiddenFrom="sm">
        {hydratedPlayers.map((p) => (
          <SummaryCard
            config={config}
            key={p.id}
            player={p}
            slice={p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined}
            showSeat={showSeat}
            showMinorFaction={usingMinorFactions}
            showPlayerColor={!!draftPlayerColors}
          />
        ))}
      </Stack>
      <Table visibleFrom="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Faction</Table.Th>
            {usingMinorFactions && <Table.Th>Minor Faction</Table.Th>}
            <Table.Th>Speaker Order</Table.Th>
            {showSeat && <Table.Th>Seat</Table.Th>}
            {showSlice && <Table.Th w="260px">Slice</Table.Th>}
            {draftPlayerColors && <Table.Th>Color</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {playerOrder.map((id) => {
            const player = hydratedPlayers.find((p) => p.id === id);
            if (!player) return null;
            return (
              <SummaryRow
                config={config}
                key={player.id}
                player={player}
                slice={
                  player.sliceIdx !== undefined
                    ? slices[player.sliceIdx]
                    : undefined
                }
                showSeat={showSeat}
                showSlice={showSlice}
                showMinorFaction={usingMinorFactions}
                showPlayerColor={!!draftPlayerColors}
              />
            );
          })}
        </Table.Tbody>
      </Table>
    </>
  );
}

type Props = {
  config: DraftConfig;
  player: HydratedPlayer;
  slice?: Slice;
  showSeat: boolean;
  showSlice?: boolean;
  showMinorFaction: boolean;
  showPlayerColor: boolean;
};

export function SummaryCard({
  player,
  slice,
  showSeat,
  showPlayerColor,
}: Props) {
  const sliceValue = useSliceValue(slice);
  let faction: Faction | undefined;
  let minorFaction: Faction | undefined;
  let systems: System[] | undefined;
  let optimal:
    | { resources: number; influence: number; flex: number }
    | undefined;

  if (player.faction) faction = factions[player.faction];
  if (player.minorFaction) minorFaction = factions[player.minorFaction];
  if (slice) {
    systems = systemsInSlice(slice);
    optimal = optimalStatsForSystems(systems);
  }

  return (
    <Card shadow="xs" padding="md" withBorder>
      <Group justify="space-between">
        <PlayerChip player={player} />
        <Group gap="sm">
          {sliceValue !== undefined && (
            <Text fw={700} c="yellow.5">
              SV: {sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}
            </Text>
          )}
          {optimal && (
            <Group gap={4}>
              <PlanetStatsPill
                size="sm"
                resources={optimal.resources}
                influence={optimal.influence}
                flex={optimal.flex}
              />
              <Text size="xs" c="dimmed">
                ({optimal.resources + optimal.influence + optimal.flex})
              </Text>
            </Group>
          )}
        </Group>
      </Group>
      <Group justify="space-between" mt="lg">
        <Group className={classes.chooseFaction} px="xs">
          {faction ? (
            <>
              <FactionIcon faction={faction.id} style={{ height: 24 }} />
              <Text size="sm">{faction.name}</Text>
            </>
          ) : (
            <Text size="sm">Faction not chosen</Text>
          )}
        </Group>
      </Group>

      {faction && (
        <Group mt="xs">
          <FactionHelpInfo faction={faction} />
        </Group>
      )}

      {slice !== undefined && (
        <Group mt="lg">
          <SliceFeatures slice={slice} />
        </Group>
      )}

      {minorFaction && (
        <Group justify="space-between" mt="lg">
          <Stack gap="xs">
            <Text size="sm" lh={1}>
              Minor Faction:{" "}
              {player.minorFaction !== undefined
                ? minorFaction.name
                : "Not Chosen"}
            </Text>
          </Stack>
        </Group>
      )}

      {showPlayerColor && (
        <Text size="sm" lh={1}>
          Color: {player.factionColor}
        </Text>
      )}

      <Group justify="space-between" mt="lg">
        <Stack gap="xs">
          <Text size="sm" lh={1}>
            Speaker Order:{" "}
            {player.speakerOrder !== undefined
              ? player.speakerOrder + 1
              : "Not Chosen"}
          </Text>
          {showSeat && (
            <Text size="sm" lh={1}>
              Seat #:{" "}
              {player.seatIdx !== undefined ? player.seatIdx + 1 : "Not Chosen"}
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );
}

function SummaryRow({
  player,
  slice,
  showSeat,
  showSlice = true,
  showMinorFaction,
  showPlayerColor,
}: Props) {
  const sliceValue = useSliceValue(slice);
  let faction: Faction | undefined;
  let minorFaction: Faction | undefined;
  let systems: System[] | undefined;
  let optimal:
    | { resources: number; influence: number; flex: number }
    | undefined;

  if (player.faction) faction = factions[player.faction];
  if (player.minorFaction) minorFaction = factions[player.minorFaction];
  if (slice) {
    systems = systemsInSlice(slice);
    optimal = optimalStatsForSystems(systems);
  }

  return (
    <Table.Tr>
      <Table.Td>
        <PlayerChip player={player} />
      </Table.Td>
      <Table.Td>
        {faction ? (
          <Group>
            <FactionIcon faction={player.faction!} style={{ height: 18 }} />
            <Text size="sm" lh={1}>
              {faction.name}
            </Text>
          </Group>
        ) : undefined}
      </Table.Td>
      {showMinorFaction && (
        <Table.Td>
          {minorFaction ? (
            <Group>
              <FactionIcon
                faction={player.minorFaction!}
                style={{ height: 18 }}
              />
              <Text size="sm" lh={1}>
                {minorFaction.name}
              </Text>
            </Group>
          ) : undefined}
        </Table.Td>
      )}
      <Table.Td>
        {player.speakerOrder !== undefined && player.speakerOrder + 1}
      </Table.Td>
      {showSeat && (
        <Table.Td>
          {player.seatIdx !== undefined && player.seatIdx + 1}
        </Table.Td>
      )}
      {showSlice && (
        <Table.Td>
          <Group>
            {sliceValue !== undefined && (
              <Text fw={700} c="yellow.5">
                {sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}
              </Text>
            )}
            {optimal && (
              <Group gap={4}>
                <PlanetStatsPill
                  size="sm"
                  resources={optimal.resources}
                  influence={optimal.influence}
                  flex={optimal.flex}
                />
                <Text size="xs" c="dimmed">
                  ({optimal.resources + optimal.influence + optimal.flex})
                </Text>
              </Group>
            )}
            {slice !== undefined && <SliceFeatures slice={slice} />}
          </Group>
        </Table.Td>
      )}
      {showPlayerColor && <Table.Td>{player.factionColor}</Table.Td>}
    </Table.Tr>
  );
}
