import { Text } from "@mantine/core";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Logo } from "~/components/Logo";
import { RawMap } from "~/components/Map";
import { useDraft } from "~/draftStore";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { Draft } from "~/types";

export default function MapImage() {
  const result = useLoaderData<typeof loader>();
  const draft = result.data;
  const draftStore = useDraft();
  const { hydratedMap } = useHydratedDraft();
  useEffect(() => {
    draftStore.draftActions.hydrate(result.id, result.urlName!, draft);
  }, []);

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
        <RawMap mapId="mapImage" map={hydratedMap} width={900} height={900} />
      </div>
      <div style={{ bottom: 12, right: 12, position: "absolute" }}>
        <Text c="white">tidraft.com/draft/{result.draftId}</Text>
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
