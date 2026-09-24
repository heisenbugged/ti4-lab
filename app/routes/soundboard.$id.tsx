import { LoaderFunctionArgs, redirect } from "react-router";

// Old shared session links (/soundboard/:id) now live at /voices/:id.
export function loader({ params }: LoaderFunctionArgs) {
  return redirect(`/voices/${params.id}`, 301);
}
