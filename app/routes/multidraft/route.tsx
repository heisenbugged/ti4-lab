import { Button, Group, useMantineColorScheme } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { MainAppShell } from "~/components/MainAppShell";
import {
  initializeMap,
  initializeSlices,
  randomizeFactions,
} from "~/draftStore";
import { createDraft } from "~/drizzle/draft.server";
import { createMultiDraft } from "~/drizzle/multiDraft.server";
import { fisherYatesShuffle } from "~/stats";
import { DiscordData, Draft, DraftSettings, FactionId, Player } from "~/types";
import { createDraftOrder } from "~/utils/draftOrder.server";

import { getFactionPool } from "~/utils/factions";
import { getSystemPool } from "~/utils/system";

const parseIfDefined = (v: unknown | null | undefined): unknown => {
  if (v === null || v === undefined || v === "") return undefined;
  return JSON.parse(v as string);
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const settings = parseIfDefined(
    formData.get("draftSettings"),
  ) as DraftSettings;
  const players = parseIfDefined(formData.get("players")) as Player[];
  const discordData = parseIfDefined(formData.get("discordData")) as
    | DiscordData
    | undefined;
  const numDrafts = parseInt(formData.get("numDrafts") as string);

  const draftUrlNames: string[] = [];
  for (let i = 0; i < numDrafts; i++) {
    const factionPool = getFactionPool(settings.factionGameSets);
    const systemPool = getSystemPool(settings.tileGameSets);

    const availableFactions = randomizeFactions(
      settings.numFactions,
      factionPool,
      null,
    );

    const numMinorFactions = settings.numMinorFactions;
    let availableMinorFactions: FactionId[] | undefined = undefined;
    if (numMinorFactions !== undefined) {
      const otherFactions = factionPool.filter(
        (f) => !availableFactions.includes(f),
      );
      availableMinorFactions = fisherYatesShuffle(
        otherFactions,
        numMinorFactions,
      );
    }

    const slices = initializeSlices(settings, systemPool);
    if (!slices) return;
    const presetMap = initializeMap(settings, slices, systemPool);

    const draft: Draft = {
      settings,
      integrations: { discord: discordData },
      availableFactions,
      availableMinorFactions,
      presetMap,
      slices,
      ...createDraftOrder(players, settings, availableFactions),
    };
    const { prettyUrl } = await createDraft(draft);
    draftUrlNames.push(prettyUrl);
  }

  const multiDraftUrlName = await createMultiDraft(draftUrlNames);

  return redirect(`/multidraft/${multiDraftUrlName}`);
}

export default function MultiDraft() {
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
        </Group>
      }
    >
      <Outlet />
    </MainAppShell>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Multidraft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};
