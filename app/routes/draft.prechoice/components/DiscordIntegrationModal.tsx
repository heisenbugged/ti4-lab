import { Button, Group, Image, Modal, Stack, Stepper, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

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
      title={
        <Group>
          <IconBrandDiscordFilled />
          <Text>Integrate with Discord</Text>
        </Group>
      }
    >
      <Stack mb="lg" gap="xs">
        <Text>
          The TI4 Lab robot will notify players via the chosen channel when it
          is their turn to draft.
        </Text>
        <Text c="dimmed" size="sm">
          NOTE: Any players that you <code>@mention</code> during{" "}
          <code>/labdraft</code> will be mentioned in the notification when
          it&apos;s their turn.
        </Text>
      </Stack>

      <Stepper orientation="vertical" active={0}>
        <Stepper.Step
          label="Add the discord bot to your server"
          description={
            <Link to={discordOauthUrl} reloadDocument>
              <Button
                mt={4}
                size="sm"
                leftSection={<IconBrandDiscordFilled />}
                variant="filled"
                color="discordBlue.5"
              >
                Authorize
              </Button>
            </Link>
          }
        />
        <Stepper.Step
          label="Start a draft via /labdraft"
          description={<Image src="/discorddraft.png" />}
        />
        <Stepper.Step
          label="Setup draft on TI4 Lab"
          description={
            <Stack>
              <Text>Follow the created draft link.</Text>
              <Image src="/discorddraftresponse.png" />
            </Stack>
          }
          mt="lg"
        />
      </Stepper>
    </Modal>
  );
}
