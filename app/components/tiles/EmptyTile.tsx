import { Hex } from "../Hex";
import { System, SystemTile, Tile } from "~/types";
import { useContext, useState } from "react";
import { MapContext } from "../MapContext";
import { Box, Button, Group, Input, Menu, Text } from "@mantine/core";
import { PlanetStatsPill } from "../Slice/PlanetStatsPill";
import { TechIcon } from "../features/TechIcon";
import { searchableSystemData, systemData } from "~/data/systemData";
import { bgColor } from "../Planet";

type Props = {
  mapId: string;
  tile: Tile;
  onSelectSystem?: (tile: System) => void;
};

export function EmptyTile({ mapId, onSelectSystem }: Props) {
  const { radius } = useContext(MapContext);

  const [searchString, setSearchString] = useState<string>("");
  const systems =
    searchString.length > 0
      ? searchableSystemData
          .filter(([name]) => name.includes(searchString))
          .map(([name, system]) => systemData[system])
          .slice(0, 8)
      : [];

  return (
    <Hex id={`${mapId}-empty`} radius={radius} color="#d6d6ea">
      {/* + */}
      <Menu
        shadow="md"
        width={600}
        closeOnClickOutside={false}
        closeOnItemClick={false}
        trapFocus
      >
        <Menu.Target>
          <Button px="6" py="4" h="auto">
            +
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Search Systems</Menu.Label>
          <Box px="4">
            <Input
              placeholder="Planet Name"
              onChange={(e) => setSearchString(e.target.value.toLowerCase())}
            />
          </Box>
          <Menu.Divider />
          {systems.map((system) => (
            <Menu.Item
              onMouseDown={() => {
                if (onSelectSystem) onSelectSystem(system);
              }}
              onKeyDownCapture={(e) => {
                if (e.code === "Enter") {
                  if (onSelectSystem) onSelectSystem(system);
                }
              }}
            >
              <Group gap="sm" align="center">
                <Text size="xs" tt="uppercase" c="gray.8">
                  {system.id}
                </Text>
                {system.planets.map((planet, idx) => (
                  <>
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
                    {idx < system.planets.length - 1 && (
                      <div
                        style={{
                          height: 8,
                          width: 1,
                          backgroundColor: "rgba(0, 0, 0, 0.2)",
                        }}
                      />
                    )}
                  </>
                ))}
              </Group>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Hex>
  );
}
