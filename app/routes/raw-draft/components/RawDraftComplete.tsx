import { Box, Stack, Title } from "@mantine/core";
import { Map } from "~/components/Map";
import { useRawDraft } from "~/rawDraftStore";
import { RawDraftProvider } from "~/contexts/RawDraftContext";

export function RawDraftComplete() {
  const map = useRawDraft((state) => state.getMap());
  const players = useRawDraft((state) => state.state.players);

  return (
    <RawDraftProvider players={players}>
      <Stack mt="lg" gap={30} align="center">
        <Title>Draft complete!</Title>

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
    </RawDraftProvider>
  );
}
