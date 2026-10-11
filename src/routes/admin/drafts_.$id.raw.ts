import { createFileRoute } from "@tanstack/react-router";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { isAdmin } from "~/utils/adminAuth.server";

export const Route = createFileRoute("/admin/drafts_/$id/raw")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (!(await isAdmin())) {
          const { pathname, search } = new URL(request.url);
          const redirectTo = encodeURIComponent(pathname + search);
          return new Response(null, {
            status: 302,
            headers: { Location: `/admin/login?redirectTo=${redirectTo}` },
          });
        }

        const draft = await draftByPrettyUrl(params.id);
        if (!draft) return new Response("Not Found", { status: 404 });

        return new Response(draft.data as string, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": "inline",
          },
        });
      },
    },
  },
});
