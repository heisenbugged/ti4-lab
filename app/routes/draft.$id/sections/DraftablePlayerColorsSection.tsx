import { Group, SimpleGrid, Text } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { PlayerChipOrSelect } from "../components/PlayerChipOrSelect";
import { Surface, PlayerColor } from "~/ui";

const colors = [
  "Green",
  "Blue",
  "Yellow",
  "Red",
  "Purple",
  "Black",
  "Orange",
  "Magenta",
] as const;

export function DraftablePlayerColorsSection() {
  const draftPlayerColors = useDraft(
    (state) => state.draft.settings.draftPlayerColors,
  );
  const { selectPlayerColor } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking && activePlayer?.factionColor === undefined;

  if (!draftPlayerColors) return null;
  return (
    <Section>
      <SectionTitle title="Player In-Game Color" />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 3, xl: 4 }}>
        {colors.map((color) => {
          const player = hydratedPlayers.find((p) => p.factionColor === color);
          const playerColor =
            player?.id !== undefined
              ? (playerColors[player.id] as PlayerColor)
              : undefined;
          const disabled =
            !!player?.factionColor && player.factionColor !== color;

          const handleSelect = canSelect
            ? () => {
                if (confirm(`Selecting color ${color}`)) {
                  selectPlayerColor(activePlayer.id, color);
                  syncDraft();
                }
              }
            : undefined;

          const variant = handleSelect ? "interactive" : "card";
          const surfaceColor = player && playerColor ? playerColor : undefined;

          return (
            <Surface
              key={color}
              variant={variant}
              color={surfaceColor}
              onClick={handleSelect}
              style={{
                cursor: handleSelect ? "pointer" : "default",
                opacity: disabled ? 0.5 : player ? 0.5 : 1,
                position: "relative",
                borderRadius: "var(--mantine-radius-md)",
              }}
            >
              <Group
                align="center"
                flex={1}
                style={{
                  overflow: "hidden",
                  flexWrap: "nowrap",
                }}
                pt={5}
                pb={15}
                px="sm"
              >
                <Text flex={1} size="14px" ff="heading" fw="bold">
                  {color}
                </Text>
              </Group>

              <PlayerChipOrSelect
                player={player}
                onSelect={
                  handleSelect
                    ? (e) => {
                        e.preventDefault();
                        handleSelect();
                      }
                    : undefined
                }
                disabled={disabled}
              />
            </Surface>
          );
        })}
      </SimpleGrid>
    </Section>
  );
}
