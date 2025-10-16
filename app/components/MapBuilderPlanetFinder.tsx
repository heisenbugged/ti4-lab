import { Box, Group, Input, Modal, Stack, Text, useMantineTheme } from "@mantine/core";
import { Fragment, useEffect, useState } from "react";
import { searchableSystemData, systemData } from "~/data/systemData";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { PlanetTrait, System } from "~/types";
import { useArrowFocus } from "~/hooks/useArrowFocus";
import { TechIcon } from "~/components/icons/TechIcon";
import { factions } from "~/data/factionData";
import { useMapBuilder } from "~/mapBuilderStore";
import { useUsedSystemIds } from "~/hooks/useUsedSystemIds";

import "../routes/draft.$id/components/PlanetFinder/PlanetFinder.css";

type Props = {
  onSystemSelected?: (system: System) => void;
};

/**
 * PlanetFinder component adapted for the map builder.
 * Uses useMapBuilder instead of useDraft.
 */
export function MapBuilderPlanetFinder({ onSystemSelected }: Props) {
  const theme = useMantineTheme();
  const planetFinderModal = useMapBuilder((state) => state.planetFinderModal);
  const availableSystemIds = useMapBuilder((state) => state.systemPool);
  const factionPool = useMapBuilder((state) => state.factionPool);
  const allowHomePlanetSearch = useMapBuilder(
    (state) => state.draft.settings.allowHomePlanetSearch,
  );
  const usedSystemIds = useUsedSystemIds();
  const opened = !!planetFinderModal;
  const { addSystemToMap, closePlanetFinder } = useMapBuilder(
    (state) => state.actions,
  );

  const bgColor: Record<PlanetTrait, string> = {
    CULTURAL: theme.colors.blue[4],
    HAZARDOUS: theme.colors.red[5],
    INDUSTRIAL: theme.colors.green[5],
  };

  const handleSelectSystem = (system: System) => {
    if (!planetFinderModal) return;

    if (planetFinderModal.mode === "map") {
      addSystemToMap(planetFinderModal.tileIdx, system);
    }

    onSystemSelected?.(system);
    closePlanetFinder();
  };

  const [searchString, setSearchString] = useState<string>("");

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

  const systems =
    searchString.length > 0
      ? searchableSystemData
          .filter(
            ([name, id]) =>
              name.toLowerCase().includes(searchString) &&
              isValidSystem(systemData[id], searchString),
          )
          .map(([, system]) => {
            const data = systemData[system];
            if (!data.hyperlanes) return data;

            // for hyperlanes, add an entry per "20" degrees of rotation all the way to 300
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

          .slice(0, 15)
      : [];

  const { itemRefs, resetFocus } = useArrowFocus(systems, (idx) => {
    // 0 is reserved for search bar
    if (idx <= 0) return;
    handleSelectSystem(systems[idx - 1]);
  });

  useEffect(() => {
    if (opened) {
      setSearchString("");
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 150);
    }
  }, [opened]);

  return (
    <Modal
      opened={!!opened}
      onClose={closePlanetFinder}
      size="lg"
      title="Search systems"
      removeScrollProps={{ removeScrollBar: false }}
    >
      <Box px="4">
        <Input
          ref={(el) => {
            if (!itemRefs.current || !el) return;
            itemRefs.current[0] = el;
          }}
          placeholder="System id, planet name, blue tech skip, green planet, 2 resources, nebula, etc."
          onChange={(e) => {
            resetFocus();
            setSearchString(e.target.value.toLowerCase());
          }}
        />
      </Box>

      <Stack pt="xl" gap="lg">
        {systems.map((system, idx) => (
          <Group
            key={system.id}
            gap="sm"
            align="center"
            justify="space-between"
            className="searchable-system"
            py="sm"
            px="sm"
            tabIndex={idx + 1}
            ref={(el) => {
              if (!itemRefs.current || !el) return;
              itemRefs.current[idx + 1] = el;
            }}
            onMouseDown={() => handleSelectSystem(system)}
          >
            <Group gap="sm">
              <Text size="xs" tt="uppercase" c="dimmed">
                {system.id}
              </Text>
              {system.planets.map((planet, idx) => (
                <Fragment key={planet.name}>
                  <Group gap="xs">
                    {planet.trait ? (
                      planet.trait.map((trait) => (
                        <Box
                          key={trait}
                          w="10"
                          h="10"
                          style={{ borderRadius: 10 }}
                          bg={bgColor[trait]}
                        />
                      ))
                    ) : (
                      <Box
                        w="10"
                        h="10"
                        style={{ borderRadius: 10 }}
                        bg="gray.5"
                      />
                    )}
                    <Text size="sm">{planet.name}</Text>
                    <PlanetStatsPill
                      resources={planet.resources}
                      influence={planet.influence}
                    />
                    {planet.tech?.map((tech) => (
                      <TechIcon key={tech} techSpecialty={tech} size={16} />
                    ))}
                  </Group>
                  {idx < system.planets.length - 1 && <Divider />}
                </Fragment>
              ))}
              {system.anomalies.map((anomaly) => (
                <Text size="sm" c="dimmed" key={anomaly}>
                  {anomaly.replace("_", " ")}
                </Text>
              ))}
              {system.planets.length === 0 &&
                system.anomalies.length === 0 &&
                system.wormholes.length === 0 &&
                !system.hyperlanes && (
                  <Text size="sm" c="dimmed">
                    EMPTY
                  </Text>
                )}

              {system.hyperlanes && (
                <Text size="sm">HYPERLANE ({system.rotation}°)</Text>
              )}

              {system.wormholes.map((wormhole) => (
                <Text size="sm" c="dimmed" key={wormhole}>
                  {wormhole}
                </Text>
              ))}

              {system.faction && (
                <Text size="sm" c="dimmed">
                  {factions[system.faction].name}
                </Text>
              )}
            </Group>
            {usedSystemIds.includes(system.id) && (
              <Text c="violet">In Use</Text>
            )}
          </Group>
        ))}
      </Stack>
    </Modal>
  );
}

function Divider() {
  return (
    <div
      style={{ height: 8, width: 1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
    />
  );
}
