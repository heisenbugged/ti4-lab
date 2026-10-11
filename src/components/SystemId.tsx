import { SystemId as SystemIdType } from "~/types";

type Props = {
  id: SystemIdType;
  size: string;
  scale: number;
  radius: number;
  rotation?: number;
  highlight?: boolean;
};

export function SystemId({
  id,
  size,
  scale,
  rotation,
  radius,
  highlight = false,
}: Props) {
  const transforms = [];
  if (highlight) transforms.push(`translate(${radius * 0.3}px, 0px)`);
  if (rotation) transforms.push(`rotate(${rotation}deg)`);

  return (
    <p
      style={{
        margin: 0,
        fontSize: size,
        lineHeight: 1.55,
        color: "white",
        position: "absolute",
        top: 15 * scale,
        fontWeight: "bolder",
        transform: transforms.join(" "),
      }}
    >
      {id}
    </p>
  );
}
