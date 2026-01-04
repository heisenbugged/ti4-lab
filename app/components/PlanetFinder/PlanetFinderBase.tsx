import {
  Badge,
  Box,
  Button,
  Chip,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  getSystemGameSet,
  searchableSystemData,
  systemData,
  systemGameSetLabels,
} from "~/data/systemData";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { FactionId, System, SystemId } from "~/types";
import { useArrowFocus } from "~/hooks/useArrowFocus";
import { TechIcon } from "~/components/icons/TechIcon";
import { factions } from "~/data/factionData";
import { useUsedSystemIds } from "~/hooks/useUsedSystemIds";
import { FILTER_CATEGORIES } from "./filterCategories";

import styles from "../../routes/draft.$id/components/PlanetFinder/PlanetFinder.module.css";

export type PlanetFinderBaseProps = {
  opened: boolean;
  onClose: () => void;
  onSystemSelected: (system: System) => void;
  availableSystemIds: SystemId[];
  factionPool: FactionId[];
  allowHomePlanetSearch: boolean;
};

export function PlanetFinderBase({
  opened,
  onClose,
  onSystemSelected,
  availableSystemIds,
  factionPool,
  allowHomePlanetSearch,
}: PlanetFinderBaseProps) {
  const usedSystemIds = useUsedSystemIds();

  const [searchString, setSearchString] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchString("");
  };

  const combinedSearchTerms = useMemo(() => {
    const terms: string[] = [];

    for (const category of FILTER_CATEGORIES) {
      for (const filter of category.filters) {
        if (activeFilters.includes(filter.id)) {
          terms.push(filter.searchTerm);
        }
      }
    }

    if (searchString.trim()) {
      terms.push(searchString.trim());
    }

    return terms;
  }, [activeFilters, searchString]);

  const isValidSystem = (system: System) => {
    return (
      availableSystemIds.includes(system.id) ||
      system.type === "HYPERLANE" ||
      (allowHomePlanetSearch &&
        system.faction &&
        system.type === "GREEN" &&
        factionPool.includes(system.faction))
    );
  };

  const systems = useMemo(() => {
    if (combinedSearchTerms.length === 0) return [];

    return searchableSystemData
      .filter(([name, id]) => {
        const nameLower = name.toLowerCase();
        const allTermsMatch = combinedSearchTerms.every((term) =>
          nameLower.includes(term.toLowerCase()),
        );
        return allTermsMatch && isValidSystem(systemData[id]);
      })
      .map(([, system]) => {
        const data = systemData[system];
        if (!data.hyperlanes) return data;

        const rotations = [];
        for (let i = 0; i < 300; i += 60) {
          rotations.push({ ...data, rotation: i });
        }
        return rotations;
      })
      .flat(1)
      .sort((a, b) => {
        if (usedSystemIds.includes(a.id) && !usedSystemIds.includes(b.id))
          return 1;
        if (!usedSystemIds.includes(a.id) && usedSystemIds.includes(b.id))
          return -1;
        return 0;
      })
      .slice(0, 20);
  }, [combinedSearchTerms, availableSystemIds, usedSystemIds]);

  const { itemRefs, resetFocus } = useArrowFocus(systems, (idx) => {
    if (idx <= 0) return;
    onSystemSelected(systems[idx - 1]);
  });

  useEffect(() => {
    if (opened) {
      setSearchString("");
      setActiveFilters([]);
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 150);
    }
  }, [opened]);

  const hasActiveFilters = activeFilters.length > 0 || searchString.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="900"
      title={
        <Text size="sm" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          System Database
        </Text>
      }
      styles={{
        content: { maxWidth: "95vw" },
      }}
    >
      <Stack gap="sm">
        <Box className={styles.stickyHeader}>
          <Stack gap="sm">
            <TextInput
              ref={(el) => {
                if (!itemRefs.current || !el) return;
                itemRefs.current[0] = el;
              }}
              placeholder="Search by ID, planet name, resources, influence..."
              value={searchString}
              onChange={(e) => {
                resetFocus();
                setSearchString(e.target.value.toLowerCase());
              }}
            />

            <Group gap="xs" p="xs" wrap="wrap" mih={36} className={styles.activeFiltersBar}>
              {hasActiveFilters ? (
                <>
                  {activeFilters.map((filterId) => {
                    const filter = FILTER_CATEGORIES.flatMap((c) => c.filters).find(
                      (f) => f.id === filterId,
                    );
                    if (!filter) return null;
                    return (
                      <Badge
                        key={filterId}
                        color={filter.color}
                        variant="light"
                        size="sm"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setActiveFilters((prev) =>
                            prev.filter((f) => f !== filterId),
                          )
                        }
                      >
                        {filter.label} ×
                      </Badge>
                    );
                  })}
                  {searchString && (
                    <Badge
                      variant="light"
                      size="sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSearchString("")}
                    >
                      "{searchString}" ×
                    </Badge>
                  )}
                  <Button
                    variant="subtle"
                    size="compact-xs"
                    color="red"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </>
              ) : (
                <Text size="xs" c="dimmed">
                  Select filters or type to search
                </Text>
              )}
            </Group>
          </Stack>
        </Box>

        <Box className={styles.layout}>
          <Box className={styles.filterPanel}>
            {FILTER_CATEGORIES.map((category) => (
              <Box key={category.id} className={styles.filterSection}>
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb={6}>
                  {category.label}
                </Text>
                <Chip.Group
                  multiple
                  value={activeFilters}
                  onChange={setActiveFilters}
                >
                  <Group gap={4}>
                    {category.filters.map((filter) => (
                      <Chip
                        key={filter.id}
                        value={filter.id}
                        size="xs"
                        color={filter.color}
                        variant="light"
                      >
                        {filter.label}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </Box>
            ))}
          </Box>

          <Box pr="xs" style={{ overflowY: "auto" }}>
            {systems.length > 0 && (
              <Text size="xs" c="dimmed" mb="xs">
                {systems.length} systems found
              </Text>
            )}

            {systems.length === 0 && hasActiveFilters && (
              <Stack align="center" justify="center" p="xl" mih={200} ta="center">
                <Text size="xl" mb="xs">∅</Text>
                <Text size="sm">No systems match your filters</Text>
              </Stack>
            )}

            {systems.length === 0 && !hasActiveFilters && (
              <Stack align="center" justify="center" p="xl" mih={200} ta="center">
                <Text size="xl" mb="xs">⬡</Text>
                <Text size="sm">Select filters or search to find systems</Text>
              </Stack>
            )}

            <Stack gap={2}>
              {systems.map((system, idx) => (
                <Box
                  key={`${system.id}-${system.rotation ?? 0}`}
                  className={`${styles.systemRow} ${usedSystemIds.includes(system.id) ? styles.inUse : ""}`}
                  tabIndex={idx + 1}
                  ref={(el) => {
                    if (!itemRefs.current || !el) return;
                    itemRefs.current[idx + 1] = el;
                  }}
                  onMouseDown={() => onSystemSelected(system)}
                >
                  <Group gap="sm" wrap="wrap" style={{ flex: 1 }}>
                    <Group gap={4} wrap="nowrap">
                      <Badge
                        variant="default"
                        size="sm"
                        radius="sm"
                        style={{ minWidth: 36, textAlign: "center" }}
                      >
                        {system.id}
                      </Badge>
                      {getSystemGameSet(system.id) && (
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: 28, opacity: 0.6, flexShrink: 0 }}
                        >
                          {systemGameSetLabels[getSystemGameSet(system.id)!]}
                        </Text>
                      )}
                    </Group>

                    {system.planets.map((planet, pIdx) => (
                      <Fragment key={planet.name}>
                        {pIdx > 0 && <span className={styles.planetDivider} />}
                        <Group gap={6} wrap="nowrap">
                          <span
                            className={`${styles.traitDot} ${
                              planet.trait?.[0]
                                ? styles[planet.trait[0].toLowerCase()]
                                : styles.neutral
                            }`}
                          />
                          <Text size="sm">{planet.name}</Text>
                          <PlanetStatsPill
                            resources={planet.resources}
                            influence={planet.influence}
                          />
                          {planet.tech?.map((tech) => (
                            <TechIcon key={tech} techSpecialty={tech} size={14} />
                          ))}
                          {planet.legendary && (
                            <Badge size="xs" color="yellow" variant="light">
                              ★
                            </Badge>
                          )}
                          {planet.tradeStation && (
                            <Badge size="xs" color="cyan" variant="light">
                              Station
                            </Badge>
                          )}
                        </Group>
                      </Fragment>
                    ))}

                    {system.wormholes.map((wormhole) => {
                      const wormholeColor: Record<string, string> = {
                        ALPHA: "orange",
                        BETA: "green",
                        GAMMA: "violet",
                        DELTA: "blue",
                      };
                      return (
                        <Badge
                          key={wormhole}
                          size="xs"
                          color={wormholeColor[wormhole] ?? "gray"}
                          variant="light"
                        >
                          {wormhole}
                        </Badge>
                      );
                    })}

                    {system.anomalies.map((anomaly) => (
                      <Badge key={anomaly} size="xs" color="orange" variant="light">
                        {anomaly.replace(/_/g, " ")}
                      </Badge>
                    ))}

                    {system.planets.length === 0 &&
                      system.anomalies.length === 0 &&
                      system.wormholes.length === 0 &&
                      !system.hyperlanes && (
                        <Badge size="xs" color="gray" variant="light">
                          EMPTY
                        </Badge>
                      )}

                    {system.hyperlanes && (
                      <Badge size="xs" color="gray" variant="light">
                        HYPERLANE {system.rotation}°
                      </Badge>
                    )}

                    {system.faction && (
                      <Badge size="xs" color="gray" variant="outline">
                        {factions[system.faction].name}
                      </Badge>
                    )}
                  </Group>

                  {usedSystemIds.includes(system.id) && (
                    <Badge size="xs" color="violet" variant="filled">
                      In Use
                    </Badge>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Modal>
  );
}
