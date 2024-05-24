import { TechSpecialty } from "~/types";

const techIcon: Record<TechSpecialty, string> = {
  BIOTIC: "/biotic.webp",
  CYBERNETIC: "/cybernetic.webp",
  WARFARE: "/warfare.webp",
  PROPULSION: "/propulsion.webp",
};

type Props = {
  techSpecialty: TechSpecialty;
  size?: number;
};

export function TechIcon({ techSpecialty, size = 20 }: Props) {
  return <img src={techIcon[techSpecialty]} style={{ width: size }} />;
}
