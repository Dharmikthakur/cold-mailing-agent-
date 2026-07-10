import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apply Mate | Career Copilot & Resume Optimizer",
  description: "Accelerate your job search. Use AI to optimize resume keywords, generate custom cover letters, track applications, and coach mock technical interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
