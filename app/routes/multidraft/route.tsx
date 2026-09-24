import { Button, Group, useMantineColorScheme } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "react-router";
import { Outlet, redirect } from "react-router";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { MainAppShell } from "~/components/MainAppShell";
import { createDraft } from "~/drizzle/draft.server";
import { createMultiDraft } from "~/drizzle/multiDraft.server";
import { buildInitialDraft } from "~/draft/buildInitialDraft";
import { DiscordData, Draft, DraftSettings, Player } from "~/types";
import { createDraftOrder } from "~/utils/draftOrder.server";

const MIN_DRAFTS = 2;
const MAX_DRAFTS = 9;

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
  const requestedDrafts = parseInt(formData.get("numDrafts") as string);
  const numDrafts = Math.min(
    MAX_DRAFTS,
    Math.max(MIN_DRAFTS, isNaN(requestedDrafts) ? MIN_DRAFTS : requestedDrafts),
  );

  const drafts: Draft[] = [];
  for (let i = 0; i < numDrafts; i++) {
    const initial = buildInitialDraft(settings, players, {
      discord: discordData,
    });
    if (!initial) {
      throw new Response(
        "Could not generate a valid map with the given settings.",
        { status: 422 },
      );
    }
    drafts.push({
      ...initial,
      ...createDraftOrder({
        players,
        settings,
        availableFactions: initial.availableFactions,
        presetMap: initial.presetMap,
        texasDraft: initial.texasDraft,
      }),
    });
  }

  const draftUrlNames: string[] = [];
  for (const draft of drafts) {
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
