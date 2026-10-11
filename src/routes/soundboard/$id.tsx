import { createFileRoute, redirect } from "@tanstack/react-router";

// Old shared session links (/soundboard/:id) now live at /voices/:id.
export const Route = createFileRoute("/soundboard/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/voices/$id", params, statusCode: 301 });
  },
});
