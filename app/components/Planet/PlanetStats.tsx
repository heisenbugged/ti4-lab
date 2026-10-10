import { useSafeOutletContext } from "~/useSafeOutletContext";

type Props = {
  legendary?: boolean;
  resources: number;
  influence: number;
  fontSize?: string;
};

const row = { display: "flex", alignItems: "center", gap: 3, zIndex: 1, position: "relative" } as const;
const num = (fontSize: string) => ({ margin: 0, fontSize, fontWeight: "bolder" as const, lineHeight: 1.55 });

export function PlanetStats({ legendary, resources, influence, fontSize = "25px" }: Props) {
  const { accessibleColors } = useSafeOutletContext();

  const accessibleShadow = accessibleColors
    ? { WebkitTextStroke: "2px rgba(255, 255, 255, 0.5)", paintOrder: "stroke fill" }
    : undefined;

  if (legendary) {
    return (
      <div style={row}>
        <div style={{ background: "var(--pal-yellow-8)", borderRadius: 8, padding: 2 }}>
          <p style={{ ...num(fontSize), color: "white" }}>{resources}</p>
        </div>
        <div style={{ background: "var(--pal-blue-8)", borderRadius: 8, padding: 2 }}>
          <p style={{ ...num(fontSize), color: "white" }}>{influence}</p>
        </div>
      </div>
    );
  }
  return (
    <div style={row}>
      <p style={{ ...num(fontSize), color: "#edff00", WebkitTextStroke: "2px #40578a5e", paintOrder: "stroke fill" }}>{resources}</p>
      <p style={{ ...num(fontSize), color: "var(--pal-blue-9)", ...accessibleShadow }}>{influence}</p>
    </div>
  );
}
