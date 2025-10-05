import {
  Box,
  Button,
  Checkbox,
  Group,
  Input,
  Modal,
  SimpleGrid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { SectionTitle } from "~/components/Section";
import { factions } from "~/data/factionData";
import { FactionId, FactionStratification, GameSet } from "~/types";
import { NumberStepper } from "./NumberStepper";

const gameSetLabel: Record<GameSet, string> = {
  base: "Base",
  pok: "Prophecy of Kings",
  te: "Thunder's Edge",
  discordant: "Discordant Stars",
  discordantexp: "Discordant Expansion",
  drahn: "Drahn",
  unchartedstars: "Uncharted Stars",
};

type Props = {
  opened: boolean;
  buttonText: string;

  savedAllowedFactions: FactionId[] | undefined;
  savedRequiredFactions: FactionId[] | undefined;
  savedStratifiedConfig: FactionStratification | undefined;

  numPlayers: number;
  factionPool: FactionId[];
  factionGameSets: GameSet[];

  onSave: (
    allowedFactions: FactionId[],
    requiredFactions: FactionId[],
    stratifiedConfig: FactionStratification | undefined,
  ) => void;
  onClose: () => void;
};

const BASE_KEY = "base|pok|te";
const DISCORDANT_KEY = "discordant|discordantexp";

export function FactionSettingsModal({
  opened,
  buttonText,
  savedAllowedFactions,
  savedRequiredFactions,
  savedStratifiedConfig,
  numPlayers,
  factionPool,
  factionGameSets,
  onSave,
  onClose,
}: Props) {
  const [stratifiedConfig, setStratifiedConfig] = useState<
    FactionStratification | undefined
  >(savedStratifiedConfig);

  const [requiredFactions, setRequiredFactions] = useState<FactionId[]>(
    savedRequiredFactions ?? [],
  );
  const [allowedFactions, setAllowedFactions] = useState<FactionId[]>(
    savedAllowedFactions ?? factionPool,
  );

  useEffect(() => {
    if (!opened) return;
    console.log("saved allowed factions are", savedAllowedFactions);
    setAllowedFactions(savedAllowedFactions ?? factionPool);
    setRequiredFactions(savedRequiredFactions ?? []);
    setStratifiedConfig(savedStratifiedConfig);
  }, [opened]);

  const handleSave = () => {
    // Remove any keys that have a value of 0
    let config = Object.fromEntries(
      Object.entries(stratifiedConfig ?? {}).filter(([_, value]) => value > 0),
    ) as FactionStratification | undefined;

    if (Object.keys(config!).length === 0) {
      config = undefined;
    }

    if (!validateStratifiedConfig(config, numPlayers)) {
      notifications.show({
        title: "Invalid Configuration",
        message: "Not enough factions selected for all players.",
        color: "red",
      });
      return;
    }

    onSave(allowedFactions, requiredFactions, config);
  };

  const handleStratifiedDecrease = (key: keyof FactionStratification) => {
    if (!stratifiedConfig) return;
    const currentCount = stratifiedConfig[key];
    if (currentCount === undefined) {
      setStratifiedConfig({
        ...stratifiedConfig,
        [key]: 0,
      });
      return;
    }

    setStratifiedConfig({
      ...stratifiedConfig,
      [key]: Math.max(currentCount - 1, 0),
    });
  };

  const handleStratifiedIncrease = (
    key: keyof FactionStratification,
    maxValue: number,
  ) => {
    const currentCount = stratifiedConfig?.[key] ?? 0;
    setStratifiedConfig({
      ...(stratifiedConfig ?? {}),
      [key]: Math.min(currentCount + 1, maxValue),
    });
  };

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

  const showStratification =
    (factionGameSets.includes("base") || factionGameSets.includes("pok") || factionGameSets.includes("te")) &&
    factionGameSets.includes("discordant");

  return (
    <Modal
      opened={!!opened}
      onClose={onClose}
      size="90%"
      title="Faction Settings"
      removeScrollProps={{ removeScrollBar: false }}
      style={{
        paddingBottom: 0,
      }}
    >
      {showStratification && (
        <Group gap="md" ml="md" mb="md">
          <Input.Wrapper
            label="# of Base/POK/TE Factions"
            description="Number of factions that are from Base + POK + TE (if enable exp) (0 to disable)"
          >
            <Box mt="xs">
              <NumberStepper
                value={stratifiedConfig?.[BASE_KEY] ?? 0}
                decrease={() => handleStratifiedDecrease(BASE_KEY)}
                increase={() => handleStratifiedIncrease(BASE_KEY, 25)}
                decreaseDisabled={stratifiedConfig?.[BASE_KEY] === undefined}
                increaseDisabled={stratifiedConfig?.[BASE_KEY] === 25}
              />
            </Box>
          </Input.Wrapper>

          <Input.Wrapper
            label="# of Discordant Stars Factions"
            description="Number of factions that are from Discordant Stars (0 to disable)"
          >
            <Box mt="xs">
              <NumberStepper
                value={stratifiedConfig?.[DISCORDANT_KEY] ?? 0}
                decrease={() => handleStratifiedDecrease(DISCORDANT_KEY)}
                increase={() => handleStratifiedIncrease(DISCORDANT_KEY, 35)}
                decreaseDisabled={
                  stratifiedConfig?.[DISCORDANT_KEY] === undefined
                }
                increaseDisabled={stratifiedConfig?.[DISCORDANT_KEY] === 35}
              />
            </Box>
          </Input.Wrapper>
        </Group>
      )}

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
        <Button leftSection={<IconCheck size={16} />} onMouseDown={handleSave}>
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}

const validateStratifiedConfig = (
  config: FactionStratification | undefined,
  numPlayers: number,
) => {
  // no config is a valid state
  if (!config) return true;
  const numFactions = Object.values(config).reduce(
    (acc, curr) => acc + curr,
    0,
  );
  return numFactions >= numPlayers;
};
