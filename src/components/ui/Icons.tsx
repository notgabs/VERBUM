import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const ChevronLeft = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M15 18l-6-6 6-6" /></svg>
);

export const ChevronRight = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M9 18l6-6-6-6" /></svg>
);

export const InfoIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5h.01" strokeWidth={2.6} /></svg>
);

export const SpeakerIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18.5 5.5a9 9 0 010 13" /></svg>
);

export const SpeakerOffIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" /><path d="M16 9l5 6" /><path d="M21 9l-5 6" /></svg>
);

export const XIcon = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.4}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
);

export const SearchIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

export const LightbulbIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0012 3z" /></svg>
);

export const LockIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...base(size, p)}><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
);

export const ShareIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
);

export const RefreshIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M20 11a8 8 0 10-2.3 5.7" /><path d="M20 4v7h-7" /></svg>
);

export const PlusIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.4}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);

export const MinusIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.4}><path d="M5 12h14" /></svg>
);

export const CheckIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.6}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export const ArrowUpIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.6}><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>
);

export const ArrowDownIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.6}><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></svg>
);

export const PersonIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size, p)}><circle cx="12" cy="8" r="4" fill="currentColor" stroke="none" /><path d="M4 21a8 8 0 0116 0z" fill="currentColor" stroke="none" /></svg>
);

export const InfinityIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.4}><path d="M7.5 8.5C4.5 8.5 3 10.2 3 12s1.5 3.5 4.5 3.5c3.5 0 5.5-7 9-7 3 0 4.5 1.7 4.5 3.5s-1.5 3.5-4.5 3.5c-3.5 0-5.5-7-9-7z" /></svg>
);

export const BookIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2z" fill="currentColor" fillOpacity={0.25} /><path d="M12 6.5v14" /></svg>
);

export const QuestionIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size, p)} strokeWidth={2.4}><path d="M9 9a3 3 0 115 2.2c-1.2.8-2 1.5-2 2.8" /><path d="M12 18h.01" strokeWidth={3} /></svg>
);

export const MusicIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size, p)}><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" fill="currentColor" /><circle cx="17.5" cy="16" r="2.5" fill="currentColor" /></svg>
);

export const FlameIcon = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size, p)} stroke="none" fill="currentColor"><path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 01-10 0c0-2.5 1.2-4 2.5-5 .2 1.8 1 3 2.2 3.5C11 9 11.2 5.5 12 2z" /></svg>
);
