import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Lora, Nunito } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora", style: ["normal", "italic"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["500", "600", "700", "800", "900"] });

const DESCRICAO = "Jogos diários para conhecer a Bíblia e a fé católica: adivinhe o personagem, acerte a passagem, descubra o santo e reconheça o louvor.";

export const metadata: Metadata = {
  // Endereço do site, sem subpasta (variável do build na hospedagem); usado nas imagens de compartilhamento
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/?$/, "/")),
  title: { default: "Verbum", template: "%s | Verbum" },
  description: DESCRICAO,
  applicationName: "Verbum",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Verbum", title: "Verbum", description: DESCRICAO },
  twitter: { card: "summary_large_image", title: "Verbum", description: DESCRICAO },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c4e9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1733" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${lora.variable} ${nunito.variable}`}>
      <body className="sky min-h-dvh font-sans text-[var(--color-text-main)] antialiased">
        {children}
      </body>
    </html>
  );
}
