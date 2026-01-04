import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MapGenerator from "~/mapgen/components/MapGenerator";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getBaseUrl } = await import("~/env.server");
  return json({ baseUrl: getBaseUrl() });
};

export default function MapGeneratorRoute() {
  const { baseUrl } = useLoaderData<typeof loader>();
  return <MapGenerator baseUrl={baseUrl} />;
}
