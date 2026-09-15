"use client";

/** সার্বিক সম্পূর্ণতার readout — কতদূর এগোলাম, একটা বার হিসেবে। */
export default function ProgressReadout({
  percent,
  label = "সার্বিক সম্পূর্ণতা",
  className = "h-2.5 w-full",
}: {
  percent: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`gauge ${className}`}
    >
      <div className="gauge-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
