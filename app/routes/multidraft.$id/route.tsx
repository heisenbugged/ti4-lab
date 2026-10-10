import { LoaderFunctionArgs, data } from "react-router";
import { useLoaderData } from "react-router";
import { IconExternalLink } from "@tabler/icons-react";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { multiDraftByPrettyUrl } from "~/drizzle/multiDraft.server";
import { NewDraftFaction } from "../draft.new/components/NewDraftFaction";
import { Draft } from "~/types";
import { factions } from "~/data/factionData";
import { BaseSlice } from "~/components/Slice";
import { draftConfig } from "~/draft";
import { ButtonAnchor, Heading, Panel, Text } from "~/ui";
import classes from "./multidraft.module.css";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });
  const multidraft = await multiDraftByPrettyUrl(id);
  if (!multidraft) throw new Response("Not Found", { status: 404 });

  const urlNames = multidraft.draftUrlNames?.split(",") || [];

  const draftPromises = urlNames.map(async (urlName) => {
    const draft = await draftByPrettyUrl(urlName);
    return { urlName, draft };
  });

  const drafts = await Promise.all(draftPromises);

  return data({ multidraft, drafts });
}

export default function MultidraftRoute() {
  const { drafts } = useLoaderData<typeof loader>();
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
      {drafts.map(({ draft, urlName }) => {
        if (draft?.data == null) return null;
        const data: Draft = JSON.parse(draft.data as string);
        return (
          <Panel
            key={urlName}
            title={<span className={classes.draftName}>{urlName}</span>}
            action={
              <ButtonAnchor
                href={`/draft/${urlName}`}
                size="sm"
                variant="tertiary"
                iconRight={<IconExternalLink />}
              >
                Open draft
              </ButtonAnchor>
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
