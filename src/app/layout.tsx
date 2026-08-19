import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Verbum - O Jogo Diário Bíblico",
  description: "Descubra personagens e passagens bíblicas em uma atmosfera monástica retrô.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${lora.variable} ${inter.variable}`}>
      <body className="bg-[var(--bg-app)] text-[var(--text-main)] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
