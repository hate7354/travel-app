import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Map Share",
  description: "Friends trip map sharing MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
