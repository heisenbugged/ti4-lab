import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

// Define the loader function to handle the redirect
export const loader: LoaderFunction = async () => {
  return redirect("/draft/prechoice"); // Specify the path you want to redirect to
};

// Since this route only handles redirect, there's no need for a component
export default function Index() {
  return null;
}
