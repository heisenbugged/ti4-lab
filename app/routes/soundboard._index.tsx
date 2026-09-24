import { LoaderFunctionArgs, redirect } from "react-router";

// /soundboard was renamed to /voices; keep old links working.
export function loader({ request }: LoaderFunctionArgs) {
  const { search } = new URL(request.url);
  return redirect(`/voices${search}`, 301);
}
