import {
  Badge,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction } from "~/types";
import { factionSystems } from "~/data/systemData";
import { ResourceIcon } from "~/components/Planet/ResourceIcon";
import { SmallNumberHex } from "~/components/Hex/SmallNumberHex";
import styles from "./NewDraftReferenceCard.module.css";
import { Surface } from "~/ui";

type Props = {
  faction: Faction;
};

export function NewDraftReferenceCard({ faction }: Props) {
  const homeSystem = factionSystems[faction.id];

  // Calculate optimal home system value (sum of max(resources, influence) for each planet)
  const homeSystemValue =
    homeSystem?.planets.reduce((total, planet) => {
      return total + Math.max(planet.resources, planet.influence);
    }, 0) ?? 0;

  return (
    <Stack gap={0} className={styles.card}>
      <Surface variant="card" className={styles.cardHeader}>
        <Stack gap={4} px="sm" py={8} pb={4}>
          <div className={styles.factionBadge}>
            <FactionIcon
              faction={faction.id}
              style={{ width: 20, height: 20 }}
            />
          </div>
          {faction.priorityOrder !== undefined && (
            <div className={styles.priorityPill}>
              <Text size="sm" fw="bold" c="white" ff="heading">
                {faction.priorityOrder}
              </Text>
            </div>
          )}
          <Group
            align="center"
            flex={1}
            className={styles.factionNameGroup}
            pt={5}
            pb={6}
          >
            <Text flex={1} size="12px" ff="heading" fw="bold" pl="xs">
              {faction.name}
            </Text>
          </Group>
        </Stack>
      </Surface>
      <Surface variant="card" className={styles.cardBody}>
        <Stack p="sm" gap="md">
          <Stack gap="xs" className={styles.homeSystemSection}>
            <Group gap="xs">
              <Title order={6} size="xs" c="dimmed">
                Home System
              </Title>
              <Badge
                size="sm"
                variant="filled"
                fw="bold"
                color="blue"
                className={styles.splitBadge}
              >
                <span className={styles.splitBadgeLeft} />
                <span className={styles.splitBadgeText}>{homeSystemValue}</span>
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
              {homeSystem?.planets.map((planet, idx) => (
                <Group key={idx} gap="xs" align="center" wrap="nowrap">
                  <ResourceIcon value={planet.resources} size={20} />
                  <SmallNumberHex value={planet.influence} size={20} />
                  <Text size="sm" lineClamp={1}>
                    {planet.name}
                  </Text>
                </Group>
              ))}
            </SimpleGrid>
          </Stack>

          {faction.fleetComposition &&
            (() => {
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
              ] as const;

              const units = unitOrder
                .map(({ key, name }) => {
                  const count = faction.fleetComposition?.[key];
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
                  <Title order={6} size="xs" c="dimmed">
                    Starting Units
                  </Title>
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
            })()}
        </Stack>
      </Surface>
    </Stack>
  );
}
