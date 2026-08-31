"use client";

import React from "react";
import Link from "next/link";
import { MonasteryBackground } from "@/components/MonasteryBackground";
import { useGameStats } from "@/hooks/useGameStats";
import { playClickSound } from "@/utils/sound";
import { motion } from "motion/react";

export default function HomePage() {
  const { stats, winRate, isLoaded } = useGameStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <MonasteryBackground fitViewport>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="home-screen relative flex-1 w-full max-w-sm mx-auto flex flex-col items-center justify-center text-center gap-6 py-6"
      >
        {/* VERBUM Logo & Emblem */}
        <motion.div variants={itemVariants} className="flex flex-col items-center z-10 relative">
          <div className="hidden w-16 h-16 sm:w-20 sm:h-20 bg-[#3b1f11] border-4 border-[#693d22] flex items-center justify-center shadow-2xl relative">
              <span className="text-3xl sm:text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                ✝️
              </span>
            </div>

            <img
              src="/logo-verbum.png"
              alt="Verbum"
              className="home-logo h-auto drop-shadow-sm"
            />
          </motion.div>

          <div className="w-full grid grid-cols-1 gap-3 sm:gap-4 z-20 relative">
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/personagem" onClick={() => playClickSound()} className="bg-[var(--color-interactive-surface)]/95 border border-[var(--color-interactive-border)] rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.25)] p-3 flex items-center justify-start gap-4 text-left group cursor-pointer hover:bg-[var(--color-interactive-surface-hover)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-[#4693cb] transition-colors duration-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
                  <img src="/personagem-emoji.svg" alt="" className="h-full w-full object-contain drop-shadow-sm" />
                </span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-lg sm:text-xl font-serif font-black text-[var(--color-interactive-text)] uppercase tracking-wider">
                    Clássico
                  </span>
                  <span className="text-[11px] text-[var(--color-interactive-text-muted)] font-sans font-medium">
                    Adivinhe a figura bíblica
                  </span>
                </span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/passagem" onClick={() => playClickSound()} className="bg-[var(--color-interactive-surface)]/95 border border-[var(--color-interactive-border)] rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.25)] p-3 flex items-center justify-start gap-4 text-left group cursor-pointer hover:bg-[var(--color-interactive-surface-hover)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-[#4693cb] transition-colors duration-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
                  <img src="/passagem-emoji.svg" alt="" className="h-full w-full object-contain drop-shadow-sm" />
                </span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-lg sm:text-xl font-serif font-black text-[var(--color-interactive-text)] uppercase tracking-wider">
                    Acerte a Passagem
                  </span>
                  <span className="text-[11px] text-[var(--color-interactive-text-muted)] font-sans font-medium">
                    Adivinhe livro, cap e versículo
                  </span>
                </span>
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/quem-sou-eu" onClick={() => playClickSound()} className="bg-[var(--color-interactive-surface)]/95 border border-[var(--color-interactive-border)] rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.25)] p-3 flex items-center justify-start gap-4 text-left group cursor-pointer hover:bg-[var(--color-interactive-surface-hover)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-[#4693cb] transition-colors duration-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
                  <img src="/cubo-interrogacao.svg" alt="" className="h-full w-full object-contain drop-shadow-sm opacity-90" />
                </span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-lg sm:text-xl font-serif font-black text-[var(--color-interactive-text)] uppercase tracking-wider">
                    Quem Sou Eu?
                  </span>
                  <span className="text-[11px] text-[var(--color-interactive-text-muted)] font-sans font-medium">
                    Descubra quem está por trás das pistas
                  </span>
                </span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/musica" onClick={() => playClickSound()} className="bg-[var(--color-interactive-surface)]/95 border border-[var(--color-interactive-border)] rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.25)] p-3 flex items-center justify-start gap-4 text-left group cursor-pointer hover:bg-[var(--color-interactive-surface-hover)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-[#4693cb] transition-colors duration-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14 text-3xl sm:text-4xl filter drop-shadow-sm opacity-90">
                  🎵
                </span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-lg sm:text-xl font-serif font-black text-[var(--color-interactive-text)] uppercase tracking-wider">
                    Acertar a Música
                  </span>
                  <span className="text-[11px] text-[var(--color-interactive-text-muted)] font-sans font-medium">
                    Identifique os hinos e salmos
                  </span>
                </span>
              </Link>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="w-full bg-[var(--color-bg-app)] border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-[var(--shadow-elevated)]">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center max-w-sm mx-auto">
              <div className="flex flex-col items-center justify-center p-2 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] sm:text-xs font-sans font-bold text-[var(--text-muted)] uppercase tracking-wide">
                  Jogos
                </span>
                <span className="font-sans text-xl sm:text-2xl font-black text-[var(--text-main)] mt-0.5">
                  {isLoaded ? stats.jogosRealizados : 0}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] sm:text-xs font-sans font-bold text-[var(--text-muted)] uppercase tracking-wide">
                  Sequência
                </span>
                <span className="font-sans text-xl sm:text-2xl font-black text-[var(--status-correct)] mt-0.5 flex items-center gap-1">
                  {isLoaded ? stats.sequenciaAtual : 0} <span className="text-sm">🔥</span>
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] sm:text-xs font-sans font-bold text-[var(--text-muted)] uppercase tracking-wide">
                  Vitórias
                </span>
                <span className="font-sans text-xl sm:text-2xl font-black text-[var(--text-main)] mt-0.5">
                  {isLoaded ? `${winRate}%` : "0%"}
                </span>
              </div>
            </div>
          </motion.div>
      </motion.div>
    </MonasteryBackground>
  );
}
