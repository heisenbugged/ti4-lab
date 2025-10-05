import { Group } from "@mantine/core";
import { techSpecialtiesForSystems } from "~/utils/map";
import { TechIcon } from "../icons/TechIcon";
import { LegendaryIcon } from "../icons/LegendaryIcon";
import { Wormhole } from "../features/Wormhole";
import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { TradeStationIcon } from "~/components/icons/TradeStationIcon";

type Props = {
  slice: Slice;
};

export function SliceFeatures({ slice }: Props) {
  const systems = systemsInSlice(slice);
  const specialties = techSpecialtiesForSystems(systems);
  const legendarySystems = systems.filter(
    (s) => s.planets.filter((p) => p.legendary).length > 0,
  );
  const tradeStationsSystems = systems.filter(
    (s) => s.planets.filter((p) => p.tradeStation).length > 0,
  );
  const wormholes = systems
    .filter((s) => s.wormholes.length > 0)
    .map((s) => s.wormholes)
    .flat(1);

  return (
    <Group gap="sm" align="center">
      {specialties.map((tech, idx) => (
        <TechIcon key={idx} techSpecialty={tech} />
      ))}
      {legendarySystems.map((s) => (
        <LegendaryIcon key={s.id} />
      ))}
      {tradeStationsSystems.map((s) => (
        <TradeStationIcon key={s.id} />
      ))}
      {wormholes.map((w, idx) => (
        <Wormhole key={idx} wormhole={w} size={28} fontSize={14} />
      ))}
    </Group>
  );
}
