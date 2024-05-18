import { TechSpecialty } from "~/types";

const techIcon: Record<TechSpecialty, string> = {
  BIOTIC: "/biotic.webp",
  CYBERNETIC: "/cybernetic.webp",
  WARFARE: "/warfare.webp",
  PROPULSION: "/propulsion.webp",
};

type Props = {
  techSpecialty: TechSpecialty;
};

export function TechIcon({ techSpecialty }: Props) {
  return <img src={techIcon[techSpecialty]} style={{ width: 20 }} />;
}
