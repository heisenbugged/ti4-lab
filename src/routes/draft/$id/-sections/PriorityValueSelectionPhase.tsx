import { ReferenceCardPhase } from "../-components/ReferenceCardPhase";

export function PriorityValueSelectionPhase() {
  return (
    <ReferenceCardPhase
      phase="priorityValue"
      label="Priority Value"
      phaseName="Priority value selection"
      phaseColor="blue"
      description="Select your priority value card"
      stackBelow="lg"
    />
  );
}
