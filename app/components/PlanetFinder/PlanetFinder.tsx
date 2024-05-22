import { Box, Group, Input, Modal, Stack, Text } from "@mantine/core";
import { Fragment, useEffect, useRef, useState } from "react";
import { searchableSystemData, systemData } from "~/data/systemData";
import { PlanetStatsPill } from "../Slice/PlanetStatsPill";
import { TechIcon } from "../features/TechIcon";
import { System } from "~/types";
import { useDisclosure } from "@mantine/hooks";
import { bgColor } from "../Planet";

import "./PlanetFinder.css";
import { useArrowFocus } from "~/hooks/useArrowFocus";

type Props = {
  opened?: boolean;
  usedSystemIds: string[];
  onClose: () => void;
  onSelectSystem: (system: System) => void;
};

export function PlanetFinder({
  usedSystemIds,
  opened,
  onClose,
  onSelectSystem,
}: Props) {
  const [searchString, setSearchString] = useState<string>("");
  const systems =
    searchString.length > 0
      ? searchableSystemData
          .filter(([name]) => name.includes(searchString))
          .map(([, system]) => systemData[system])
          .slice(0, 8)
      : [];

  const { itemRefs, resetFocus } = useArrowFocus(systems, (idx) => {
    console.log("the idx is", idx);
    // 0 is reserved for search bar
    if (idx <= 0) return;
    onSelectSystem(systems[idx - 1]);
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
    <Modal opened={!!opened} onClose={onClose} size="xl" title="Search systems">
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
            onMouseDown={() => onSelectSystem(system)}
          >
            <Group gap="sm">
              <Text size="xs" tt="uppercase" c="gray.8">
                {system.id}
              </Text>
              {system.planets.map((planet, idx) => (
                <Fragment key={planet.name}>
                  <Group gap={2}>
                    <Box
                      w="10"
                      h="10"
                      style={{ borderRadius: 10 }}
                      bg={planet.trait ? bgColor[planet.trait] : "gray.5"}
                    />
                    <Text size="sm">{planet.name}</Text>
                    <PlanetStatsPill
                      resources={planet.resources}
                      influence={planet.influence}
                    />
                    {planet.techSpecialty && (
                      <TechIcon
                        techSpecialty={planet.techSpecialty}
                        size={16}
                      />
                    )}
                  </Group>
                  {idx < system.planets.length - 1 && <Divider />}
                </Fragment>
              ))}
              {system.anomaly && (
                <Text size="sm" c="gray.7">
                  {system.anomaly.replace("_", " ")}
                </Text>
              )}
              {system.planets.length === 0 &&
                !system.anomaly &&
                !system.wormhole && (
                  <Text size="sm" c="gray.7">
                    EMPTY
                  </Text>
                )}
            </Group>
            {usedSystemIds.includes(system.id.toString()) && (
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
