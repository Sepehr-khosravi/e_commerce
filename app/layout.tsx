import type { Metadata } from "next";
import "@/app/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

export const metadata: Metadata = {
  title: "ElectroMart",
  description: "Your one-stop shop for all electronics and gadgets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AuthProvider>
        <Navbar />
          {children}
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}