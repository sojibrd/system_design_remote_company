/**
 * Chassis-এর আইকন, inline আঁকা — dsa_prep-এর মতো।
 *
 * কয়েকটা glyph-এর জন্য পুরো আইকন লাইব্রেরি টানার দরকার নেই। সবই
 * `currentColor` নেয়, তাই রঙ থিমেরই থাকে।
 */

type IconProps = { size?: number };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function PanelLeftClose({ size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}

export function PanelLeftOpen({ size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

export function Menu({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function X({ size = 12 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ArrowRight({ size = 13 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ArrowLeft({ size = 13 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function ArrowUpRight({ size = 12 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function TriangleAlert({ size = 13 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function Check({ size = 13 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Plus({ size = 13 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export function Trash2({ size = 13 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
