import { Hex } from "../Hex";
import { Tile } from "~/types";
import { useContext } from "react";
import { MapContext } from "../MapContext";
import { Box, Button, Input, Menu } from "@mantine/core";

type Props = { mapId: string; tile: Tile };

export function EmptyTile({ mapId }: Props) {
  const { radius } = useContext(MapContext);
  return (
    <Hex id={`${mapId}-empty`} radius={radius} color="#d6d6ea">
      {/* + */}
      <Menu
        shadow="md"
        width={400}
        closeOnClickOutside={false}
        closeOnItemClick={false}
      >
        <Menu.Target>
          <Button px="6" py="4" h="auto">
            +
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Search Systems</Menu.Label>
          <Box px="4">
            <Input placeholder="Planet Name" />
          </Box>
          <Menu.Divider />
          <Menu.Item>Vega Major / Vega Minor</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Hex>
  );
}
