import { Faction } from "~/types";
import { IconEye, IconExternalLink } from "@tabler/icons-react";
import { Grid, IconButton, Modal, Stack, Text, useDisclosure } from "~/ui";
import { useDraft } from "~/draftStore";
import { mahactKingReferences } from "~/data/mahactKingReferences";
import { MahactKingReference } from "./MahactKingReference";
import classes from "./FactionHelpInfo.module.css";

type Props = {
  faction: Faction;
  /** Two small icon buttons, for tables. */
  compact?: boolean;
};

/** Info (faction card, monument) and Wiki links under a faction. */
export function FactionHelpInfo({ faction, compact = false }: Props) {
  const [opened, { open, close }] = useDisclosure();
  const showMonumentImagesInFactionInfo = useDraft(
    (state) => state.draft.settings.showMonumentImagesInFactionInfo,
  );
  const showMonumentImage =
    !!showMonumentImagesInFactionInfo && !!faction.monument;
  const kingReference = mahactKingReferences[faction.id];

  return (
    <>
      {compact ? (
        <span className={classes.compact}>
          <IconButton size="xs" label={`${faction.name} info`} onClick={open}>
            <IconEye />
          </IconButton>
          <IconButton size="xs" label={`${faction.name} wiki`} onClick={() => window.open(faction.wiki, "_blank")}>
            <IconExternalLink />
          </IconButton>
        </span>
      ) : (
        <div className={classes.links}>
          <button type="button" onClick={open}>
            <IconEye size={14} />
            Info
          </button>
          <button type="button" onClick={() => window.open(faction.wiki, "_blank")}>
            <IconExternalLink size={14} />
            Wiki
          </button>
        </div>
      )}
      <Modal
        opened={opened}
        onClose={close}
        size={kingReference || showMonumentImage ? "xl" : "lg"}
        title={kingReference ? `${faction.name} reference` : faction.name}
      >
        {kingReference ? (
          <MahactKingReference faction={faction} reference={kingReference} />
        ) : (
          <Grid cols={{ base: 1, md: showMonumentImage ? 2 : 1 }} gap={5}>
            <Stack gap={2}>
              <Text size="sm" weight={600}>
                Faction card
              </Text>
              <img
                className={classes.image}
                src={`/factioncards/${faction.id}.png`}
                alt={`${faction.name} faction card`}
              />
            </Stack>
            {showMonumentImage && (
              <Stack gap={2}>
                <Text size="sm" weight={600}>
                  Monument
                </Text>
                <img
                  className={classes.image}
                  src={faction.monument}
                  alt={`${faction.name} monument art`}
                />
              </Stack>
            )}
          </Grid>
        )}
      </Modal>
    </>
  );
}
