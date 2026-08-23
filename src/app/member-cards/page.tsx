import type { Metadata } from "next";
import { MemberCards } from "./MemberCards";

export const metadata: Metadata = {
  title: "Member Cards",
  description: "Prototype of the Blockchain at Berkeley exec member card set.",
};

export default function MemberCardsPage() {
  return <MemberCards />;
}
