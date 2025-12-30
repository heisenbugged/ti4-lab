import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconLock,
  IconLockOpen,
  IconMinus,
  IconPlus,
  IconAlien,
} from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { factions } from "~/data/factionData";
import { FactionId, FactionStratification, GameSet } from "~/types";

const gameSetLabel: Record<GameSet, string> = {
  base: "Base",
  pok: "Prophecy of Kings",
  te: "Thunder's Edge",
  discordant: "Discordant Stars",
  discordantexp: "Discordant Expansion",
  drahn: "Drahn",
  unchartedstars: "Uncharted Stars",
  twilightsFall: "Twilight's Fall",
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
  const BASE_POK_KEY = useMemo((): keyof FactionStratification => {
    const baseSets: GameSet[] = [];
    if (factionGameSets.includes("base")) baseSets.push("base");
    if (factionGameSets.includes("pok")) baseSets.push("pok");
    return baseSets.join("|") as keyof FactionStratification;
  }, [factionGameSets]);

  const TE_KEY: keyof FactionStratification = "te";

  const DISCORDANT_KEY = useMemo((): keyof FactionStratification => {
    const discordantSets: GameSet[] = [];
    if (factionGameSets.includes("discordant"))
      discordantSets.push("discordant");
    if (factionGameSets.includes("discordantexp"))
      discordantSets.push("discordantexp");
    return discordantSets.join("|") as keyof FactionStratification;
  }, [factionGameSets]);

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

    setAllowedFactions(savedAllowedFactions ?? factionPool);
    setRequiredFactions(savedRequiredFactions ?? []);
    setStratifiedConfig(savedStratifiedConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const hasBasePok =
    factionGameSets.includes("base") || factionGameSets.includes("pok");
  const hasTE = factionGameSets.includes("te");
  const hasDiscordant =
    factionGameSets.includes("discordant") ||
    factionGameSets.includes("discordantexp");

  const showStratification = hasBasePok && (hasTE || hasDiscordant);

  // Compact inline stepper for stratification
  const StratStepper = ({
    label,
    value,
    onDecrease,
    onIncrease,
    decreaseDisabled,
    increaseDisabled,
  }: {
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
    decreaseDisabled: boolean;
    increaseDisabled: boolean;
  }) => (
    <Group gap={4} wrap="nowrap">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Group gap={2}>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          disabled={decreaseDisabled}
          onMouseDown={onDecrease}
        >
          <IconMinus size={12} />
        </ActionIcon>
        <Text size="xs" fw={600} ta="center" miw={18} c={value > 0 ? "purple.3" : "dimmed"}>
          {value}
        </Text>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          disabled={increaseDisabled}
          onMouseDown={onIncrease}
        >
          <IconPlus size={12} />
        </ActionIcon>
      </Group>
    </Group>
  );

  return (
    <Modal
      opened={!!opened}
      onClose={onClose}
      size="90%"
      title={
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color="orange" radius="sm">
            <IconAlien size={12} />
          </ThemeIcon>
          <Text
            size="sm"
            fw={600}
            tt="uppercase"
            style={{ letterSpacing: "0.05em", fontFamily: "Orbitron" }}
          >
            Configure Faction Pool
          </Text>
        </Group>
      }
      removeScrollProps={{ removeScrollBar: false }}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Stack gap={0}>
        {/* Stratification Controls - Subtle inline row */}
        {showStratification && (
          <Group
            gap="md"
            px="md"
            py="xs"
            style={{
              borderBottom: "1px dashed var(--mantine-color-default-border)",
            }}
          >
            <Text size="xs" c="dimmed">
              Stratify by set:
            </Text>
            {hasBasePok && (
              <StratStepper
                label="Base/POK"
                value={stratifiedConfig?.[BASE_POK_KEY] ?? 0}
                onDecrease={() => handleStratifiedDecrease(BASE_POK_KEY)}
                onIncrease={() => handleStratifiedIncrease(BASE_POK_KEY, 25)}
                decreaseDisabled={
                  stratifiedConfig?.[BASE_POK_KEY] === undefined ||
                  stratifiedConfig?.[BASE_POK_KEY] === 0
                }
                increaseDisabled={stratifiedConfig?.[BASE_POK_KEY] === 25}
              />
            )}
            {hasTE && (
              <StratStepper
                label="TE"
                value={stratifiedConfig?.[TE_KEY] ?? 0}
                onDecrease={() => handleStratifiedDecrease(TE_KEY)}
                onIncrease={() => handleStratifiedIncrease(TE_KEY, 10)}
                decreaseDisabled={
                  stratifiedConfig?.[TE_KEY] === undefined ||
                  stratifiedConfig?.[TE_KEY] === 0
                }
                increaseDisabled={stratifiedConfig?.[TE_KEY] === 10}
              />
            )}
            {hasDiscordant && (
              <StratStepper
                label="Discordant"
                value={stratifiedConfig?.[DISCORDANT_KEY] ?? 0}
                onDecrease={() => handleStratifiedDecrease(DISCORDANT_KEY)}
                onIncrease={() => handleStratifiedIncrease(DISCORDANT_KEY, 35)}
                decreaseDisabled={
                  stratifiedConfig?.[DISCORDANT_KEY] === undefined ||
                  stratifiedConfig?.[DISCORDANT_KEY] === 0
                }
                increaseDisabled={stratifiedConfig?.[DISCORDANT_KEY] === 35}
              />
            )}
          </Group>
        )}

        {/* Scrollable Faction List */}
        <ScrollArea.Autosize mah="60vh" px="md" py="sm">
          <Stack gap="md">
            {sortedFactionPool.map(({ gameSet, factionIds }) => (
              <Box key={gameSet}>
                {/* Game Set Header */}
                <Group
                  gap="xs"
                  mb="xs"
                  pb={4}
                  style={{
                    borderBottom:
                      "1px dashed var(--mantine-color-default-border)",
                  }}
                >
                  <Text
                    size="xs"
                    fw={600}
                    tt="uppercase"
                    c="dimmed"
                    style={{
                      letterSpacing: "0.08em",
                      fontFamily: "Orbitron",
                    }}
                  >
                    {gameSetLabel[gameSet]}
                  </Text>
                  <Badge size="xs" variant="light" color="gray">
                    {factionIds.filter((id) => allowedFactions.includes(id) || requiredFactions.includes(id)).length}/{factionIds.length}
                  </Badge>
                </Group>

                {/* Faction Grid - More compact */}
                <SimpleGrid
                  cols={{ base: 2, sm: 3, md: 4, lg: 5 }}
                  spacing="xs"
                  verticalSpacing={4}
                >
                  {factionIds.map((factionId) => {
                    const required = requiredFactions.includes(factionId);
                    const allowed = allowedFactions.includes(factionId);

                    return (
                      <Group
                        key={factionId}
                        gap={6}
                        py={4}
                        px={6}
                        wrap="nowrap"
                        style={{
                          borderRadius: 4,
                          border: required
                            ? "1px solid var(--mantine-color-green-6)"
                            : "1px solid var(--mantine-color-default-border)",
                          background: required
                            ? "var(--mantine-color-green-light)"
                            : "var(--mantine-color-default)",
                          opacity: !allowed && !required ? 0.5 : 1,
                        }}
                      >
                        <Checkbox
                          size="xs"
                          checked={allowed || required}
                          disabled={required}
                          onChange={() => {
                            if (required) return;
                            if (allowed) {
                              setAllowedFactions((f) =>
                                f.filter((id) => id !== factionId),
                              );
                            } else {
                              setAllowedFactions((f) => [...f, factionId]);
                            }
                          }}
                          styles={{
                            input: { cursor: required ? "default" : "pointer" },
                          }}
                        />
                        <Text
                          size="xs"
                          style={{
                            flex: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {factions[factionId].name}
                        </Text>
                        <Tooltip
                          label={required ? "Remove from required" : "Force include"}
                          position="top"
                          withArrow
                        >
                          <ActionIcon
                            size="xs"
                            variant={required ? "filled" : "subtle"}
                            color={required ? "green" : "gray"}
                            onMouseDown={() => {
                              if (required) {
                                setRequiredFactions((f) =>
                                  f.filter((id) => id !== factionId),
                                );
                              } else {
                                setRequiredFactions((f) => [...f, factionId]);
                                // Also ensure it's in allowed
                                if (!allowed) {
                                  setAllowedFactions((f) => [...f, factionId]);
                                }
                              }
                            }}
                          >
                            {required ? (
                              <IconLock size={10} />
                            ) : (
                              <IconLockOpen size={10} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    );
                  })}
                </SimpleGrid>
              </Box>
            ))}
          </Stack>
        </ScrollArea.Autosize>

        {/* Sticky Footer */}
        <Group
          justify="space-between"
          px="md"
          py="sm"
          style={{
            borderTop: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-body)",
          }}
        >
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {allowedFactions.length} allowed
            </Text>
            {requiredFactions.length > 0 && (
              <Badge size="xs" color="green" variant="light">
                {requiredFactions.length} forced
              </Badge>
            )}
          </Group>
          <Button
            size="sm"
            leftSection={<IconCheck size={14} />}
            onMouseDown={handleSave}
          >
            {buttonText}
          </Button>
        </Group>
      </Stack>
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
