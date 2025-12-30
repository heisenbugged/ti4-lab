import { Badge, Box, Button, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconAlienFilled,
  IconHexagons,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { ConfigSection } from "~/components/ConfigSection";
import { CompactSwitch } from "~/components/CompactSwitch";
import { FactionSettingsModal } from "~/components/FactionSettingsModal";
import { getFactionPool } from "~/utils/factions";
import { FactionId, FactionStratification } from "~/types";
import { useDraftSetup } from "../store";
import { isMiltyVariant, isMiltyEqVariant } from "../maps";
import { HoverRadioCard } from "~/components/HoverRadioCard";
import { IconDice, IconUser, IconUsersGroup } from "@tabler/icons-react";
import { NumberStepper } from "~/components/NumberStepper";
import { ContentPacksSection } from "./ContentPacksSection";

export function DraftConfigurationPanel() {
  const faction = useDraftSetup((state) => state.faction);
  const slices = useDraftSetup((state) => state.slices);
  const format = useDraftSetup((state) => state.format);
  const content = useDraftSetup((state) => state.content);
  const multidraft = useDraftSetup((state) => state.multidraft);
  const playerCount = useDraftSetup((state) => state.player.players.length);
  const mapType = useDraftSetup((state) => state.map.selectedMapType);

  const factionGameSets = useDraftSetup((state) =>
    state.content.getFactionGameSets(),
  );
  const factionConstraints = faction.getFactionConstraints();

  const [
    factionSettingsOpened,
    { open: openFactionSettings, close: closeFactionSettings },
  ] = useDisclosure(false);

  const handleSaveFactionSettings = (
    allowedFactionsParam: FactionId[],
    requiredFactionsParam: FactionId[],
    stratifiedConfigParam: FactionStratification | undefined,
  ) => {
    faction.setStratification(
      allowedFactionsParam,
      requiredFactionsParam,
      stratifiedConfigParam,
    );
    closeFactionSettings();
  };

  const { withDrahn } = content.flags;

  const showMinorFactions = isMiltyVariant(mapType) || isMiltyEqVariant(mapType);

  return (
    <>
      <FactionSettingsModal
        buttonText="Save"
        opened={factionSettingsOpened}
        numPlayers={playerCount}
        factionPool={getFactionPool(factionGameSets)}
        factionGameSets={factionGameSets}
        savedAllowedFactions={faction.allowedFactions}
        savedRequiredFactions={faction.requiredFactions}
        savedStratifiedConfig={faction.stratifiedConfig}
        onClose={closeFactionSettings}
        onSave={handleSaveFactionSettings}
      />

      <Stack gap="sm">
        {/* Core Draft Settings - Factions & Slices side by side */}
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
          <ConfigSection title="Factions" icon={<IconAlienFilled size={12} />}>
            <Box py={6} style={{ borderBottom: "1px dashed var(--mantine-color-default-border)" }}>
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>In Pool</Text>
                </Box>
                <Group gap={2}>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="gray"
                    disabled={
                      !!faction.preassignedFactions ||
                      faction.numFactions <= factionConstraints.minNumFactions
                    }
                    onMouseDown={faction.decrementNumFactions}
                  >
                    -
                  </Button>
                  <Text size="sm" fw={600} miw={24} ta="center" c="purple.3">
                    {faction.numFactions}
                  </Text>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="gray"
                    disabled={
                      !!faction.preassignedFactions ||
                      faction.numFactions >= factionConstraints.maxNumFactions
                    }
                    onMouseDown={faction.incrementNumFactions}
                  >
                    +
                  </Button>
                </Group>
              </Group>
            </Box>
            <Box pt="xs">
              <Button
                variant="light"
                color="orange"
                size="xs"
                fullWidth
                onMouseDown={openFactionSettings}
              >
                Configure Pool
              </Button>
            </Box>
          </ConfigSection>

          <ConfigSection title="Slices" icon={<IconHexagons size={12} />}>
            <Box py={6}>
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>In Pool</Text>
                </Box>
                <Group gap={2}>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="gray"
                    disabled={slices.numSlices <= playerCount}
                    onMouseDown={() => slices.setNumSlices(slices.numSlices - 1)}
                  >
                    -
                  </Button>
                  <Text size="sm" fw={600} miw={24} ta="center" c="purple.3">
                    {slices.numSlices}
                  </Text>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="gray"
                    disabled={slices.numSlices >= 9}
                    onMouseDown={() => slices.setNumSlices(slices.numSlices + 1)}
                  >
                    +
                  </Button>
                </Group>
              </Group>
            </Box>
          </ConfigSection>
        </SimpleGrid>

        {/* Content Packs */}
        <ContentPacksSection />

        {/* Minor Factions - Only for Milty variants */}
        {showMinorFactions && (
          <ConfigSection
            title="Minor Factions"
            icon={<IconUsers size={12} />}
            color="teal"
          >
            <CompactSwitch
              label="Enable Minor Factions"
              checked={!!faction.minorFactionsMode}
              onChange={() => faction.toggleMinorFactions()}
            >
              {isMiltyEqVariant(mapType) && (
                <Box mt="xs">
                  <Text size="xs" c="dimmed" mb="xs">
                    Mode:
                  </Text>
                  <SimpleGrid cols={3} spacing="xs">
                    <HoverRadioCard
                      title="Random"
                      icon={<IconDice size={18} />}
                      description="Random placement"
                      checked={faction.minorFactionsMode?.mode === "random"}
                      onMouseDown={() => faction.setMinorFactionsMode("random")}
                      compact
                    />
                    <HoverRadioCard
                      title="Shared"
                      icon={<IconUsersGroup size={18} />}
                      description="Same pool as majors"
                      checked={faction.minorFactionsMode?.mode === "sharedPool"}
                      onMouseDown={() => faction.setMinorFactionsMode("shared")}
                      compact
                    />
                    <HoverRadioCard
                      title="Separate"
                      icon={<IconUser size={18} />}
                      description="Own faction pool"
                      checked={faction.minorFactionsMode?.mode === "separatePool"}
                      onMouseDown={() => faction.setMinorFactionsMode("separate")}
                      compact
                    >
                      {faction.minorFactionsMode?.mode === "separatePool" && (
                        <Box mt="xs">
                          <NumberStepper
                            value={faction.minorFactionsMode.numMinorFactions}
                            decrease={(e) => {
                              e.stopPropagation();
                              faction.decrementMinorFactions();
                            }}
                            increase={(e) => {
                              e.stopPropagation();
                              faction.incrementMinorFactions();
                            }}
                            decreaseDisabled={
                              faction.minorFactionsMode.numMinorFactions <=
                              factionConstraints.minMinorFactions
                            }
                            increaseDisabled={
                              faction.minorFactionsMode.numMinorFactions >=
                              factionConstraints.maxMinorFactions
                            }
                          />
                        </Box>
                      )}
                    </HoverRadioCard>
                  </SimpleGrid>
                </Box>
              )}
            </CompactSwitch>
          </ConfigSection>
        )}

        {/* Advanced Settings - Collapsible */}
        <ConfigSection
          title="Advanced Options"
          icon={<IconSettings size={12} />}
          color="gray"
          collapsible
          defaultCollapsed
          badge={
            <Badge size="xs" variant="light" color="gray">
              Optional
            </Badge>
          }
        >
          <CompactSwitch
            label="Multidraft"
            description="Create multiple drafts with same settings"
            checked={multidraft.isMultidraft}
            onChange={multidraft.setIsMultidraft}
            numericValue={multidraft.isMultidraft ? multidraft.numDrafts : undefined}
            onIncrease={() => multidraft.setNumDrafts(multidraft.numDrafts + 1)}
            onDecrease={() => multidraft.setNumDrafts(Math.max(2, multidraft.numDrafts - 1))}
            increaseDisabled={multidraft.numDrafts >= 9}
            decreaseDisabled={multidraft.numDrafts <= 2}
          />
          <CompactSwitch
            label="Draft Speaker Order"
            description="Separate speaker order from seat selection"
            checked={format.draftSpeaker}
            onChange={() => format.setDraftSpeaker(!format.draftSpeaker)}
          />
          <CompactSwitch
            label="Faction Ban Phase"
            description="Players ban one faction each before rolling"
            checked={format.banFactions}
            onChange={() => format.setBanFactions(!format.banFactions)}
            disabled={faction.minorFactionsMode?.mode === "sharedPool"}
          />
          <CompactSwitch
            label="Faction Bags"
            description="Pre-assign faction choices to each player"
            checked={Number(faction.preassignedFactions) > 0}
            onChange={() => faction.togglePreassignedFactions()}
            disabled={faction.minorFactionsMode?.mode === "sharedPool"}
            numericValue={faction.preassignedFactions}
            onIncrease={() => faction.incrementPreassignedFactions()}
            onDecrease={() => faction.decrementPreassignedFactions()}
            increaseDisabled={
              faction.preassignedFactions !== undefined &&
              faction.preassignedFactions >= factionConstraints.maxPreassignedFactions
            }
            decreaseDisabled={
              faction.preassignedFactions !== undefined &&
              faction.preassignedFactions <= factionConstraints.minPreassignedFactions
            }
          />
          <CompactSwitch
            label="Draft Player Colors"
            description="Choose in-game color via draft"
            checked={format.draftPlayerColors}
            onChange={() => format.setDraftPlayerColors(!format.draftPlayerColors)}
          />
          <CompactSwitch
            label="Allow Home Planets"
            description="Enable placing home planets on map"
            checked={format.allowHomePlanetSearch}
            onChange={() => format.setAllowHomePlanetSearch(!format.allowHomePlanetSearch)}
          />
          <CompactSwitch
            label="Drahn Variant"
            checked={withDrahn}
            onChange={() => content.setWithDrahn(!withDrahn)}
          />
        </ConfigSection>
      </Stack>
    </>
  );
}
