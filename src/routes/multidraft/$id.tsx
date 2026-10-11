import { createFileRoute } from "@tanstack/react-router";
import { IconExternalLink } from "@tabler/icons-react";
import { getMultiDraft } from "~/server/drafts.functions";
import { NewDraftFaction } from "../draft/new/-components/NewDraftFaction";
import { factions } from "~/data/factionData";
import { BaseSlice } from "~/components/Slice";
import { draftConfig } from "~/draft";
import { ButtonLink, Heading, Panel, Text } from "~/ui";
import classes from "./multidraft.module.css";

export const Route = createFileRoute("/multidraft/$id")({
  loader: ({ params }) => getMultiDraft({ data: params.id }),
  component: MultidraftRoute,
});

function MultidraftRoute() {
  const { drafts } = Route.useLoaderData();
  return (
    <div className={classes.page}>
      <header className={classes.head}>
        <Heading variant="title" as="h1">
          Multidraft
        </Heading>
        <Text size="sm" tone="muted">
          {drafts.length} drafts
        </Text>
      </header>
      {drafts.map(({ draft: data, urlName }) => {
        if (!data) return null;
        return (
          <Panel
            key={urlName}
            title={<span className={classes.draftName}>{urlName}</span>}
            action={
              <ButtonLink
                to="/draft/$id"
                params={{ id: urlName }}
                size="sm"
                variant="tertiary"
                iconRight={<IconExternalLink />}
              >
                Open draft
              </ButtonLink>
            }
          >
            <div className={classes.body}>
              <div className={classes.group}>
                <Text size="sm" weight={600} tone="muted">
                  Factions
                </Text>
                <div className={classes.factions}>
                  {data.availableFactions.map((faction) => (
                    <NewDraftFaction
                      key={faction}
                      faction={factions[faction]}
                      compact
                    />
                  ))}
                </div>
              </div>

              <div className={classes.group}>
                <Text size="sm" weight={600} tone="muted">
                  Slices
                </Text>
                <div className={classes.slices}>
                  {data.slices.map((slice, idx) => (
                    <div key={`${urlName}-${idx}`} className={classes.slice}>
                      <BaseSlice
                        id={`${urlName}-${idx}`}
                        slice={slice}
                        mapModifiable={false}
                        config={draftConfig[data.settings.type]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
