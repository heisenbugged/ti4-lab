import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createDraft, type DraftInput } from "~/server/drafts.functions";

export type { DraftInput };

/** Persists a new draft, then opens it. */
export function useCreateDraft() {
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: (input: DraftInput) => createDraft({ data: input }),
    onSuccess: ({ prettyUrl }) =>
      navigate({ to: "/draft/$id", params: { id: prettyUrl } }),
  });
  return mutate;
}
