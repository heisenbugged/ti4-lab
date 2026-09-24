import { ReferenceCardPhase } from "../components/ReferenceCardPhase";

export function HomeSystemSelectionPhase() {
  return (
    <ReferenceCardPhase
      phase="homeSystem"
      label="Home System"
      phaseName="Home System Selection"
      phaseColor="green"
      description="Select your home system card"
      showPriorityValueAsDisabled
      sidebarSpan={{ base: 12, md: 4, lg: 3 }}
      gridSpan={{ base: 12, md: 8, lg: 9 }}
    />
  );
}
