import { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: {
    value: number;
    positive: boolean;
  };
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'pink' | 'red';
}

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    shadow: 'shadow-emerald-500/25',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    shadow: 'shadow-blue-500/25',
    gradient: 'from-blue-400 to-blue-600',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    shadow: 'shadow-purple-500/25',
    gradient: 'from-purple-400 to-purple-600',
  },
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    shadow: 'shadow-orange-500/25',
    gradient: 'from-orange-400 to-orange-600',
  },
  pink: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-400',
    shadow: 'shadow-pink-500/25',
    gradient: 'from-pink-400 to-pink-600',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    shadow: 'shadow-red-500/25',
    gradient: 'from-red-400 to-red-600',
  },
};

export const StatsCard = memo(function StatsCard({ icon: Icon, label, value, change, color = 'emerald' }: StatsCardProps) {
  const classes = colorClasses[color];

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
      <div className="relative p-6 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${classes.bg} shadow-lg ${classes.shadow}`}>
            <Icon className={`w-6 h-6 ${classes.text}`} />
          </div>
          {change && (
            <span className={`text-sm font-medium ${change.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {change.positive ? '+' : ''}{change.value}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
});
