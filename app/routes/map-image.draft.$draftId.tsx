import { Text } from "@mantine/core";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Logo } from "~/components/Logo";
import { RawMap } from "~/components/Map";
import { draftConfig } from "~/draft";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import {
  computePlayerSelections,
  hydratePlayers,
} from "~/hooks/useHydratedDraft";
import { Draft } from "~/types";
import { hydrateMap } from "~/utils/map";

export default function MapImage() {
  const result = useLoaderData<typeof loader>();
  const draft = result.data;
  const config = draftConfig[draft.settings.type];
  const hydratedPlayers = hydratePlayers(draft.players, draft.selections);
  const selections = computePlayerSelections(hydratedPlayers);
  const map = hydrateMap(config, draft.presetMap, draft.slices, selections);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url(/tilebg.jpg)",
        backgroundSize: "1024px 1024px",
      }}
    >
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <Logo />
      </div>
      <div style={{ top: 45 + 20, left: 60, position: "relative" }}>
        <RawMap mapId="mapImage" map={map} width={900} height={900} />
      </div>
      <div style={{ bottom: 12, right: 12, position: "absolute" }}>
        <Text c="white">ti4-lab.fly.dev/draft/{result.draftId}</Text>
      </div>
    </div>
  );
}

export const loader = async ({ params }: { params: { draftId: string } }) => {
  const draftId = params.draftId;
  const result = await draftByPrettyUrl(draftId);
  return json({
    ...result,
    draftId,
    data: JSON.parse(result.data as string) as Draft,
  });
};
