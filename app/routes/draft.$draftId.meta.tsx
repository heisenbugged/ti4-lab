import { LoaderFunctionArgs, json } from "@remix-run/node";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { Draft } from "~/types";

const R2_CDN_BASE_URL =
  process.env.R2_IMAGES_CDN_URL || "https://pub-placeholder.r2.dev";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const draftId = params.draftId;
  if (!draftId) {
    throw new Response("Draft ID required", { status: 400 });
  }

  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  const draft = JSON.parse(result.data as string) as Draft;

  // Format draft type display name
  const draftType = draft.settings?.type || "Unknown";
  const playerCount = draft.players?.length || 0;
  const draftTypeDisplay = formatDraftType(draftType, playerCount);

  const { getBaseUrl } = await import("~/env.server");
  const baseUrl = getBaseUrl();
  // Image URL (either from CDN or the .png route that will generate it)
  const imageUrl = result.imageUrl || `${baseUrl}/draft/${draftId}.png`;

  return json({
    title: `${draftId} - TI4 Lab`,
    description: `${draftTypeDisplay} on TI4 Lab`,
    image: imageUrl,
    url: `${baseUrl}/draft/${draftId}`,
    type: "website",
    siteName: "TI4 Lab",
  });
};

function formatDraftType(type: string, playerCount: number): string {
  const typeMap: Record<string, string> = {
    milty: "Milty Draft",
    miltyeq: "Milty Equidistant Draft",
    prechoice: "Pre-Choice Draft",
    raw: "Raw Draft",
  };

  const baseName = typeMap[type.replace(/\d+p$/, "")] || type;
  return `${baseName} (${playerCount} players)`;
}
