import { useUserStore } from '@/stores/userStore';
import { useAppStore } from '@/stores/settingsStore';
import { NAV_ITEMS } from '@/lib/constants';
import { Flame, Zap } from '@/lib/icons';

export function TopBar() {
  const { user } = useUserStore();
  const { currentPage } = useAppStore();

  const currentNav = NAV_ITEMS.find((item) => item.id === currentPage);

  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-border/40 glass no-select z-10">
      {/* Page Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-text-primary">
          {currentNav?.label ?? 'NihongoMaster'}
        </h1>
        {currentNav && (
          <span className="text-[11px] text-text-secondary/60 hidden sm:inline">
            {currentNav.description}
          </span>
        )}
      </div>

      {/* Quick Stats */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-subtle" title="Study streak">
            <Flame size={13} className="text-gold-500" />
            <span className="text-xs font-semibold text-text-primary tabular-nums">
              {user.streakDays}
            </span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-subtle" title="Experience points">
            <Zap size={13} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary tabular-nums">
              {user.xp.toLocaleString()}
            </span>
          </div>

          {/* JLPT Level */}
          <div
            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
            style={{
              background:
                user.currentLevel === 5
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : user.currentLevel === 4
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : user.currentLevel === 3
                      ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                      : user.currentLevel === 2
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
            }}
          >
            N{user.currentLevel}
          </div>
        </div>
      )}
    </header>
  );
}
