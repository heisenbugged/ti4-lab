import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { MainAppShell } from "~/components/MainAppShell";

export async function loader({ request }: LoaderFunctionArgs) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    throw new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");

  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "admin";

  if (username !== validUsername || password !== validPassword) {
    throw new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  return json({ authorized: true });
}

export default function AdminLayout() {
  return (
    <MainAppShell>
      <Outlet />
    </MainAppShell>
  );
}
