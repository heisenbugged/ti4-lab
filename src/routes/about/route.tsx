import { createFileRoute } from "@tanstack/react-router";
import { ButtonAnchor, Heading, Row, Text } from "~/ui";
import styles from "./styles.module.css";
import {
  IconBrandGithub,
  IconMail,
  IconBrandDiscordFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import { HeaderControls } from "~/components/HeaderControls";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const [accessibleColors, setAccessibleColors] = useState(false);

  return (
    <MainAppShell
      headerRightSection={
        <HeaderControls
          accessibleColors={accessibleColors}
          onAccessibleColorsChange={setAccessibleColors}
        />
      }
    >
      <div className={styles.about}>
        <div className={styles.copy}>
          <Heading variant="title" as="h1">
            About TI4 Lab
          </Heading>
          <Text>
            Hi, I&apos;m James. I&apos;ve been playing Twilight Imperium for a
            few years now, and have fallen absolutely in love with this game.
            TI4 Lab was ultimately born out of a desire to try different,
            off-the-beaten-path draft formats in our in-person group. After
            running these with an excel spreadsheet, and realizing the potential
            for a better tool, TI4 Lab was born.
          </Text>
          <Text>
            There are a lot of excellent tools out there already, but none that
            quite met all my desires. I&apos;ve decided to try and change that
            with TI4 Lab. The goal of this tool is to provide automation for
            every imaginable draft format, and make it easy to host and play, be
            it online or in person.
          </Text>
          <Text tone="muted">
            I hope this tool brings you as much joy as building it brought me.
          </Text>
          <Text tone="muted">
            If you have any questions, comments, or suggestions, please reach
            out!
          </Text>
          <Row gap={2} className={styles.links}>
            <ButtonAnchor
              icon={<IconBrandGithub size={18} />}
              href="https://github.com/heisenbugged/ti4-lab"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </ButtonAnchor>
            <ButtonAnchor
              icon={<IconBrandDiscordFilled size={18} />}
              href="https://discord.gg/2ezSTQpAVC"
              target="_blank"
              rel="noreferrer"
              variant="discord"
            >
              Discord
            </ButtonAnchor>
            <ButtonAnchor
              variant="tertiary"
              icon={<IconMail size={18} />}
              href="mailto:james@thestrongfamily.org"
            >
              Contact me
            </ButtonAnchor>
          </Row>
        </div>
        <div className={styles.photos}>
          <Text size="sm" weight={600} tone="muted">
            Some of our in-person games
          </Text>
          <img src="/ourgame.jpg" alt="An in-person TI4 game on a table" />
          <img src="/ourgame2.jpg" alt="Another in-person TI4 game" />
        </div>
      </div>
    </MainAppShell>
  );
}
