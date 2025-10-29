import { Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction } from "~/types";
import { factionSystems } from "~/data/systemData";
import { ResourceIcon } from "~/components/Planet/ResourceIcon";
import { SmallNumberHex } from "~/components/Hex/SmallNumberHex";
import styles from "./NewDraftReferenceCard.module.css";
import { Surface } from "~/ui";
import { StartingUnitsTable } from "~/components/StartingUnitsTable";

type Props = {
  faction: Faction;
};

export function NewDraftReferenceCard({ faction }: Props) {
  const homeSystem = factionSystems[faction.id];

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

          {faction.fleetComposition && (
            <StartingUnitsTable fleetComposition={faction.fleetComposition} />
          )}
        </Stack>
      </Surface>
    </Stack>
  );
}
