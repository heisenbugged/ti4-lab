import { List, SimpleGrid, Stack, Title } from "@mantine/core";
import { FleetComposition } from "~/types";

type Props = {
  fleetComposition: FleetComposition;
  title?: string;
  showTitle?: boolean;
};

export function StartingUnitsTable({
  fleetComposition,
  title = "Starting Units",
  showTitle = true,
}: Props) {
  const unitOrder = [
    { key: "flagship", name: "Flagship" },
    { key: "warsun", name: "War Sun" },
    { key: "dreadnought", name: "Dreadnought" },
    { key: "carrier", name: "Carrier" },
    { key: "infantry", name: "Infantry" },
    { key: "destroyer", name: "Destroyer" },
    { key: "cruiser", name: "Cruiser" },
    { key: "spacedock", name: "Space Dock" },
    { key: "fighter", name: "Fighter" },
    { key: "pds", name: "PDS" },
    { key: "mech", name: "Mech" },
  ] as const;

  const units = unitOrder
    .map(({ key, name }) => {
      const count = fleetComposition[key];
      if (!count) return null;
      let pluralized: string = name;
      if (name === "Infantry" || name === "PDS") {
        pluralized = name;
      } else if (name === "War Sun") {
        pluralized = count > 1 ? "War Suns" : "War Sun";
      } else {
        pluralized = count > 1 ? `${name}s` : name;
      }
      return `${count} ${pluralized}`;
    })
    .filter((unit): unit is string => unit !== null);

  const leftColumn = units.filter((_, idx) => idx % 2 === 0);
  const rightColumn = units.filter((_, idx) => idx % 2 === 1);

  return (
    <Stack gap="xs">
      {showTitle && (
        <Title order={6} size="xs" c="dimmed">
          {title}
        </Title>
      )}
      <SimpleGrid cols={2} spacing={4}>
        <List size="xs" spacing={2}>
          {leftColumn.map((unit, idx) => (
            <List.Item key={idx}>{unit}</List.Item>
          ))}
        </List>
        <List size="xs" spacing={2}>
          {rightColumn.map((unit, idx) => (
            <List.Item key={idx}>{unit}</List.Item>
          ))}
        </List>
      </SimpleGrid>
    </Stack>
  );
}
