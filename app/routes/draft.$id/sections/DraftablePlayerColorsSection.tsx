import { Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { factions as allFactions, playerColors } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { DraftableFaction } from "../components/DraftableFaction";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import classes from "~/components/Surface.module.css";
import { PlayerChipOrSelect } from "../components/PlayerChipOrSelect";

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
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);
  const remainingPicks = pickOrder.length - selections.length;
  const inFinalRound = remainingPicks <= hydratedPlayers.length;

  const { syncDraft } = useSyncDraft();
  const canSelect =
    inFinalRound &&
    currentlyPicking &&
    activePlayer?.factionColor === undefined;

  if (!draftPlayerColors) return null;
  return (
    <Section>
      <SectionTitle title="Player In-Game Color" />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 3, xl: 4 }}>
        {colors.map((color) => {
          const player = hydratedPlayers.find((p) => p.factionColor === color);
          const playerColor =
            player?.id !== undefined ? playerColors[player.id] : undefined;
          const disabled =
            !!player?.factionColor && player.factionColor !== color;

          return (
            <Stack
              gap={4}
              px="sm"
              py={8}
              pb={4}
              className={`${classes.surface} ${classes.withBorder} ${playerColor ? classes[playerColor] : ""}`}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                cursor: "pointer",
                position: "relative",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <Group
                align="center"
                flex={1}
                style={{
                  overflow: "hidden",
                  flexWrap: "nowrap",
                }}
                py={5}
              >
                <Text flex={1} size="14px" ff="heading" fw="bold">
                  {color}
                </Text>
              </Group>

              <PlayerChipOrSelect
                player={player}
                onSelect={
                  canSelect
                    ? () => {
                        if (confirm(`Selecting color ${color}`)) {
                          selectPlayerColor(activePlayer.id, color);
                          syncDraft();
                        }
                      }
                    : undefined
                }
                disabled={disabled}
              />
            </Stack>
          );
        })}
      </SimpleGrid>
    </Section>
  );
}
