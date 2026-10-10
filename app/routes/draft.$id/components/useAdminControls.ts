import { useState } from "react";
import { notify } from "~/ui";
import { useDraft } from "~/draftStore";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export function useAdminControls() {
  const adminPassword = useDraft((state) => state.draft.settings.adminPassword);
  const { adminMode, setAdminMode, pickForAnyone, setPickForAnyone } =
    useSafeOutletContext();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const hasAdminPassword = adminPassword !== undefined;
  const showPickForAnyoneControl = !hasAdminPassword || adminMode;
  const showUndoLastSelection = !hasAdminPassword || adminMode;

  const handleAdminPasswordSubmit = (password: string) => {
    if (password === adminPassword) {
      setAdminMode(true);
    } else {
      notify({
        title: "Incorrect password",
        message: "Please try again",
        tone: "danger",
      });
    }
    setPasswordModalOpen(false);
  };

  const handleAdminToggle = () => {
    if (adminMode) {
      setAdminMode(false);
      return;
    }
    if (hasAdminPassword) {
      setPasswordModalOpen(true);
    } else {
      setAdminMode(true);
    }
  };

  return {
    adminMode,
    pickForAnyone,
    setPickForAnyone,
    showPickForAnyoneControl,
    showUndoLastSelection,
    passwordModalOpen,
    setPasswordModalOpen,
    handleAdminPasswordSubmit,
    handleAdminToggle,
  };
}
