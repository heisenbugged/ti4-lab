import { Checkbox, Group, Indicator, Select, Stack } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useDraftSetup } from "../store";
import { playerColors, factions } from "~/data/factionData";
import { FactionId, GameSet } from "~/types";
import { getFactionPool } from "~/utils/factions";

export function RawDraftConfigurationSection() {
  const players = useDraftSetup((state) => state.player.players);
  const rawDraft = useDraftSetup((state) => state.rawDraft);

  // Initialize config if needed
  useEffect(() => {
    if (!rawDraft.config) {
      rawDraft.setTileSet("base", true);
      rawDraft.setTileSet("pok", true);
      rawDraft.setTileSet("te", true);
      rawDraft.setShowStatsDisplay(true);
      rawDraft.setAutoAssignColors(true);
    }
  }, [rawDraft]);

  const tileSets = rawDraft.config?.tileSets || {
    base: true,
    pok: true,
    te: true,
    discordant: false,
    discordantexp: false,
    unchartedstars: false,
    drahn: false,
    twilightsFall: false,
  };

  // Calculate selected game sets and faction pool
  const selectedGameSets = useMemo(() => {
    return rawDraft.getSelectedGameSets();
  }, [rawDraft]);

  const factionPool = useMemo(() => {
    return getFactionPool(selectedGameSets);
  }, [selectedGameSets]);

  const factionData = useMemo(() => {
    return factionPool
      .map((factionId) => ({
        value: factionId,
        label: factions[factionId].name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [factionPool]);

  const playerFactions = rawDraft.config?.playerFactions || {};

  const handleFactionChange = (playerId: number, factionId: string | null) => {
    rawDraft.setPlayerFaction(playerId, factionId as FactionId | null);
  };

  const handleTileSetChange = (gameSet: GameSet, checked: boolean) => {
    rawDraft.setTileSet(gameSet, checked);
  };

  const showStatsDisplay = rawDraft.config?.showStatsDisplay ?? true;

  const handleShowStatsDisplayChange = (checked: boolean) => {
    rawDraft.setShowStatsDisplay(checked);
  };

  const autoAssignColors = rawDraft.config?.autoAssignColors ?? true;

  const handleAutoAssignColorsChange = (checked: boolean) => {
    rawDraft.setAutoAssignColors(checked);
  };

  // Clear invalid faction selections when game sets change
  useEffect(() => {
    if (rawDraft.config) {
      Object.entries(rawDraft.config.playerFactions).forEach(
        ([playerId, factionId]) => {
          if (factionId && !factionPool.includes(factionId)) {
            rawDraft.setPlayerFaction(Number(playerId), null);
          }
        },
      );
    }
  }, [factionPool, rawDraft]);

  const placeholderName = ["A", "B", "C", "D", "E", "F"];

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Checkbox
          label="Base"
          checked={tileSets.base}
          onChange={(e) => handleTileSetChange("base", e.currentTarget.checked)}
        />
        <Checkbox
          label="Prophecy of Kings (POK)"
          checked={tileSets.pok}
          onChange={(e) => handleTileSetChange("pok", e.currentTarget.checked)}
        />
        <Checkbox
          label="Thunder's Edge"
          checked={tileSets.te}
          onChange={(e) => handleTileSetChange("te", e.currentTarget.checked)}
        />
        <Checkbox
          label="Show Stats Display"
          checked={showStatsDisplay}
          onChange={(e) =>
            handleShowStatsDisplayChange(e.currentTarget.checked)
          }
        />
        <Checkbox
          label="Auto-assign Colors"
          checked={autoAssignColors}
          onChange={(e) =>
            handleAutoAssignColorsChange(e.currentTarget.checked)
          }
        />
      </Stack>

      <Group align="flex-start">
        <Stack gap="xs" flex={1}>
          {players.map((player, idx) => {
            const playerColor = playerColors[player.id];
            const playerName = player.name || `Player ${placeholderName[idx]}`;

            return (
              <Group key={player.id} gap="lg">
                <Indicator color={playerColor} size={18} zIndex={0} />
                <Select
                  placeholder={`${playerName}'s faction`}
                  value={playerFactions[player.id] || null}
                  onChange={(value) => handleFactionChange(player.id, value)}
                  data={factionData}
                  searchable
                  size="md"
                  flex={1}
                />
              </Group>
            );
          })}
        </Stack>
      </Group>
    </Stack>
  );
}
