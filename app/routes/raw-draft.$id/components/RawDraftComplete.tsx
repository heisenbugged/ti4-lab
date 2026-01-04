import { Box, Stack, Title, Group, Button } from "@mantine/core";
import { useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconShare, IconPhoto } from "@tabler/icons-react";
import { Map } from "~/components/Map";
import { useRawDraft } from "~/rawDraftStore";
import { RawDraftProvider } from "~/contexts/RawDraftContext";
import { ShareMapModal } from "~/mapgen/components/ShareMapModal";

export function RawDraftComplete({ baseUrl }: { baseUrl: string }) {
  const map = useRawDraft((state) => state.getMap());
  const players = useRawDraft((state) => state.state.players);
  const draftUrl = useRawDraft((state) => state.draftUrl);
  const playerColorAssignments = useRawDraft(
    (state) => state.state.playerColorAssignments,
  );
  const playerFactions = useRawDraft((state) => state.state.playerFactions);
  const [shareOpened, { open: openShare, close: closeShare }] =
    useDisclosure(false);

  // Generate map string (same format as map generator)
  const mapString = useMemo(() => {
    return map
      .slice(1) // Skip Mecatol Rex at index 0
      .map((tile) => {
        if (tile.type === "HOME") return "0";
        if (tile.type === "SYSTEM") return tile.systemId;
        return "-1";
      })
      .join(" ");
  }, [map]);

  const shareUrl = useMemo(() => {
    if (!draftUrl) return "";
    return `${baseUrl}/raw-draft/${draftUrl}`;
  }, [draftUrl, baseUrl]);

  const imageUrl = useMemo(() => {
    if (!draftUrl) return "";
    return `${baseUrl}/raw-draft/${draftUrl}.png`;
  }, [draftUrl, baseUrl]);

  return (
    <RawDraftProvider
      players={players}
      playerColorAssignments={playerColorAssignments}
      playerFactions={playerFactions}
    >
      <Stack mt="lg" gap={30} align="center">
        <Title>Draft complete!</Title>

        <Group>
          <Button
            leftSection={<IconShare size={16} />}
            variant="filled"
            color="green"
            onClick={openShare}
            size="sm"
          >
            Share
          </Button>
          <Button
            leftSection={<IconPhoto size={16} />}
            variant="filled"
            color="purple"
            onClick={() => window.open(imageUrl, "_blank")}
            size="sm"
            disabled={!draftUrl}
          >
            Share Image
          </Button>
        </Group>

        {/* Map */}
        <Box
          w="100%"
          pos="relative"
          style={{
            aspectRatio: "740 / 800",
            maxHeight: "calc(100vh - 200px)",
            maxWidth: "100%",
          }}
        >
          <Map
            id="raw-draft-complete-map"
            modifiableMapTiles={[]}
            map={map}
            editable={false}
            disabled={false}
            droppable={false}
          />
        </Box>
      </Stack>

      <ShareMapModal
        mapString={mapString}
        shareUrl={shareUrl}
        opened={shareOpened}
        onClose={closeShare}
      />
    </RawDraftProvider>
  );
}
