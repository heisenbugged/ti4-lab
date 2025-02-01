import { Box, Stack, Text } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { draftSelectionToMessage } from "~/utils/selections";

export function DraftLogSection() {
  const draftStore = useDraft();
  const draft = draftStore.draft;
  const selections = draft.selections;
  const players = draft.players;
  return (
    <Box>
      <SectionTitle title="Draft Log" />
      <Box
        p="md"
        mt="sm"
        bg="dark.8"
        style={{
          borderRadius: "8px",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        <Stack gap={0}>
          {selections.map((selection) => (
            <Text size="sm">
              {draftSelectionToMessage(
                players.find((p) => p.id === selection.playerId)?.name ?? "",
                selection,
                draft,
              )}
            </Text>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
