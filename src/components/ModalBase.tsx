"use client";

import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import { IconButton } from "@/components/ui/Button";
import { XIcon } from "@/components/ui/Icons";

interface ModalBaseProps {
  children: ReactNode;
  labelledBy?: string;
  label?: string;
  onClose?: () => void;
  /** Classes extras do painel (largura, padding, alinhamento). */
  className?: string;
  /** Mostra o botão circular de fechar no canto. */
  showClose?: boolean;
}

/**
 * Modal acessível (Radix Dialog). No celular abre como folha que sobe da base;
 * em telas maiores, como cartão centralizado.
 */
export function ModalBase({ children, labelledBy, label, onClose, className = "", showClose = true }: ModalBaseProps) {
  const reduce = useReducedMotion();

  return (
    <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onClose?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60"
          />
        </Dialog.Overlay>
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <Dialog.Content
            aria-labelledby={labelledBy}
            aria-label={label}
            aria-describedby={undefined}
            onInteractOutside={(e) => { e.preventDefault(); onClose?.(); }}
            asChild
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-[var(--color-surface)] text-[var(--color-text-main)] shadow-[var(--shadow-elevated)] outline-none sm:max-h-[88vh] sm:rounded-[28px] ${className}`}
            >
              <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-[var(--color-fill-strong)] sm:hidden" aria-hidden="true" />
              {showClose && onClose && (
                <Dialog.Close asChild>
                  <IconButton label="Fechar" className="absolute right-4 top-4 z-10 h-8 w-8 text-[var(--color-text-muted)]">
                    <XIcon size={14} />
                  </IconButton>
                </Dialog.Close>
              )}
              {children}
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
