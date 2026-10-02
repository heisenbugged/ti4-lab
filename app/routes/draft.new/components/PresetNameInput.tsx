import { TextInput } from "@mantine/core";
import { useState } from "react";
import {
  finalizeDraftPresetName,
  sanitizeDraftPresetName,
} from "~/utils/draftPresetName";

export function usePresetName() {
  const [value, setValue] = useState("");
  const name = finalizeDraftPresetName(value);
  return { value, setValue, name, isValid: name.length > 0 };
}

type Props = {
  preset: ReturnType<typeof usePresetName>;
  onSubmit: () => void;
  description?: string;
  placeholder?: string;
};

/** Text input that keeps the typed value sanitized and submits on Enter. */
export function PresetNameInput({
  preset,
  onSubmit,
  description,
  placeholder,
}: Props) {
  return (
    <TextInput
      label="Preset name"
      description={description}
      placeholder={placeholder}
      value={preset.value}
      onChange={(e) =>
        preset.setValue(sanitizeDraftPresetName(e.currentTarget.value))
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
      }}
      data-autofocus
    />
  );
}
