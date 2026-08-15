import type { Metadata } from "next";
import { TransitionLab } from "./TransitionLab";

export const metadata: Metadata = {
  title: "Transition Lab",
  description: "Bloom transition and pixel-block materialization study.",
};

export default function TransitionLabPage() {
  return <TransitionLab />;
}
