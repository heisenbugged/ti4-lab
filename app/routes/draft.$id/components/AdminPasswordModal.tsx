import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useState } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

export function AdminPasswordModal({ opened, onClose, onSubmit }: Props) {
  const [password, setPassword] = useState("");

  return (
    <Modal opened={opened} onClose={onClose} title="Enter Admin Password">
      <Stack>
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter password"
        />
        <Button
          onClick={() => {
            onSubmit(password);
            setPassword("");
          }}
        >
          Submit
        </Button>
      </Stack>
    </Modal>
  );
}
