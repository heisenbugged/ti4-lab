import { ActionFunctionArgs, data } from "react-router";
import { likePresetMap, presetMapById } from "~/drizzle/presetMap.server";

function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

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

  const ip = getRequestIp(request);
  const result = await likePresetMap(id, ip);

  return data({ success: true, likes: result.likes, liked: result.liked });
}
