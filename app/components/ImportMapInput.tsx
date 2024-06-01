import { Button, Group, Input } from "@mantine/core";
import { useState } from "react";

type Props = {
  onImport: (importableMap: string) => void;
};

export function ImportMapInput({ onImport }: Props) {
  const [importableMap, setImportableMap] = useState<string>("");
  return (
    <Group align="flex-end">
      <Input.Wrapper
        size="md"
        label="Map String"
        description="Copy paste in a map string, and we will populate the relevant slices. Alternatively, you can click on a tile to add a system to either a map or a slice."
        flex={1}
      >
        <Input
          size="md"
          placeholder="Map String to Import"
          onChange={(e) => setImportableMap(e.currentTarget.value)}
        />
      </Input.Wrapper>
      <Button mb={3} onClick={() => onImport(importableMap)}>
        Import
      </Button>
    </Group>
  );
}
