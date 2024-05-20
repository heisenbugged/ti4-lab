import { Hex } from "../Hex";
import { System, SystemTile, Tile } from "~/types";
import { useContext, useRef, useState } from "react";
import { MapContext } from "../MapContext";
import { Box, Button, Group, Input, Menu, Text } from "@mantine/core";
import { PlanetStatsPill } from "../Slice/PlanetStatsPill";
import { TechIcon } from "../features/TechIcon";
import { searchableSystemData, systemData } from "~/data/systemData";
import { bgColor } from "../Planet";

type Props = {
  mapId: string;
  tile: Tile;
  onSelect?: () => void;
};

export function EmptyTile({ mapId, onSelect }: Props) {
  const { radius } = useContext(MapContext);

  return (
    <Hex id={`${mapId}-empty`} radius={radius} color="#d6d6ea">
      {/* + */}
      <Button px="6" py="4" h="auto" onMouseDown={onSelect}>
        +
      </Button>
    </Hex>
  );
}
