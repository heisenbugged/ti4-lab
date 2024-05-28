import { Button, Group, Input, Text } from "@mantine/core";
import { useState } from "react";

type Props = {
  onImport: (importableMap: string) => void;
};

export function ImportMapInput({ onImport }: Props) {
  const [importableMap, setImportableMap] = useState<string>("");
  return (
    <Group align="flex-end">
      <Input.Wrapper
        label="Map String"
        description="Copy paste in a map string, and we will populate the relevant slices. Alternatively, you can click on a tile to add a system to either a map or a slice."
      >
        <Input
          flex={1}
          size="md"
          placeholder="Map String to Import"
          onChange={(e) => setImportableMap(e.currentTarget.value)}
        />
      </Input.Wrapper>
      <Button
        onClick={() => {
          onImport(importableMap);
        }}
      >
        Import
      </Button>
    </Group>
  );
}
