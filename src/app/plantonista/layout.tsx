import type { Metadata } from "next";
import { PhoneShell } from "@/components/shell/phone-shell";
import { pendingOffersFor } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "App do plantonista" };

export default function VetLayout({ children }: { children: React.ReactNode }) {
  return <PhoneShell badge={pendingOffersFor().length}>{children}</PhoneShell>;
}
