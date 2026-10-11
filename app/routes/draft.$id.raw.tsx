import { type LoaderFunctionArgs } from "react-router";
import { loadDraftByUrlParam } from "~/utils/draftRedirect.server";

// Public JSON export of a draft, for tournament tooling and other scripts.
// It's the same data the draft page already loads.
export async function loader({ params }: LoaderFunctionArgs) {
  const result = await loadDraftByUrlParam(params.id!, "/raw");

  return new Response(JSON.stringify(result.data), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
