import { PlanetTrait } from "~/types";

type Props = {
  trait?: PlanetTrait[];
  children: string;
  size: number;
  legendary?: boolean;
};

const getBgColor = (
  traitColor: Record<PlanetTrait, string>,
  traits: PlanetTrait[],
) => {
  if (traits.length === 1) {
    return traitColor[traits[0]];
  }

  const total = traits.length;
  let currentPos = 0;
  const stops = [];

  for (const trait of traits) {
    const percentage = 100 / total;
    stops.push(`${traitColor[trait]} ${currentPos}%`);
    stops.push(`${traitColor[trait]} ${currentPos + percentage}%`);
    currentPos += percentage;
  }

  return `linear-gradient(to right, ${stops.join(", ")})`;
};

export function PlanetName({
  size,
  children,
  trait,
  legendary = false,
}: Props) {

  const traitColor: Record<PlanetTrait, string> = {
    CULTURAL: "var(--pal-blue-9)",
    HAZARDOUS: "var(--pal-red-9)",
    INDUSTRIAL: "var(--pal-green-9)",
  };

  const traitBorderColor: Record<PlanetTrait, string> = {
    CULTURAL: "var(--pal-blue-6)",
    HAZARDOUS: "var(--pal-red-6)",
    INDUSTRIAL: "var(--pal-green-6)",
  };

  const bgColor = trait ? getBgColor(traitColor, trait) : "#d27900";
  const borderColor = trait ? getBgColor(traitBorderColor, trait) : "#d27900";
  let borderStyle = {};
  if (legendary && trait) {
    if (trait.length === 1) {
      borderStyle = { border: `2px solid ${borderColor}` };
    } else if (trait.length > 1) {
      borderStyle = {
        borderWidth: `2px`,
        borderStyle: `solid`,
        borderImage: `${borderColor} 1`,
      };
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        top: size - 10,
        right: 0,
        left: 0,
        background: legendary ? bgColor : "rgba(0, 0, 0, 0.7)",
        padding: 2,
        ...borderStyle,
      }}
    >
      <p style={{ margin: 0, fontSize: 10, color: "white", fontWeight: "bolder", textAlign: "center", lineHeight: 0.9 }}>
        {children}
      </p>
    </div>
  );
}
