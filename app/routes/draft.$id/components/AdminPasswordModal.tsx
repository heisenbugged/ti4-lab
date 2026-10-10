import { useState } from "react";
import { Button, Modal, Text, TextInput } from "~/ui";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

export function AdminPasswordModal({ opened, onClose, onSubmit }: Props) {
  const [password, setPassword] = useState("");
  const submit = () => {
    onSubmit(password);
    setPassword("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Admin mode"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Unlock
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ display: "grid", gap: 12 }}
      >
        <TextInput
          label="Draft password"
          type="password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter password"
        />
        <Text size="sm" tone="muted">
          Admin mode lets you edit slices, the map and player names, and pick for anyone.
        </Text>
      </form>
    </Modal>
  );
}
