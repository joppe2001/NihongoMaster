import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
import { NAV_ITEMS } from '@/lib/constants';
import { PAGE_ICONS, PAGE_JP_CHARS, type LucideIcon } from '@/lib/icons';
import { getLevel, getXpForNextLevel } from '@/components/shared/LevelUpAnimation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Settings as SettingsIcon, TrendingUp } from '@/lib/icons';
import type { PageId } from '@/lib/types';

// Which pages go in which section
const LEARN_IDS: PageId[] = ['hiragana', 'katakana', 'kanji', 'vocabulary', 'grammar'];
const PRACTICE_IDS: PageId[] = ['practice', 'reading', 'typing', 'review'];

const SIDEBAR_COLLAPSED = 56;  // px — w-14
const SIDEBAR_EXPANDED = 220;  // px

// Timing constants
const EXPAND_DURATION = 0.3;
const COLLAPSE_DURATION = 0.25;
export function Sidebar() {
  const { currentPage, setCurrentPage } = useAppStore();
  const { user } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const level = user ? getLevel(user.xp) : 1;
  const xpInfo = user ? getXpForNextLevel(user.xp) : { progress: 0 };

  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  return (
    <motion.aside
      onMouseEnter={expand}
      onMouseLeave={collapse}
      animate={{ width: isExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
      transition={{
        duration: isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col h-screen gradient-sidebar no-select relative z-20 border-r border-neutral-800/30 will-change-[width] overflow-hidden"
    >
      {/* Aurora glow at top */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background: 'radial-gradient(ellipse at 50% -10%, rgba(108, 99, 255, 0.18), transparent 65%), radial-gradient(ellipse at 30% 20%, rgba(214, 107, 138, 0.06), transparent 50%)',
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center h-13 px-3 shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shrink-0 shadow-sm hover:animate-glow-pulse transition-shadow">
          <span className="text-white text-sm font-bold jp-text">日</span>
        </div>
        <motion.div
          animate={{ maxWidth: isExpanded ? 200 : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: isExpanded ? 0.25 : 0.15, delay: isExpanded ? 0.08 : 0 }}
          className="overflow-hidden ml-2.5"
        >
          <span className="text-sm font-semibold text-neutral-100 whitespace-nowrap tracking-tight">
            NihongoMaster
          </span>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-neutral-800/50" />

      {/* Dashboard */}
      <div className="px-2 pt-2">
        <SidebarItem
          pageId="dashboard"
          label="Dashboard"
          Icon={PAGE_ICONS.dashboard}
          isActive={currentPage === 'dashboard'}
          isExpanded={isExpanded}
          onClick={() => setCurrentPage('dashboard')}
        />
      </div>

      {/* Learn section */}
      <nav className="flex-1 overflow-y-auto px-2 pt-3">
        <SectionLabel label="Learn" isExpanded={isExpanded} />
        <div className="space-y-0.5">
          {LEARN_IDS.map((id) => {
            const item = NAV_ITEMS.find((n) => n.id === id);
            if (!item) return null;
            return (
              <SidebarItem
                key={id}
                pageId={id}
                label={item.label}
                Icon={PAGE_ICONS[id]}
                jpChar={PAGE_JP_CHARS[id]}
                isActive={currentPage === id}
                isExpanded={isExpanded}
                onClick={() => setCurrentPage(id)}
              />
            );
          })}
        </div>

        {/* Practice section */}
        <div className="mt-4">
          <SectionLabel label="Practice" isExpanded={isExpanded} />
          <div className="space-y-0.5">
            {PRACTICE_IDS.map((id) => {
              const item = NAV_ITEMS.find((n) => n.id === id);
              if (!item) return null;
              return (
                <SidebarItem
                  key={id}
                  pageId={id}
                  label={item.label}
                  Icon={PAGE_ICONS[id]}
                  isActive={currentPage === id}
                  isExpanded={isExpanded}
                  onClick={() => setCurrentPage(id)}
                />
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom: Progress + Settings */}
      <div className="px-2 pb-1 space-y-0.5">
        <div className="mx-3 border-t border-neutral-800/50 mb-2" />
        <SidebarItem
          pageId="progress"
          label="Progress"
          Icon={TrendingUp}
          isActive={currentPage === 'progress'}
          isExpanded={isExpanded}
          onClick={() => setCurrentPage('progress')}
        />
        <SidebarItem
          pageId="settings"
          label="Settings"
          Icon={SettingsIcon}
          isActive={currentPage === 'settings'}
          isExpanded={isExpanded}
          onClick={() => setCurrentPage('settings')}
        />
      </div>

      {/* User / Stats */}
      {user && (
        <div className="pb-3 pt-1 flex justify-center">
          <div className="flex items-center rounded-lg py-2">
            {/* Level ring — indigo → gold gradient */}
            <div className="relative w-8 h-8 shrink-0">
              <svg width="32" height="32" className="-rotate-90">
                <defs>
                  <linearGradient id="xp-ring-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8B7AFF" />
                    <stop offset="100%" stopColor="#F5B041" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                <circle cx="16" cy="16" r="13" fill="none" stroke="url(#xp-ring-grad)" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 13}
                  strokeDashoffset={2 * Math.PI * 13 * (1 - xpInfo.progress)}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-neutral-200 leading-none pt-px pl-px">
                {level}
              </span>
            </div>
            <motion.div
              animate={{ maxWidth: isExpanded ? 200 : 0, opacity: isExpanded ? 1 : 0 }}
              transition={{
                maxWidth: { duration: isExpanded ? 0.25 : 0.15, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: isExpanded ? 0.2 : 0.1, delay: isExpanded ? 0.1 : 0 },
              }}
              className="overflow-hidden ml-1"
            >
              <div className="flex flex-col min-w-0 whitespace-nowrap">
                <span className="text-xs font-medium text-neutral-200 truncate">{user.name}</span>
                <div className="flex items-center gap-1.5">
                  <Flame size={10} className={cn("text-gold-500", user.streakDays > 0 && "animate-pulse-soft")} />
                  <span className="text-[10px] text-neutral-400">{user.streakDays}d</span>
                  <span className="text-[10px] text-neutral-500">&middot;</span>
                  <span className="text-[10px] text-neutral-400">{user.xp.toLocaleString()} XP</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

// ─── Section Label ─────────────────────────────────────────────

function SectionLabel({ label, isExpanded }: { label: string; isExpanded: boolean }) {
  return (
    <div className="h-5 mb-1 flex items-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {isExpanded ? (
          <motion.p
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            className="px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.1em]"
          >
            {label}
          </motion.p>
        ) : (
          <motion.div
            key="dot"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.15 }}
            className="mx-auto w-3 border-t border-neutral-800/40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar Item ────────────────────────────────────────────

function SidebarItem({
  label,
  Icon,
  jpChar,
  isActive,
  isExpanded,
  onClick,
}: {
  pageId?: string;
  label: string;
  Icon: LucideIcon;
  jpChar?: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={!isExpanded ? label : undefined}
      className={cn(
        'w-full flex items-center rounded-md cursor-pointer relative',
        'px-2 py-1.5',
        isActive
          ? 'bg-primary-500/10 text-primary-300 shadow-sm'
          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
      )}
    >
      {/* Active bar */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full gradient-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon or JP character */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        {jpChar ? (
          <span className={cn(
            'text-sm font-semibold jp-text',
            isActive ? 'text-primary-300' : ''
          )}>
            {jpChar}
          </span>
        ) : (
          <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
        )}
      </div>

      {/* Label — clipping wrapper collapses to 0 width when closed */}
      <motion.div
        animate={{ maxWidth: isExpanded ? 200 : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{
          maxWidth: { duration: isExpanded ? 0.22 : 0.15, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: isExpanded ? 0.2 : 0.1, delay: isExpanded ? 0.06 : 0 },
        }}
        className="overflow-hidden ml-1"
      >
        <span
          className={cn(
            'text-[13px] whitespace-nowrap',
            isActive ? 'font-medium' : ''
          )}
        >
          {label}
        </span>
      </motion.div>
    </button>
  );
}
