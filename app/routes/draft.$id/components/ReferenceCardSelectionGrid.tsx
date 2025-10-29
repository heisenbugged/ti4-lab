import {
  Stack,
  Text,
  SimpleGrid,
  Box,
  Badge,
  Button,
  Center,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { factions as allFactions } from "~/data/factionData";
import { FactionId } from "~/types";
import { NewDraftReferenceCard } from "~/routes/draft.new/components/NewDraftReferenceCard";

interface ReferenceCardSelectionGridProps {
  title: string;
  pack: FactionId[];
  selectedCard: string | undefined;
  canSelect: boolean;
  onSelectCard: (factionId: FactionId) => void;
  disabledCards?: FactionId[];
  pickForAnyone?: boolean;
  spectatorMode?: boolean;
}

export function ReferenceCardSelectionGrid({
  title,
  pack,
  selectedCard,
  canSelect,
  onSelectCard,
  disabledCards = [],
  pickForAnyone = false,
  spectatorMode = false,
}: ReferenceCardSelectionGridProps) {
  const [hoveredCard, setHoveredCard] = useState<FactionId | null>(null);

  const sortedPack = [...pack].sort((a, b) => {
    const factionA = allFactions[a];
    const factionB = allFactions[b];
    const priorityA = factionA.priorityOrder ?? 999;
    const priorityB = factionB.priorityOrder ?? 999;
    return priorityA - priorityB;
  });

  const canShowSelectedOverlay = !spectatorMode || pickForAnyone;

  return (
    <Stack gap="lg" style={{ flex: 1 }} maw={1200}>
      <Text size="xl" fw="bold" ta="center">
        {title}
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
        {sortedPack.map((factionId: FactionId) => {
          const faction = allFactions[factionId];
          const isSelected =
            selectedCard === factionId && canShowSelectedOverlay;
          const isHovered = hoveredCard === factionId;
          const isDisabled = disabledCards.includes(factionId);
          const isClickable = canSelect && !isSelected && !isDisabled;

          return (
            <Box
              key={factionId}
              onMouseEnter={() => isClickable && setHoveredCard(factionId)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative",
                cursor: getCursor(isClickable),
                transform: getTransform(isSelected),
                transition: "all 0.2s ease",
                opacity: getOpacity({ isDisabled, isSelected, canSelect }),
              }}
              onClick={isClickable ? () => onSelectCard(factionId) : undefined}
            >
              <Box
                style={{
                  position: "relative",
                  borderWidth: 4,
                  borderStyle: "solid",
                  borderColor: getBorderColor({
                    isDisabled,
                    isHovered,
                    isClickable,
                    isSelected,
                  }),
                  borderRadius: 8,
                  transition: "border 0.2s ease",
                  boxShadow: getBoxShadow(isHovered, isClickable),
                  height: "100%",
                }}
              >
                <NewDraftReferenceCard faction={faction} />
              </Box>

              {/* Select button */}
              {isClickable && (
                <Box
                  pos="absolute"
                  top={-15}
                  right={-10}
                  style={{ zIndex: 10 }}
                >
                  <Button
                    size="compact-xs"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectCard(factionId);
                    }}
                  >
                    Select
                  </Button>
                </Box>
              )}

              {/* Selected overlay */}
              {isSelected && canShowSelectedOverlay && (
                <>
                  <Center
                    pos="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(64, 192, 87, 0.15)"
                    style={{ borderRadius: 8, pointerEvents: "none" }}
                  >
                    <Box
                      bg="green.6"
                      p="md"
                      style={{
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconCheck size={48} color="white" />
                    </Box>
                  </Center>
                  <Box
                    pos="absolute"
                    top={-15}
                    right={-10}
                    style={{ zIndex: 10 }}
                  >
                    <Badge size="lg" color="green" variant="filled">
                      Selected
                    </Badge>
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

function getCursor(isClickable: boolean): "pointer" | "default" {
  return isClickable ? "pointer" : "default";
}

function getTransform(isSelected: boolean): string {
  return isSelected ? "scale(1.05)" : "scale(1)";
}

function getOpacity(params: {
  isDisabled: boolean;
  isSelected: boolean;
  canSelect: boolean;
}): number {
  const { isDisabled, isSelected, canSelect } = params;
  if (isDisabled) return 0.4;
  if (isSelected) return 1;
  if (canSelect) return 1;
  return 0.6;
}

function getBorderColor(params: {
  isDisabled: boolean;
  isHovered: boolean;
  isClickable: boolean;
  isSelected: boolean;
}): string {
  const { isDisabled, isHovered, isClickable, isSelected } = params;
  if (isDisabled) return "var(--mantine-color-gray-5)";
  if (isHovered && isClickable) return "var(--mantine-color-blue-5)";
  if (isSelected) return "var(--mantine-color-green-6)";
  return "transparent";
}

function getBoxShadow(
  isHovered: boolean,
  isClickable: boolean,
): string | undefined {
  if (isHovered && isClickable) return "0 0 16px rgba(34, 139, 230, 0.5)";
  return undefined;
}
