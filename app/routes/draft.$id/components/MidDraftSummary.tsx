import { Card, Group, Stack, Table, Text } from "@mantine/core";
import { useDraft } from "~/draftStore";
import { PlayerChip } from "./PlayerChip";
import { factions } from "~/data/factionData";
import {
  optimalStatsForSystems,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";
import { DraftSlice, Faction, Player, System } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { DraftConfig } from "~/draft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { systemsInSlice } from "~/utils/slice";

import classes from "./MidDraftSummary.module.css";

export function MidDraftSummary() {
  const config = useDraftConfig();
  const slices = useDraft((state) => state.draft.slices);
  const draftSpeaker = useDraft((state) => state.draft.settings.draftSpeaker);
  const { hydratedPlayers } = useHydratedDraft();

  return (
    <>
      <Stack mt="lg" hiddenFrom="sm">
        {hydratedPlayers.map((p) => (
          <SummaryCard
            config={config}
            key={p.id}
            player={p}
            slice={p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined}
            showSeat={draftSpeaker}
          />
        ))}
      </Stack>
      <Table visibleFrom="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Faction</Table.Th>
            <Table.Th>Speaker Order</Table.Th>
            {draftSpeaker && <Table.Th>Seat</Table.Th>}
            <Table.Th>Optimal Value</Table.Th>

            <Table.Th>Features</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {hydratedPlayers.map((p) => (
            <SummaryRow
              config={config}
              key={p.id}
              player={p}
              slice={p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined}
              showSeat={draftSpeaker}
            />
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}

type Props = {
  config: DraftConfig;
  player: Player;
  slice?: DraftSlice;
  showSeat: boolean;
  showSlice?: boolean;
};

export function SummaryCard({
  player,
  slice,
  showSeat,
  showSlice = true,
}: Props) {
  let faction: Faction | undefined;
  let systems: System[] | undefined;
  let optimal:
    | { resources: number; influence: number; flex: number }
    | undefined;
  let specialties: string[] | undefined;

  if (player.faction) faction = factions[player.faction];
  if (slice) {
    systems = systemsInSlice(slice);
    optimal = optimalStatsForSystems(systems);
    specialties = techSpecialtiesForSystems(systems);
  }

  return (
    <Card shadow="xs" padding="md" withBorder>
      <Group justify="space-between">
        <PlayerChip player={player} />
        <Group>
          {optimal && (
            <PlanetStatsPill
              size="sm"
              resources={optimal.resources}
              influence={optimal.influence}
              flex={optimal.flex}
            />
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

        {slice !== undefined && <SliceFeatures slice={slice} />}
      </Group>

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

          {showSlice && (
            <Text size="sm" lh={1}>
              Slice #:{" "}
              {player.sliceIdx !== undefined
                ? player.sliceIdx + 1
                : "Not Chosen"}
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );
}

function SummaryRow({ player, slice, showSeat }: Props) {
  let faction: Faction | undefined;
  let systems: System[] | undefined;
  let optimal:
    | { resources: number; influence: number; flex: number }
    | undefined;
  let specialties: string[] | undefined;

  if (player.faction) faction = factions[player.faction];
  if (slice) {
    systems = systemsInSlice(slice);
    optimal = optimalStatsForSystems(systems);
    specialties = techSpecialtiesForSystems(systems);
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
      <Table.Td>
        {player.speakerOrder !== undefined && player.speakerOrder + 1}
      </Table.Td>
      {showSeat && (
        <Table.Td>
          {player.seatIdx !== undefined && player.seatIdx + 1}
        </Table.Td>
      )}
      <Table.Td>
        {optimal && (
          <PlanetStatsPill
            size="sm"
            resources={optimal.resources}
            influence={optimal.influence}
            flex={optimal.flex}
          />
        )}
      </Table.Td>
      <Table.Td>
        {slice !== undefined && <SliceFeatures slice={slice} />}
      </Table.Td>
    </Table.Tr>
  );
}
