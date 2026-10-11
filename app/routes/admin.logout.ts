import { ActionFunctionArgs } from "react-router";
import { logoutAdmin } from "~/utils/adminAuth.server";

export async function action({ request }: ActionFunctionArgs) {
  return logoutAdmin(request);
}
