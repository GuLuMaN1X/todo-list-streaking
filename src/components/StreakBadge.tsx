import { FireIcon } from './FireIcon';

type StreakBadgeProps = {
  streak: number;
};

export function StreakBadge({ streak }: StreakBadgeProps) {
  // Определяем уровень
  let level: 'none' | 'basic' | 'medium' | 'high' | 'legend' = 'none';
  if (streak >= 100) level = 'legend';
  else if (streak >= 50) level = 'high';
  else if (streak >= 10) level = 'medium';
  else if (streak >= 3) level = 'basic';

  const labels = {
    none: 'Streak',
    basic: 'Streak',
    medium: 'Streak',
    high: 'Streak',
    legend: 'Legendary',
  };

  return (
    <div className={`streak streak-${level}`}>
      <FireIcon size={18} />
      <span className="streak-label">{labels[level]}</span>
      <span className="streak-value">
        {streak} {streak === 1 ? 'день' : 'дней'}
      </span>
    </div>
  );
}