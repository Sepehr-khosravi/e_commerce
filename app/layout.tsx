import type { Metadata } from "next";
import "@/app/globals.css";


export const metadata: Metadata = {
  title: "ElectroMart - Search Products",
  description: "Your one-stop shop for all electronics and gadgets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}