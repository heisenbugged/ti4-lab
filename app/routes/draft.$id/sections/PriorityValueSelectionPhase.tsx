import { ReferenceCardPhase } from "../components/ReferenceCardPhase";

export function PriorityValueSelectionPhase() {
  return (
    <ReferenceCardPhase
      phase="priorityValue"
      label="Priority Value"
      phaseName="Priority Value Selection"
      phaseColor="blue"
      description="Select your priority value card"
      sidebarSpan={{ base: 12, lg: 4 }}
      gridSpan={{ base: 12, lg: 8 }}
    />
  );
}
