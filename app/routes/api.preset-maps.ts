import { ActionFunctionArgs, data } from "react-router";
import { createPresetMap } from "~/drizzle/presetMap.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    author?: string;
    mapString?: string;
    mapConfigId?: string;
  };

  const name = body.name?.trim();
  const description = body.description?.trim();
  const author = body.author?.trim();
  const mapString = body.mapString?.trim();
  const mapConfigId = body.mapConfigId?.trim();

  if (!name || !description || !author || !mapString || !mapConfigId) {
    return data(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  const preset = await createPresetMap({
    name,
    description,
    author,
    mapString,
    mapConfigId,
  });

  return data({ success: true, id: preset.id, slug: preset.slug });
}
