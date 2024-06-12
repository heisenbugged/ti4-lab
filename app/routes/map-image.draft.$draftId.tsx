import { Text } from "@mantine/core";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Logo } from "~/components/Logo";
import { Map, RawMap } from "~/components/Map";
import { mapStringOrder } from "~/data/mapStringOrder";
import { draftConfig } from "~/draft";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { PersistedDraft } from "~/types";
import { hydrateMapOld, parseMapString } from "~/utils/map";

export default function MapImage() {
  const result = useLoaderData<typeof loader>();
  const draft = result.data;
  const config = draftConfig[draft.mapType];
  const rawMapString = draft.mapString.split(" ");
  const mapString = parseMapString(
    config,
    rawMapString,
    mapStringOrder,
    rawMapString[0] !== "18",
  );

  const map = hydrateMapOld(config, mapString, draft.players, draft.slices);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        // make a background image that repeates from /tilebg.png
        backgroundImage: "url(/tilebg.jpg)",
        // but actually tile it
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
    data: JSON.parse(result.data as string) as PersistedDraft,
  });
};
