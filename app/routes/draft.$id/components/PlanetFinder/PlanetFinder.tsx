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
import { System } from "~/types";
import { useArrowFocus } from "~/hooks/useArrowFocus";
import { TechIcon } from "~/components/icons/TechIcon";
import { factions } from "~/data/factionData";
import { useDraft } from "~/draftStore";
import { useUsedSystemIds } from "~/hooks/useUsedSystemIds";

import styles from "./PlanetFinder.module.css";

type Props = {
  onSystemSelected?: (system: System) => void;
};

type FilterCategory = {
  id: string;
  label: string;
  filters: FilterOption[];
};

type FilterOption = {
  id: string;
  label: string;
  searchTerm: string;
  color?: string;
};

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "traits",
    label: "Planet Traits",
    filters: [
      { id: "cultural", label: "Cultural", searchTerm: "cultural", color: "blue" },
      { id: "hazardous", label: "Hazardous", searchTerm: "hazardous", color: "red" },
      { id: "industrial", label: "Industrial", searchTerm: "industrial", color: "green" },
    ],
  },
  {
    id: "tech",
    label: "Tech Skips",
    filters: [
      { id: "biotic", label: "Biotic", searchTerm: "biotic", color: "green" },
      { id: "propulsion", label: "Propulsion", searchTerm: "propulsion", color: "blue" },
      { id: "cybernetic", label: "Cybernetic", searchTerm: "cybernetic", color: "yellow" },
      { id: "warfare", label: "Warfare", searchTerm: "warfare", color: "red" },
    ],
  },
  {
    id: "special",
    label: "Special",
    filters: [
      { id: "legendary", label: "Legendary", searchTerm: "legendary", color: "yellow" },
      { id: "station", label: "Space Station", searchTerm: "space station", color: "cyan" },
    ],
  },
  {
    id: "wormholes",
    label: "Wormholes",
    filters: [
      { id: "wormhole", label: "Any", searchTerm: "wormhole", color: "gray" },
      { id: "alpha", label: "Alpha", searchTerm: "alpha", color: "orange" },
      { id: "beta", label: "Beta", searchTerm: "beta", color: "green" },
      { id: "gamma", label: "Gamma", searchTerm: "gamma", color: "violet" },
      { id: "delta", label: "Delta", searchTerm: "delta", color: "blue" },
    ],
  },
  {
    id: "anomalies",
    label: "Anomalies",
    filters: [
      { id: "anomaly", label: "Any", searchTerm: "anomaly", color: "orange" },
      { id: "nebula", label: "Nebula", searchTerm: "nebula", color: "orange" },
      { id: "asteroid", label: "Asteroid", searchTerm: "asteroid field", color: "orange" },
      { id: "rift", label: "Gravity Rift", searchTerm: "gravity rift", color: "orange" },
      { id: "supernova", label: "Supernova", searchTerm: "supernova", color: "orange" },
    ],
  },
  {
    id: "system",
    label: "System Type",
    filters: [
      { id: "empty", label: "Empty", searchTerm: "empty", color: "gray" },
      { id: "1planet", label: "1 Planet", searchTerm: "1 planet", color: "gray" },
      { id: "2planet", label: "2 Planets", searchTerm: "2 planet", color: "gray" },
      { id: "3planet", label: "3 Planets", searchTerm: "3 planet", color: "gray" },
    ],
  },
  {
    id: "gameset",
    label: "Game Set",
    filters: [
      { id: "gs-base", label: "Base", searchTerm: "base game", color: "gray" },
      { id: "gs-pok", label: "PoK", searchTerm: "prophecy of kings", color: "gray" },
      { id: "gs-te", label: "Thunder's Edge", searchTerm: "thunders edge", color: "gray" },
      { id: "gs-ds", label: "Discordant Stars", searchTerm: "discordant stars", color: "gray" },
      { id: "gs-us", label: "Uncharted Stars", searchTerm: "uncharted stars", color: "gray" },
    ],
  },
];

export function PlanetFinder({ onSystemSelected }: Props) {
  const planetFinderModal = useDraft((state) => state.planetFinderModal);
  const availableSystemIds = useDraft((state) => state.systemPool);
  const factionPool = useDraft((state) => state.factionPool);
  const allowHomePlanetSearch = useDraft(
    (state) => state.draft.settings.allowHomePlanetSearch,
  );
  const usedSystemIds = useUsedSystemIds();
  const opened = !!planetFinderModal;
  const { addSystemToMap, addSystemToSlice, closePlanetFinder } = useDraft(
    (state) => state.actions,
  );

  const [searchString, setSearchString] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSelectSystem = (system: System) => {
    if (!planetFinderModal) return;

    if (planetFinderModal.mode === "map") {
      addSystemToMap(planetFinderModal.tileIdx, system);
    }

    if (planetFinderModal.mode === "slice") {
      addSystemToSlice(
        planetFinderModal.sliceIdx,
        planetFinderModal.tileIdx,
        system,
      );
    }

    onSystemSelected?.(system);
    closePlanetFinder();
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchString("");
  };

  // Build combined search terms from filters and text input
  const combinedSearchTerms = useMemo(() => {
    const terms: string[] = [];

    // Add filter search terms
    for (const category of FILTER_CATEGORIES) {
      for (const filter of category.filters) {
        if (activeFilters.includes(filter.id)) {
          terms.push(filter.searchTerm);
        }
      }
    }

    // Add text search
    if (searchString.trim()) {
      terms.push(searchString.trim());
    }

    return terms;
  }, [activeFilters, searchString]);

  const isValidSystem = (system: System, searchString: string) => {
    return (
      availableSystemIds.includes(system.id) ||
      (system.type === "HYPERLANE" &&
        searchString === system.id.toLowerCase()) ||
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
        return allTermsMatch && isValidSystem(systemData[id], searchString);
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
  }, [combinedSearchTerms, availableSystemIds, usedSystemIds, searchString]);

  const { itemRefs, resetFocus } = useArrowFocus(systems, (idx) => {
    if (idx <= 0) return;
    handleSelectSystem(systems[idx - 1]);
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
      opened={!!opened}
      onClose={closePlanetFinder}
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
        {/* Sticky Header */}
        <Box className={styles.stickyHeader}>
          <Stack gap="sm">
            {/* Search Input */}
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

            {/* Active Filters Bar - always visible to prevent layout shift */}
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

        {/* Two Column Layout */}
        <Box className={styles.layout}>
          {/* Filter Panel */}
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

          {/* Results Panel */}
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
                  onMouseDown={() => handleSelectSystem(system)}
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
