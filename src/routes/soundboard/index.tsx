import { createFileRoute, redirect } from "@tanstack/react-router";

// /soundboard was renamed to /voices; keep old links working.
export const Route = createFileRoute("/soundboard/")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/voices", search, statusCode: 301 });
  },
});
