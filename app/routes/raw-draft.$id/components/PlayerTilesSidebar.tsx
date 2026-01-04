import { Box, ScrollArea, Stack, Text } from "@mantine/core";
import { useRawDraft } from "~/rawDraftStore";
import { systemsFromIds } from "~/utils/system";
import { DraggableSidebarTile } from "~/mapgen/components/DraggableSidebarTile";
import { useRawDraftPlayerId } from "~/hooks/useRawDraftPlayerId";

export function PlayerTilesSidebar() {
  const draftId = useRawDraft((state) => state.draftId);
  const [selectedPlayerId] = useRawDraftPlayerId(draftId);
  const getPlayerTiles = useRawDraft((state) => state.getPlayerTiles);
  const activePlayer = useRawDraft((state) => state.getActivePlayer());

  if (!activePlayer) {
    return null;
  }

  const playerTiles = getPlayerTiles(activePlayer.id);
  const systems = systemsFromIds(playerTiles).sort((a, b) => {
    // Primary sort: BLUE systems first, then RED systems
    if (a.type !== b.type) {
      return a.type === "BLUE" ? -1 : 1;
    }
    // Secondary sort: by system ID ascending
    return parseInt(a.id) - parseInt(b.id);
  });

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
        <Text size="sm" fw={700} mb="xs">
          {selectedPlayerId !== undefined ? `${selectedPlayerId} (you)` : "-"}
        </Text>
        <Text size="xs" fw={600} tt="uppercase" c="gray.4" mb="xs">
          Available Tiles ({systems.length}/5)
        </Text>
      </Box>

      <ScrollArea h="calc(100vh - 60px - 80px)" type="scroll">
        <Stack gap="sm" p="md">
          {systems.length === 0 ? (
            <Text size="sm" c="gray.5" ta="center" mt="md">
              All tiles placed!
            </Text>
          ) : (
            systems.map((system) => (
              <DraggableSidebarTile key={system.id} systemId={system.id} />
            ))
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
