import {
  Button,
  Group,
  Switch,
  useMantineColorScheme,
  Container,
  Grid,
  Text,
  Stack,
  Image,
} from "@mantine/core";
import {
  IconMoon,
  IconSun,
  IconBrandGithub,
  IconMail,
} from "@tabler/icons-react";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";

function About() {
  const [accessibleColors, setAccessibleColors] = useState(false);
  const { setColorScheme } = useMantineColorScheme();

  return (
    <MainAppShell
      headerRightSection={
        <Group>
          <Button
            variant="light"
            color="gray"
            onMouseDown={() => setColorScheme("dark")}
            size="compact-xs"
            darkHidden
          >
            <IconMoon />
          </Button>
          <Button
            variant="light"
            color="gray"
            onMouseDown={() => setColorScheme("light")}
            lightHidden
            size="compact-xs"
          >
            <IconSun />
          </Button>
          <Switch
            label="A11Y"
            checked={accessibleColors}
            onChange={(e) => {
              setAccessibleColors(e.currentTarget.checked);
            }}
          />
        </Group>
      }
    >
      <Container size="lg" py="xl">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <Text size="xl" fw={700}>
                About TI4 Lab
              </Text>
              <Text>
                Hi, I'm James. I've been playing Twilight Imperium for a few
                years now, and have fallen absolutely in love with this game.
                TI4 Lab was ultimately born out of a desire to try different,
                off-the-beaten-path draft formats in our in-person group. After
                running these with an excel spreadsheet, and realizing the
                potential for a better tool, TI4 Lab was born.
              </Text>
              <Text>
                There are a lot of excellent tools out there already, but none
                that quite met all my desires. I've decided to try and change
                that with TI4 Lab. The goal of this tool is to provide
                automation for every imaginable draft format, and make it easy
                to host and play, be it online or in person.
              </Text>
              <Text>
                I hope this tool brings you as much joy as building it brought
                me.
              </Text>
              <Text>
                If you have any questions, comments, or suggestions, please
                reach out!
              </Text>
            </Stack>
            <Group mt="xl">
              <Button
                leftSection={<IconBrandGithub size={18} />}
                component="a"
                href="https://github.com/heisenbugged/ti4-lab"
                target="_blank"
              >
                GitHub
              </Button>
              <Button
                leftSection={<IconMail size={18} />}
                component="a"
                href="mailto:james@thestrongfamily.org"
              >
                Contact Me
              </Button>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <Text size="lg" fw={600}>
                Some of our in person games
              </Text>
              <Image src="/ourgame.jpg" alt="Our game" radius="md" />
              <Image src="/ourgame2.jpg" alt="Our game" radius="md" />
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </MainAppShell>
  );
}

export default About;
