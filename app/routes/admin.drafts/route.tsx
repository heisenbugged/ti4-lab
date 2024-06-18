import { Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { findDrafts } from "~/drizzle/draft.server";
import { Draft } from "~/types";

import classes from "~/components/Surface.module.css";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { FormEvent } from "react";

export default function AdminDraftsIndex() {
  const { drafts } = useLoaderData<{ drafts: SavedDraft[] }>();
  const submit = useSubmit();
  const totalDrafts = drafts.length;
  const completedDrafts = drafts.filter(
    (d) => d.data.selections.length === d.data.pickOrder.length,
  ).length;

  const totalNucleum = drafts.filter(
    (d) => d.data.settings.type === "heisen",
  ).length;

  const totalMilty = drafts.filter(
    (d) => d.data.settings.type === "milty",
  ).length;

  const totalMiltyEq = drafts.filter(
    (d) => d.data.settings.type === "miltyeq",
  ).length;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = confirm("Are you sure you want to delete this draft?");
    if (result) {
      submit(new FormData(e.currentTarget), { method: "delete" });
    }
  };

  return (
    <>
      <Title>Drafts Administration</Title>

      <Group p="lg" gap="xl">
        <Stack className={classes.surface} p="lg" align="center">
          <Title order={3}>Total</Title>
          <Text size="50px" fw="bold">
            {totalDrafts}
          </Text>
        </Stack>

        <Stack className={classes.surface} p="lg" align="center">
          <Title order={3}>Completed</Title>
          <Text size="50px" fw="bold" c="green">
            {completedDrafts}
          </Text>
        </Stack>

        <Stack className={classes.surface} p="lg" align="center">
          <Title order={3}>Nucleum</Title>
          <Text size="50px" fw="bold">
            {totalNucleum}
          </Text>
        </Stack>
        <Stack className={classes.surface} p="lg" align="center">
          <Title order={3}>Milty</Title>
          <Text size="50px" fw="bold">
            {totalMilty}
          </Text>
        </Stack>
        <Stack className={classes.surface} p="lg" align="center">
          <Title order={3}>Milty EQ</Title>
          <Text size="50px" fw="bold">
            {totalMiltyEq}
          </Text>
        </Stack>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Draft ID</Table.Th>
            <Table.Th>urlName</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Complete?</Table.Th>
            <Table.Th>Current Pick #</Table.Th>
            <Table.Th>Players</Table.Th>
            <Table.Th w="160px">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {drafts.map((d) => {
            const currentPick = d.data.selections.length;
            const isComplete = (
              d.data.selections.length === d.data.pickOrder.length
            ).toString();
            return (
              <Table.Tr key={d.id}>
                <Table.Td>{d.id}</Table.Td>
                <Table.Td>{d.urlName}</Table.Td>
                <Table.Td>{d.data.settings.type}</Table.Td>
                <Table.Td>{isComplete}</Table.Td>
                <Table.Td>{currentPick.toString()}</Table.Td>
                <Table.Td>
                  {d.data.players.map((p) => p.name).join(", ")}
                </Table.Td>
                <Table.Td>
                  <Group>
                    <Link to={`/draft/${d.urlName ?? d.id}`}>
                      <Button size="compact-sm">View</Button>
                    </Link>
                    <Form method="delete" onSubmit={handleSubmit}>
                      <input type="hidden" value={d.id} name="id" />
                      <Button
                        type="submit"
                        size="compact-sm"
                        color="red"
                        variant="filled"
                      >
                        Delete
                      </Button>
                    </Form>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const id = body.get("id")!;
  await db.delete(drafts).where(eq(drafts.id, id.toString()));
  return json({ ok: true });
}

export const loader = async () => {
  const drafts = await findDrafts();
  return json({
    drafts: drafts.map((d) => ({
      ...d,
      data: JSON.parse(d.data as string) as Draft,
    })),
  });
};

type SavedDraft = {
  id: string;
  data: Draft;
  urlName: string | null;
  createdAt: string;
  updatedAt: string;
};
