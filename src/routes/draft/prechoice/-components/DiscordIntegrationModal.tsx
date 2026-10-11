import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { ButtonAnchor, Code, Modal, Stack, Steps, Text } from "~/ui";
import classes from "./DiscordIntegrationModal.module.css";

type Props = {
  opened: boolean;
  discordOauthUrl: string;
  onClose: () => void;
};

export function DiscordIntegrationModal({
  opened,
  discordOauthUrl,
  onClose,
}: Props) {
  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={onClose}
      title="Integrate with Discord"
    >
      <Stack gap={5}>
        <Stack gap={2}>
          <Text>
            The TI4 Lab robot will notify players via the chosen channel when
            it is their turn to draft.
          </Text>
          <Text size="sm" tone="muted">
            Any players that you <Code>@mention</Code> during{" "}
            <Code>/labdraft</Code> will be mentioned in the notification when
            it&apos;s their turn.
          </Text>
        </Stack>

        <Steps
          active={0}
          items={[
            {
              title: "Add the Discord bot to your server",
              content: (
                <ButtonAnchor
                  href={discordOauthUrl}
                  variant="discord"
                  size="sm"
                  icon={<IconBrandDiscordFilled size={16} />}
                  className={classes.authorize}
                >
                  Authorize
                </ButtonAnchor>
              ),
            },
            {
              title: "Start a draft via /labdraft",
              content: (
                <img
                  className={classes.shot}
                  src="/discorddraft.png"
                  alt="The /labdraft command in Discord"
                />
              ),
            },
            {
              title: "Set up the draft on TI4 Lab",
              content: (
                <>
                  <Text size="sm" tone="muted">
                    Follow the created draft link.
                  </Text>
                  <img
                    className={classes.shot}
                    src="/discorddraftresponse.png"
                    alt="The bot's reply with a draft link"
                  />
                </>
              ),
            },
          ]}
        />
      </Stack>
    </Modal>
  );
}
