import { Group } from "@mantine/core";
import { systemsInSlice, techSpecialtiesForSystems } from "~/utils/map";
import { TechIcon } from "../icons/TechIcon";
import { LegendaryIcon } from "../icons/LegendaryIcon";
import { Wormhole } from "../features/Wormhole";

type Props = {
  slice: string[];
};

export function SliceFeatures({ slice }: Props) {
  const systems = systemsInSlice(slice);
  const specialties = techSpecialtiesForSystems(systems);
  const legendarySystems = systems.filter(
    (s) => s.planets.filter((p) => p.legendary).length > 0,
  );
  const wormholes = systems.filter((s) => s.wormhole).map((s) => s.wormhole!);

  return (
    <Group gap="sm" align="center">
      {specialties.map((tech, idx) => (
        <TechIcon key={idx} techSpecialty={tech} />
      ))}
      {legendarySystems.map((s, idx) => (
        <LegendaryIcon key={s.id} />
      ))}
      {wormholes.map((w, idx) => (
        <Wormhole key={idx} wormhole={w} size={28} fontSize={14} />
      ))}
    </Group>
  );
}
