import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { SectionTitle } from "~/components/Section";

export default function DraftPresets() {
  return (
    <>
      <Box mt="lg">
        <SectionTitle title="Draft Compendium" />
        <Text size="lg" px="lg" my="lg">
          The compendium contains popular draft presets that can be used to
          quickly start a draft. These presets come from past tournaments,
          community events, and other sources.
        </Text>

        <SimpleGrid cols={6} px="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src="/draftpresets/legendarywormholes.png"
                height={160}
                alt="Legendary Wormholes"
              />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>Legendary Wormholes</Text>
              <Badge color="pink">Nucleum</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              A very wormhole connected map where the legendary planets are
              going to be adjacent to both an alpha and beta wormhole
            </Text>

            <Button fullWidth mt="md" radius="md">
              Load
            </Button>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder maw="400">
            <Card.Section>
              <Image
                src="/draftpresets/asteroidbelt.png"
                height={160}
                alt="Legendary Wormholes"
              />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>Asteroid Belt</Text>
              <Badge color="pink">Nucleum</Badge>
            </Group>

            <Text size="sm" c="dimmed" flex={1}>
              This map features a rich inner core that is surrounded by a 2nd
              ring asteroid belt.
            </Text>

            <Button fullWidth mt="md" radius="md">
              Load
            </Button>
          </Card>
        </SimpleGrid>
      </Box>
    </>
  );
}
