import { useState } from "react";
import { Box, Button, Checkbox, Collapse, Group, Stack, Switch } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { SectionTitle } from "~/components/Section";
import { NumberStepper } from "~/components/NumberStepper";
import { useDraftSetup } from "../store";

export function AdvancedSettingsSection() {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const format = useDraftSetup((state) => state.format);
  const faction = useDraftSetup((state) => state.faction);
  const content = useDraftSetup((state) => state.content);
  const factionConstraints = faction.getFactionConstraints();

  return (
    <>
      <Box mt="md">
        <Button
          variant="outline"
          color="blue"
          w="auto"
          rightSection={
            showAdvancedSettings ? <IconChevronDown /> : <IconChevronUp />
          }
          onMouseDown={() => setShowAdvancedSettings((v) => !v)}
        >
          Show advanced settings
        </Button>
      </Box>
      <Collapse in={showAdvancedSettings}>
        <Stack>
          <SectionTitle title="Advanced Options" />

          <Switch
            checked={format.draftSpeaker}
            onChange={() => format.setDraftSpeaker(!format.draftSpeaker)}
            label="Draft speaker order separately"
            description="If true, the draft will be a 4-part snake draft, where seat selection and speaker order are separate draft stages. Otherwise, speaker order is locked to the north position and proceeds clockwise."
          />

          <Switch
            label="Faction ban phase"
            description="When draft starts, players will ban one faction each. The tool then rolls the remaining factions."
            checked={format.banFactions}
            onChange={() => format.setBanFactions(!format.banFactions)}
            disabled={faction.minorFactionsMode?.mode === "sharedPool"}
          />

          <Group>
            <Switch
              label="Faction bags"
              description="If turned on, will pre-assign a 'bag' of # factions to each player. A player then chooses a faction only from their assigned 'bag' during the draft."
              checked={Number(faction.preassignedFactions) > 0}
              onChange={faction.togglePreassignedFactions}
              disabled={faction.minorFactionsMode?.mode === "sharedPool"}
            />

            {faction.preassignedFactions !== undefined && (
              <NumberStepper
                value={faction.preassignedFactions}
                decrease={() => faction.decrementPreassignedFactions()}
                increase={() => faction.incrementPreassignedFactions()}
                decreaseDisabled={
                  faction.preassignedFactions <=
                  factionConstraints.minPreassignedFactions
                }
                increaseDisabled={
                  faction.preassignedFactions >=
                  factionConstraints.maxPreassignedFactions
                }
              />
            )}
          </Group>

          <Switch
            label="Draft player colors"
            description="Allows players to choose their in-game color via final round of draft."
            checked={format.draftPlayerColors}
            onChange={() =>
              format.setDraftPlayerColors(!format.draftPlayerColors)
            }
          />

          <Switch
            label="Allow home planets on map"
            description="Will allow you to put home planets on the board with no/minimal restrictions"
            checked={format.allowHomePlanetSearch}
            onChange={() =>
              format.setAllowHomePlanetSearch(!format.allowHomePlanetSearch)
            }
          />
          <Checkbox
            label="Drahn"
            checked={content.flags.withDrahn}
            onChange={() => content.setWithDrahn(!content.flags.withDrahn)}
          />
        </Stack>
      </Collapse>
    </>
  );
}
