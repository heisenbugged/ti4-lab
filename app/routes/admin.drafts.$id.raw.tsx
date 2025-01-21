import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { draftById, draftByPrettyUrl } from "~/drizzle/draft.server";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Response("Draft ID is required", { status: 400 });
  }

  const draft = await draftByPrettyUrl(params.id);
  if (!draft) {
    throw new Response("Not Found", { status: 404 });
  }

  // Send raw JSON data with appropriate headers
  return new Response(draft.data as string, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "inline",
    },
  });
}
