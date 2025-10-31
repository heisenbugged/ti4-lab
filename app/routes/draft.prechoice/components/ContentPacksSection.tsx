import { Checkbox, Group, Stack } from "@mantine/core";
import { useDraftSetup } from "../store";

export function ContentPacksSection() {
  const content = useDraftSetup((state) => state.content);
  const {
    excludeBaseFactions,
    excludePokFactions,
    withDiscordant,
    withUnchartedStars,
    withTE,
  } = content.flags;

  return (
    <>
      <Stack>
        <Checkbox
          label="Discordant Stars"
          checked={withDiscordant}
          onChange={content.toggleDiscordantStars}
        />
        {withDiscordant && (
          <Group mx="lg">
            <Checkbox
              label="Base factions"
              checked={!excludeBaseFactions}
              onChange={() =>
                content.setExcludeBaseFactions(!excludeBaseFactions)
              }
            />
            <Checkbox
              label="POK factions"
              checked={!excludePokFactions}
              onChange={() =>
                content.setExcludePokFactions(!excludePokFactions)
              }
            />
            <Checkbox
              label="Uncharted Stars"
              checked={withUnchartedStars}
              onChange={() =>
                content.setWithUnchartedStars(!withUnchartedStars)
              }
            />
          </Group>
        )}
      </Stack>

      <Stack>
        <Checkbox
          label="Thunder's Edge"
          checked={withTE}
          onChange={() => content.setWithTE(!withTE)}
        />
      </Stack>
    </>
  );
}
