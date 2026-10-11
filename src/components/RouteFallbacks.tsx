import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { MainAppShell } from "~/components/MainAppShell";
import { Button, ButtonLink, Heading, Row, Stack, Text } from "~/ui";

export function NotFoundPage() {
  return (
    <MainAppShell>
      <Stack gap={3} align="start">
        <Heading variant="title">Not found</Heading>
        <Text tone="muted">That page, draft or map doesn&apos;t exist (or no longer does).</Text>
        <ButtonLink to="/draft/prechoice">Start a draft</ButtonLink>
      </Stack>
    </MainAppShell>
  );
}

export function ErrorPage({ error }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <MainAppShell>
      <Stack gap={3} align="start">
        <Heading variant="title">Something went wrong</Heading>
        <Text tone="muted">{error instanceof Error ? error.message : String(error)}</Text>
        <Row gap={2}>
          {/* Invalidate re-runs the loaders and resets the boundary. */}
          <Button onClick={() => router.invalidate()}>Try again</Button>
          <ButtonLink to="/" variant="tertiary">
            Home
          </ButtonLink>
        </Row>
      </Stack>
    </MainAppShell>
  );
}
