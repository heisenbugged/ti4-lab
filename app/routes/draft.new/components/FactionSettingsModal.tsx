import { Button, Checkbox, Group, Modal, SimpleGrid } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Fragment, useMemo, useState } from "react";
import { SectionTitle } from "~/components/Section";
import { factions } from "~/data/factionData";
import { useDraft } from "~/draftStore";
import { FactionId, GameSet } from "~/types";

const gameSetLabel: Record<GameSet, string> = {
  base: "Base",
  pok: "Prophecy of Kings",
  discordant: "Discordant Stars",
  discordantexp: "Discordant Expansion",
  drahn: "Drahn",
  unchartedstars: "Uncharted Stars",
};

export function FactionSettingsModal() {
  const opened = useDraft((state) => state.factionSettingsModal);
  const { closeFactionSettings, changeFactionSettings } = useDraft(
    (state) => state.actions,
  );

  const factionPool = useDraft((state) => state.factionPool);
  const sortedFactionPool = useMemo(() => {
    const grouped = factionPool.reduce(
      (acc, factionId) => {
        const gameSet = factions[factionId].set;
        if (!acc[gameSet]) {
          acc[gameSet] = [];
        }
        acc[gameSet].push(factionId);
        return acc;
      },
      {} as Record<string, FactionId[]>,
    );

    return Object.entries(grouped).map(([gameSet, factionIds]) => ({
      gameSet: gameSet as GameSet,
      factionIds: factionIds.sort((a, b) =>
        factions[a].name.localeCompare(factions[b].name),
      ),
    }));
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
      {sortedFactionPool.map(({ gameSet, factionIds }) => (
        <Fragment key={gameSet}>
          <SectionTitle title={gameSetLabel[gameSet]} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 2, lg: 3, xl: 3 }} mt={24}>
            {factionIds.map((factionId) => {
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
        </Fragment>
      ))}

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
