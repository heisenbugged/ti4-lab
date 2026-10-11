import { ValuePill } from "~/ui";

type Props = {
  resources: number;
  influence: number;
  flex?: number;
  size?: "xs" | "sm" | "md" | "lg";
};

/** Resources / influence (/ flex) as the shared value pill. */
export function PlanetStatsPill({ resources, influence, flex, size = "sm" }: Props) {
  return <ValuePill r={resources} i={influence} f={flex} size={size === "xs" ? "sm" : "md"} />;
}
