import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { viewerQueryKey } from "~/hooks/useViewer";
import { saveHubSettings, type HubPageData } from "~/server/hub.functions";
import { Button, Modal, Stack, TextInput, Textarea, notify } from "~/ui";

type Props = { hub: HubPageData["hub"]; opened: boolean; onClose: () => void };

export function EditHubModal({ hub, opened, onClose }: Props) {
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(hub.name);
  const [description, setDescription] = useState(hub.description);
  const [slug, setSlug] = useState(hub.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const save = async () => {
    setSaving(true);
    setError(undefined);
    const result = await saveHubSettings({ data: { name, description, slug } });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    notify({ tone: "success", title: "Hub saved" });
    onClose();
    queryClient.invalidateQueries({ queryKey: viewerQueryKey });
    if (result.slug !== hub.slug) {
      navigate({ to: "/hub/$slug", params: { slug: result.slug }, replace: true });
    } else {
      router.invalidate();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit hub"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={saving} disabled={!name.trim()}>
            Save hub
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <TextInput label="Name" value={name} maxLength={60} onChange={(e) => setName(e.currentTarget.value)} />
        <Textarea
          label="Description"
          hint="Who plays here, when, house rules. Shown to everyone with the link."
          rows={3}
          maxLength={280}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <TextInput
          label="Link"
          hint={`tidraft.com/hub/${slug || "…"}. Changing it breaks links you've already shared.`}
          value={slug}
          maxLength={40}
          error={error}
          onChange={(e) => setSlug(e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
        />
      </Stack>
    </Modal>
  );
}
