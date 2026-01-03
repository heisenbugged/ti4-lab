import { data, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { generateDraftImage } from "~/skiaRendering/imageGenerator.server";

export default function SkiaImagePage() {
  const { imageDataUrl } = useLoaderData<typeof loader>();
  return (
    <div
      style={{ padding: 20, backgroundColor: "#1a1b1e", minHeight: "100vh" }}
    >
      <img
        src={imageDataUrl}
        alt="Draft map"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const draftId = params.draftId;
  if (!draftId) {
    throw new Response("Draft ID required", { status: 400 });
  }

  const result = await draftByPrettyUrl(draftId);
  const draft = JSON.parse(result.data as string) as Draft;

  const imageDataUrl = await generateDraftImage(draft, draftId);

  return data({ imageDataUrl });
};
