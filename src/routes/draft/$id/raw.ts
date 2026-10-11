import { createFileRoute } from "@tanstack/react-router";
import { validate as validateUUID } from "uuid";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { prettyUrlForDraftId } from "~/utils/draftRedirect.server";

// Public JSON export of a draft, for tournament tooling and other scripts.
// It's the same data the draft page already loads.
export const Route = createFileRoute("/draft/$id/raw")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (validateUUID(params.id)) {
          const urlName = await prettyUrlForDraftId(params.id);
          if (!urlName) return new Response("Not Found", { status: 404 });
          return new Response(null, {
            status: 302,
            headers: { Location: `/draft/${urlName}/raw` },
          });
        }

        const draft = await draftByPrettyUrl(params.id);
        if (!draft) return new Response("Not Found", { status: 404 });

        return new Response(draft.data as string, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": "inline",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
