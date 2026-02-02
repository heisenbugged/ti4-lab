import { ActionFunctionArgs, data } from "react-router";
import {
  incrementPresetMapViews,
  presetMapById,
} from "~/drizzle/presetMap.server";

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  const id = params.id;
  if (!id) {
    return data({ success: false, error: "Map ID required" }, { status: 400 });
  }

  const preset = await presetMapById(id);
  if (!preset) {
    return data({ success: false, error: "Preset map not found" }, { status: 404 });
  }

  const views = await incrementPresetMapViews(id);

  return data({ success: true, views });
}
