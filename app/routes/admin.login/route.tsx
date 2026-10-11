import { Button, Panel, Stack, TextInput } from "~/ui";
import {
  ActionFunctionArgs,
  data,
  Form,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import {
  checkAdminPassword,
  isAdmin,
  loginAdmin,
  safeAdminRedirect,
} from "~/utils/adminAuth.server";

export const meta: MetaFunction = () => [{ title: "Admin Login - TI4 Lab" }];

export async function loader({ request }: LoaderFunctionArgs) {
  if (await isAdmin(request)) {
    const url = new URL(request.url);
    throw redirect(safeAdminRedirect(url.searchParams.get("redirectTo")));
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const password = form.get("password")?.toString() ?? "";
  if (!checkAdminPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data({ error: "Wrong password" }, { status: 401 });
  }
  return loginAdmin(request, safeAdminRedirect(form.get("redirectTo")));
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  return (
    <div style={{ maxWidth: 360, margin: "64px auto", padding: "0 16px" }}>
      <Panel title="Admin login">
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? ""}
          />
          <Stack gap={3}>
            <TextInput
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              error={actionData?.error}
            />
            <Button type="submit" disabled={navigation.state !== "idle"}>
              Log in
            </Button>
          </Stack>
        </Form>
      </Panel>
    </div>
  );
}
