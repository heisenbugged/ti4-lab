import { Group, Text } from "@mantine/core";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

export function DiscordBanner() {
  return (
    <Group
      bg="discordBlue.5"
      p="md"
      style={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "var(--mantine-color-discordBlue-4)",
      }}
    >
      <IconBrandDiscordFilled style={{ display: "block" }} color="white" />

      <Text flex={1} c="white">
        You are running this draft with discord! Once the draft starts, the
        discord bot will ping people when it&apos;s their turn to draft.
      </Text>
    </Group>
  );
}
