"use client";

import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "motion/react";

interface ModalBaseProps {
  children: ReactNode;
  labelledBy?: string;
  label?: string;
  onClose?: () => void;
  className: string;
}

/** Modal acessível baseado no Radix Dialog */
export function ModalBase({ children, labelledBy, label, onClose, className }: ModalBaseProps) {
  return (
    <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onClose?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70"
          />
        </Dialog.Overlay>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <Dialog.Content 
            aria-labelledby={labelledBy} 
            aria-label={label} 
            onInteractOutside={(e) => { e.preventDefault(); onClose?.(); }}
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`relative outline-none my-auto max-h-[90vh] overflow-y-auto ${className}`}
            >
              {children}
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
