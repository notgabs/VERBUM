"use client";

import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 animate-fadeIn" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <Dialog.Content 
            aria-labelledby={labelledBy} 
            aria-label={label} 
            className={`relative outline-none my-auto max-h-[90vh] overflow-y-auto ${className}`}
            onInteractOutside={(e) => { e.preventDefault(); onClose?.(); }}
          >
            {children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
