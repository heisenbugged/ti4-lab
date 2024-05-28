import { LoaderFunction, redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => {
  return redirect("/draft/new");
};

export default function DraftPrechoice() {
  return null;
}
