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
    <Box h="calc(100vh - 60px)" pos="relative">
      <Box
        pos="sticky"
        top={0}
        bg="dark.8"
        px="md"
        pt="sm"
        pb="xs"
        style={{ zIndex: 9 }}
      >
        <Text size="xs" fw={600} tt="uppercase" c="gray.4" mb="xs">
          Available Tiles ({availableSystems.length})
        </Text>
        <SegmentedControl
          value={filter}
          onChange={(value) => setFilter(value as TileFilter)}
          size="xs"
          radius="sm"
          data={[
            {
              value: "all",
              label: (
                <Box
                  h={20}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text size="10px" fw={500}>
                    All
                  </Text>
                </Box>
              ),
            },
            {
              value: "blue",
              label: (
                <Box
                  h={20}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MiniHex color="#4dabf7" />
                </Box>
              ),
            },
            {
              value: "red",
              label: (
                <Box
                  h={20}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MiniHex color="#ff6b6b" />
                </Box>
              ),
            },
            {
              value: "wormhole",
              label: (
                <Box
                  h={20}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MiniWormhole />
                </Box>
              ),
            },
          ]}
          styles={{
            root: {
              backgroundColor: "var(--mantine-color-dark-6)",
            },
            indicator: {
              backgroundColor: "var(--mantine-color-dark-4)",
            },
            label: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
            },
          }}
        />
      </Box>

      <ScrollArea h="calc(100vh - 60px - 80px)" type="scroll">
        <Stack gap="sm" p="md" pb={usedSystems.length > 0 ? 0 : "md"}>
          {availableSystems.map((system) => (
            <DraggableSidebarTile key={system.id} systemId={system.id} />
          ))}
        </Stack>

        {usedSystems.length > 0 && (
          <>
            <Box
              pos="sticky"
              top={0}
              bg="dark.8"
              p="sm"
              px="md"
              mt="md"
              style={{
                borderTop: "1px solid var(--mantine-color-dark-5)",
                borderBottom: "1px solid var(--mantine-color-dark-5)",
                zIndex: 10,
              }}
            >
              <Text size="xs" fw={600} tt="uppercase" c="gray.5">
                Used Tiles ({usedSystems.length})
              </Text>
            </Box>
            <Stack gap="sm" p="md">
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
