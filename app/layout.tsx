import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "../components/Shell";

export const metadata: Metadata = {
  title: "CreatorMetrics · Hackathon Build",
  description:
    "CreatorMetrics – IG → LTK → Amazon funnel analytics for creators and agencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="cm-body">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
