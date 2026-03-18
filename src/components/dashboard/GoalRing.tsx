interface GoalRingProps {
  current: number;
  goal: number;
  label: string;
  size?: number;
}

export function GoalRing({ current, goal, label, size = 120 }: GoalRingProps) {
  const progress = Math.min(1, goal > 0 ? current / goal : 0);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-bg-muted"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={progress >= 1 ? 'text-matcha-500' : 'text-accent'}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-text-primary">{current}</span>
        <span className="text-[10px] text-text-secondary">/ {goal}</span>
      </div>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  );
}
