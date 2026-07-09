import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobPilot AI | Career Copilot & Resume Optimizer",
  description: "Accelerate your job search. Use AI to optimize resume keywords, generate custom cover letters, track applications, and coach mock technical interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
