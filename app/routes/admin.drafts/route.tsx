import { Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { findDrafts } from "~/drizzle/draft.server";
import { Draft } from "~/types";

import classes from "~/components/Surface.module.css";

export default function AdminDraftsIndex() {
  const { drafts } = useLoaderData<{ drafts: SavedDraft[] }>();
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
            <Table.Th>Actions</Table.Th>
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
                  <Link to={`/draft/${d.urlName ?? d.id}`}>
                    <Button size="compact-md">View</Button>
                  </Link>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </>
  );
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
