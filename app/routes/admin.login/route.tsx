import { IconShieldLock } from "@tabler/icons-react";
import { Button, Heading, Panel, Stack, Text, TextInput } from "~/ui";
import classes from "./styles.module.css";
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
    return data({ error: "That password isn't right. Try again." }, { status: 401 });
  }
  return loginAdmin(request, safeAdminRedirect(form.get("redirectTo")));
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  return (
    <div className={classes.wrap}>
      <Panel className={classes.panel}>
        <div className={classes.head}>
          <span className={classes.icon}>
            <IconShieldLock size={20} />
          </span>
          <div>
            <Heading variant="section">Admin</Heading>
            <Text size="sm" tone="muted">
              Enter the admin password to manage drafts and community maps.
            </Text>
          </div>
        </div>
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
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              required
              error={actionData?.error}
            />
            <Button
              type="submit"
              variant="primary"
              block
              loading={navigation.state !== "idle"}
            >
              Log in
            </Button>
          </Stack>
        </Form>
      </Panel>
    </div>
  );
}
