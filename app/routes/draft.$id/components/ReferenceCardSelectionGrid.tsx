import { Stack, Text, Box, Button } from "@mantine/core";
import { useState } from "react";
import { SelectionOverlay } from "~/components/SelectionOverlay";
import { FactionId } from "~/types";
import { ReferenceCardGrid } from "~/components/ReferenceCardGrid";
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

  const canShowSelectedOverlay = !spectatorMode || pickForAnyone;

  return (
    <Stack gap="lg" style={{ flex: 1 }} maw={1200}>
      <Text size="xl" fw="bold" ta="center">
        {title}
      </Text>

      <ReferenceCardGrid
        pack={pack}
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="xl"
        renderCard={(factionId, faction) => {
          const isSelected =
            selectedCard === factionId && canShowSelectedOverlay;
          const isHovered = hoveredCard === factionId;
          const isDisabled = disabledCards.includes(factionId);
          const isClickable = canSelect && !isSelected && !isDisabled;

          return (
            <Box
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

              <SelectionOverlay
                visible={isSelected && canShowSelectedOverlay}
                size="lg"
              />
            </Box>
          );
        }}
      />
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
