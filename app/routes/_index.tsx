import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

export default function Index() {
  return (
    <div>
    </div>
  );
}
