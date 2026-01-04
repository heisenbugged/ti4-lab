import { Box, ScrollArea, SegmentedControl, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useMapBuilder } from "~/mapBuilderStore";
import { systemsFromIds } from "~/utils/system";
import { DraggableSidebarTile } from "./DraggableSidebarTile";
import { MiniHex } from "./MiniHex";
import { MiniWormhole } from "./MiniWormhole";

type TileFilter = "all" | "blue" | "red" | "wormhole";

export function TileSidebar() {
  const systemPool = useMapBuilder((state) => state.state.systemPool);
  const systems = systemsFromIds(systemPool);
  const map = useMapBuilder((state) => state.state.map);
  const [filter, setFilter] = useState<TileFilter>("all");

  const usedSystemIds = new Set(
    map
      .filter((tile) => tile.type === "SYSTEM")
      .map((tile) => (tile.type === "SYSTEM" ? tile.systemId : null))
      .filter(Boolean),
  );

  const filterSystems = (systemList: typeof systems) => {
    if (filter === "all") return systemList;
    if (filter === "wormhole") {
      return systemList.filter((system) => system.wormholes.length > 0);
    }
    return systemList.filter((system) => system.type === filter.toUpperCase());
  };

  const availableSystems = filterSystems(
    systems.filter((system) => !usedSystemIds.has(system.id)),
  );
  const usedSystems = filterSystems(
    systems.filter((system) => usedSystemIds.has(system.id)),
  );

  return (
    <Box h="calc(100vh - 60px)" bg="dark.7">
      <Box px="sm" pt="xs" pb="xs">
        <Text
          size="xs"
          fw={600}
          tt="uppercase"
          c="dimmed"
          mb={6}
          style={{ letterSpacing: "0.05em", fontFamily: "Orbitron" }}
        >
          Tiles ({availableSystems.length})
        </Text>
        <SegmentedControl
          value={filter}
          onChange={(value) => setFilter(value as TileFilter)}
          size="xs"
          fullWidth
          data={[
            { value: "all", label: "All" },
            {
              value: "blue",
              label: <MiniHex color="#4dabf7" />,
            },
            {
              value: "red",
              label: <MiniHex color="#ff6b6b" />,
            },
            {
              value: "wormhole",
              label: <MiniWormhole />,
            },
          ]}
        />
      </Box>

      <ScrollArea h="calc(100vh - 60px - 70px)" type="scroll">
        <Stack gap="xs" px="sm" pb="sm">
          {availableSystems.map((system) => (
            <DraggableSidebarTile key={system.id} systemId={system.id} />
          ))}
        </Stack>

        {usedSystems.length > 0 && (
          <>
            <Box
              px="sm"
              py={6}
              bg="dark.6"
              style={{ borderTop: "1px solid var(--mantine-color-dark-5)" }}
            >
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: "0.05em", fontFamily: "Orbitron" }}
              >
                Used ({usedSystems.length})
              </Text>
            </Box>
            <Stack gap="xs" px="sm" py="sm">
              {usedSystems.map((system) => (
                <DraggableSidebarTile key={system.id} systemId={system.id} />
              ))}
            </Stack>
          </>
        )}
      </ScrollArea>
    </Box>
  );
}
