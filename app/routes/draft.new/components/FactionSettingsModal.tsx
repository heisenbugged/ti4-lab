import {
  Button,
  Checkbox,
  Group,
  Modal,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { factions } from "~/data/factionData";
import { useDraft } from "~/draftStore";
import { FactionId } from "~/types";

export function FactionSettingsModal() {
  const opened = useDraft((state) => state.factionSettingsModal);
  const { closeFactionSettings, changeFactionSettings } = useDraft(
    (state) => state.actions,
  );

  const factionPool = useDraft((state) => state.factionPool);
  const sortedFactionPool = useMemo(() => {
    return [...factionPool].sort((a, b) => {
      const aName = factions[a].name.toLowerCase();
      const bName = factions[b].name.toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  }, [factionPool]);

  const [allowedFactions, setAllowedFactions] =
    useState<FactionId[]>(factionPool);
  const [requiredFactions, setRequiredFactions] = useState<FactionId[]>([]);

  return (
    <Modal
      opened={!!opened}
      onClose={closeFactionSettings}
      size="90%"
      title="Faction Settings"
      removeScrollProps={{ removeScrollBar: false }}
      style={{
        paddingBottom: 0,
      }}
    >
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 2, lg: 3, xl: 3 }}>
          {sortedFactionPool.map((factionId) => {
            const required = requiredFactions.includes(factionId);
            return (
              <Group
                key={factionId}
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.6)",
                  borderRadius: "var(--mantine-radius-md)",
                  backgroundColor: required
                    ? "rgba(0, 255, 0, 0.05)"
                    : undefined,
                }}
                p="sm"
              >
                {required && (
                  <Button
                    variant="filled"
                    color="red"
                    size="compact-xs"
                    onClick={() => {
                      setRequiredFactions((factions) =>
                        factions.filter((f) => f !== factionId),
                      );
                    }}
                  >
                    unforce
                  </Button>
                )}
                {!required && (
                  <Button
                    variant="filled"
                    color="green"
                    size="compact-xs"
                    onClick={() => {
                      setRequiredFactions((factions) => [
                        ...factions,
                        factionId,
                      ]);
                    }}
                  >
                    force
                  </Button>
                )}

                <Checkbox
                  label={factions[factionId].name}
                  color={required ? "green" : undefined}
                  checked={allowedFactions.includes(factionId) || required}
                  onChange={() => {
                    if (required) return;
                    if (allowedFactions.includes(factionId)) {
                      setAllowedFactions((factions) =>
                        factions.filter((f) => f !== factionId),
                      );
                    } else {
                      setAllowedFactions((factions) => [
                        ...factions,
                        factionId,
                      ]);
                    }
                  }}
                />
              </Group>
            );
          })}
        </SimpleGrid>
      </Stack>
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "var(--mantine-color-body)",
          zIndex: 1,
          paddingTop: 15,
          paddingBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          leftSection={<IconCheck size={16} />}
          onMouseDown={() => {
            changeFactionSettings(allowedFactions, requiredFactions);
          }}
        >
          Save and reroll
        </Button>
      </div>
    </Modal>
  );
}
