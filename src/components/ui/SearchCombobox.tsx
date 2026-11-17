"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SearchIcon } from "@/components/ui/Icons";

interface SearchComboboxProps<T> {
  id: string;
  label: string;
  /** Esconde o rótulo visualmente (fica só para leitores de tela). */
  hideLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T, active: boolean) => React.ReactNode;
  onPick: (item: T) => void;
  /** Enter sem sugestão aberta (ex.: enviar o texto digitado). */
  onSubmitRaw?: () => void;
  placeholder?: string;
  emptyText?: string;
  invalid?: boolean;
  showIcon?: boolean;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  inputClassName?: string;
  /** Abre a lista acima do campo (quando o campo fica no rodapé da tela). */
  dropUp?: boolean;
}

/** Campo de busca com sugestões, navegação por teclado e ARIA de combobox. */
export function SearchCombobox<T>({
  id,
  label,
  hideLabel = true,
  value,
  onChange,
  items,
  getKey,
  renderItem,
  onPick,
  onSubmitRaw,
  placeholder,
  emptyText = "Nenhum resultado",
  invalid = false,
  showIcon = true,
  autoFocus,
  inputRef,
  className = "",
  inputClassName = "",
  dropUp = false,
}: SearchComboboxProps<T>) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listId = `${id}-options`;
  const isOpen = open && value.trim().length > 0;

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const pick = (item: T) => {
    onPick(item);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (isOpen && items.length > 0) {
        event.preventDefault();
        const item = items[activeIndex >= 0 ? activeIndex : 0];
        if (item) pick(item);
      } else if (onSubmitRaw) {
        event.preventDefault();
        onSubmitRaw();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "eyebrow mb-1.5 block"}>{label}</label>
      <div className="relative">
        {showIcon && (
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        )}
        <input
          id={id}
          ref={inputRef}
          type="text"
          autoComplete="off"
          autoFocus={autoFocus}
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={isOpen && activeIndex >= 0 && items[activeIndex] ? `${id}-opt-${getKey(items[activeIndex])}` : undefined}
          aria-invalid={invalid || undefined}
          className={`field ${showIcon ? "pl-11" : "pl-4"} pr-4 ${invalid ? "field-invalid animate-input-shake" : ""} ${inputClassName}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            id={listId}
            role="listbox"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            onMouseDown={(e) => e.preventDefault()}
            className={`absolute left-0 right-0 z-40 max-h-72 overflow-y-auto ${dropUp ? "bottom-[calc(100%+8px)] origin-bottom" : "top-[calc(100%+8px)] origin-top"} rounded-[18px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-1.5 shadow-[var(--shadow-elevated)]`}
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={getKey(item)}
                  id={`${id}-opt-${getKey(item)}`}
                  data-index={index}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(item)}
                  className={`cursor-pointer rounded-xl px-3 py-2 transition-colors ${activeIndex === index ? "bg-[var(--color-fill)]" : ""}`}
                >
                  {renderItem(item, activeIndex === index)}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-center text-sm text-[var(--color-text-muted)]">{emptyText}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
