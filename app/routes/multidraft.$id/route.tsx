import { Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SectionTitle } from "~/components/Section";
import { draftById, draftByPrettyUrl } from "~/drizzle/draft.server";

import {
  multiDraftById,
  multiDraftByPrettyUrl,
} from "~/drizzle/multiDraft.server";
import { NewDraftFaction } from "../draft.new/components/NewDraftFaction";
import { Draft } from "~/types";
import { factions } from "~/data/factionData";
import { BaseSlice } from "~/components/Slice";
import { draftConfig } from "~/draft";

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

  return json({ multidraft, drafts });
}

export default function MultidraftRoute() {
  const { multidraft, drafts } = useLoaderData<typeof loader>();
  console.log(drafts);
  return (
    <Stack p="lg" gap={50}>
      {drafts.map(({ draft, urlName }) => {
        if (draft.data == null) return null;
        const data: Draft = JSON.parse(draft.data as string);
        return (
          <Stack>
            <a href={`/draft/${urlName}`}>
              <SectionTitle title={urlName} />
            </a>
            <Text ff="mono" fw={700}>
              Factions
            </Text>
            <Group>
              {data.availableFactions.map((faction) => {
                return (
                  <NewDraftFaction key={faction} faction={factions[faction]} />
                );
              })}
            </Group>

            <Text ff="mono" fw={700}>
              Slices
            </Text>
            <SimpleGrid
              flex={1}
              cols={{ base: 1, sm: 2, md: 3, lg: 6, xxl: 6 }}
              spacing="lg"
              style={{ alignItems: "flex-start" }}
            >
              {data.slices.map((slice, idx) => (
                <div style={{ position: "relative" }}>
                  <BaseSlice
                    id={`${urlName}-${idx}`}
                    slice={slice}
                    mapModifiable={false}
                    config={draftConfig[data.settings.type]}
                  />
                </div>
              ))}
            </SimpleGrid>
          </Stack>
        );
      })}
    </Stack>
  );
}
