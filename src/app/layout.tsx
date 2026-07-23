import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verbum - O Jogo Diário Bíblico",
  description: "Descubra personagens e passagens bíblicas em uma atmosfera monástica retrô.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#180e07] text-[#f4ecd8] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
