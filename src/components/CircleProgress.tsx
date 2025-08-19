"use client";
type Props = {
  size?: number;         // px
  stroke?: number;       // px
  percent: number;       // 0..100
  label?: string;
  sublabel?: string;
};

export default function CircleProgress({
  size = 140,
  stroke = 10,
  percent,
  label,
  sublabel,
}: Props) {
  const p = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="white"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <div className="text-xl font-semibold">{label}</div>}
        <div className="text-sm opacity-80">{Math.round(p)}%</div>
        {sublabel && <div className="text-xs opacity-70 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
