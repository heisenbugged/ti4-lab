import { useFetcher } from "@remix-run/react";
import { Draft } from "~/types";

export type DraftInput = Omit<Draft, "pickOrder">;

export function useCreateDraft() {
  const fetcher = useFetcher();
  return (input: DraftInput) => {
    fetcher.submit(input, {
      method: "POST",
      encType: "application/json",
      action: "/draft/new",
    });
  };
}
