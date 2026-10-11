import { ReferenceCardPhase } from "../-components/ReferenceCardPhase";

export function HomeSystemSelectionPhase() {
  return (
    <ReferenceCardPhase
      phase="homeSystem"
      label="Home System"
      phaseName="Home system selection"
      phaseColor="green"
      description="Select your home system card"
      showPriorityValueAsDisabled
      stackBelow="md"
    />
  );
}
