import { Faction } from "~/types";
import { useDisclosure } from "@mantine/hooks";
import { Button, Modal } from "@mantine/core";
import { IconEye, IconLink } from "@tabler/icons-react";

type Props = {
  faction: Faction;
};

export function FactionHelpInfo({ faction }: Props) {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <Button.Group>
        <Button
          size="xs"
          variant="subtle"
          flex={1}
          style={{ borderRadius: 0 }}
          leftSection={<IconEye size={14} />}
          color="gray"
          onMouseDown={open}
        >
          Info
        </Button>
        <Button
          size="xs"
          variant="subtle"
          flex={1}
          style={{ borderRadius: 0 }}
          leftSection={<IconLink size={14} />}
          color="gray"
          onClick={() => {
            window.open(faction.wiki, "_blank");
          }}
        >
          Wiki
        </Button>
      </Button.Group>
      <Modal
        opened={opened}
        onClose={close}
        size="100%"
        title={faction.name}
        centered
      >
        <img
          src={`/factioncards/${faction.id}.png`}
          style={{
            objectFit: "contain",
            maxHeight: 500,
            maxWidth: "100%",
            margin: "auto",
            display: "block",
          }}
        />
      </Modal>
    </>
  );
}
