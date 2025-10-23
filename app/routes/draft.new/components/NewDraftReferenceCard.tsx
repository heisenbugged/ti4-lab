import {
  Badge,
  Box,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  Table,
} from "@mantine/core";
import { IconPlanet, IconSwords } from "@tabler/icons-react";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction } from "~/types";
import { factionSystems } from "~/data/systemData";
import { ResourceIcon } from "~/components/Planet/ResourceIcon";
import { SmallNumberHex } from "~/components/Hex/SmallNumberHex";
import styles from "./NewDraftReferenceCard.module.css";
import { UnitIconWithCount } from "~/components/units/UnitIconWithCount";

import classes from "../../../components/Surface.module.css";

type Props = {
  faction: Faction;
};

export function NewDraftReferenceCard({ faction }: Props) {
  const homeSystem = factionSystems[faction.id];
  const priorityOrder =
    faction.priorityOrder ?? Math.floor(Math.random() * 100);

  return (
    <Stack gap={0} className={styles.card}>
      <Stack
        gap={4}
        px="sm"
        py={8}
        pb={4}
        className={`${classes.surface} ${classes.withBorder} ${styles.cardHeader}`}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          position: "relative",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          height: "100%",
        }}
      >
        <div className={styles.factionBadge}>
          <FactionIcon faction={faction.id} style={{ width: 20, height: 20 }} />
        </div>
        <div className={styles.priorityPill}>
          <Badge size="md" color="orange" radius="xl" variant="filled" px="xs">
            #{priorityOrder}
          </Badge>
        </div>
        <Group
          align="center"
          flex={1}
          style={{
            overflow: "hidden",
            flexWrap: "nowrap",
          }}
          pt={5}
          pb={6}
        >
          <Text flex={1} size="12px" ff="heading" fw="bold" pl="xs">
            {faction.name}
          </Text>
        </Group>
      </Stack>
      <Box
        style={{
          borderRadius: "0 0 var(--mantine-radius-md) var(--mantine-radius-md)",
          borderTop: 0,
        }}
        className={`${classes.surface} ${classes.withBorder}`}
        p="xs"
      >
        <Group>
          <IconPlanet size={18} color="var(--mantine-color-dimmed)" />

          {homeSystem?.planets.map((planet, idx) => (
            <Group key={idx} gap="xs" align="center">
              <Group gap="xs" align="center">
                <ResourceIcon value={planet.resources} size={16} />
                <SmallNumberHex value={planet.influence} size={16} />
              </Group>
              {idx < homeSystem.planets.length - 1 && (
                <Divider orientation="vertical" size="xs" color="dark.4" />
              )}
            </Group>
          ))}
        </Group>
        <Divider my="xs" color="gray.5" />
        <Group gap="xs" align="center">
          <UnitIconWithCount unit="carrier" count={2} size={24} />
          <UnitIconWithCount unit="dreadnought" count={1} size={24} />
          <UnitIconWithCount unit="destroyer" count={1} size={24} />
          <UnitIconWithCount unit="fighter" count={3} size={24} />
          <UnitIconWithCount unit="infantry" count={4} size={24} />
          <UnitIconWithCount unit="spacedock" count={1} size={24} />
        </Group>
      </Box>
    </Stack>
  );
}
