import { Button, Group, Table, Text } from "@mantine/core";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { findDrafts } from "~/drizzle/draft.server";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { FormEvent } from "react";

export default function AdminDraftsIndex() {
  const { drafts, totalPages, currentPage } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const submit = useSubmit();
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = confirm("Are you sure you want to delete this draft?");
    if (result) {
      submit(new FormData(e.currentTarget), { method: "delete" });
    }
  };

  return (
    <>
      <Group mt="md" mb="md" justify="end">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          variant="default"
          size="compact-sm"
        >
          Previous
        </Button>

        <Text>
          Page {currentPage} of {totalPages}
        </Text>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="default"
          size="compact-sm"
        >
          Next
        </Button>
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
            <Table.Th w="190px">Actions</Table.Th>
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
                  <Group gap={4}>
                    <Link to={`/draft/${d.urlName ?? d.id}`}>
                      <Button size="compact-sm">View</Button>
                    </Link>
                    <a href={`/admin/drafts/${d.urlName ?? d.id}/raw`}>
                      <Button size="compact-sm" variant="filled" color="gray">
                        Data
                      </Button>
                    </a>
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const draftsData = await findDrafts(page);
  return json(draftsData);
};
