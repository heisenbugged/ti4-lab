import { useFetcher } from "react-router";
import { Draft } from "~/types";

export type DraftInput = Omit<Draft, "pickOrder"> & {
  presetUrl?: string;
};

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
