import { Button, Table, Title } from "@mantine/core";
import { TypedResponse, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { findDrafts } from "~/drizzle/draft.server";
import { PersistedDraft } from "~/types";

export default function AdminDraftsIndex() {
  const { drafts } = useLoaderData<{ drafts: SavedDraft[] }>();
  return (
    <>
      <Title>Drafts Administration</Title>

      <Table>
        <Table.Thead>
          <Table.Th>Draft ID</Table.Th>
          <Table.Th>urlName</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Complete?</Table.Th>
          <Table.Th>Current Pick #</Table.Th>
          <Table.Th>Players</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Thead>
        <Table.Tbody>
          {drafts.map((d) => {
            const isComplete = (
              d.data.currentPick === d.data.pickOrder.length
            ).toString();
            return (
              <Table.Tr>
                <Table.Td>{d.id}</Table.Td>
                <Table.Td>{d.urlName}</Table.Td>
                <Table.Td>{d.data.mapType}</Table.Td>
                <Table.Td>{isComplete}</Table.Td>
                <Table.Td>{d.data.currentPick.toString()}</Table.Td>
                <Table.Td>
                  {d.data.players.map((p) => p.name).join(", ")}
                </Table.Td>
                <Table.Td>
                  <Link to={`/draft/${d.urlName}`}>
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
      data: JSON.parse(d.data as string) as PersistedDraft,
    })),
  });
};

// TODO: Rename to PersistedDraft or just 'Draft'
// and then call data: 'PersistedDraftData' or just 'DraftData'
type SavedDraft = {
  id: string;
  data: PersistedDraft;
  urlName: string | null;
  createdAt: string;
  updatedAt: string;
};
