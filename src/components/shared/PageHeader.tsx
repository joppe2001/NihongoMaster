import { motion } from 'framer-motion';

type Theme = 'sakura' | 'matcha' | 'gold' | 'indigo' | 'accent';

const THEME_STYLES: Record<Theme, { gradient: string; text: string; sub: string; glow: string; aurora: string }> = {
  sakura: {
    gradient: 'from-sakura-500 via-sakura-600 to-sakura-700',
    text: 'text-white',
    sub: 'text-sakura-100',
    glow: 'shadow-[0_4px_30px_rgba(214,107,138,0.2)]',
    aurora: 'rgba(255, 176, 191, 0.12)',
  },
  matcha: {
    gradient: 'from-matcha-500 via-matcha-600 to-matcha-700',
    text: 'text-white',
    sub: 'text-matcha-100',
    glow: 'shadow-[0_4px_30px_rgba(56,193,114,0.2)]',
    aurora: 'rgba(134, 237, 175, 0.10)',
  },
  gold: {
    gradient: 'from-gold-500 via-gold-600 to-gold-700',
    text: 'text-white',
    sub: 'text-gold-100',
    glow: 'shadow-[0_4px_30px_rgba(245,176,65,0.2)]',
    aurora: 'rgba(255, 217, 102, 0.10)',
  },
  indigo: {
    gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
    text: 'text-white',
    sub: 'text-indigo-100',
    glow: 'shadow-[0_4px_30px_rgba(108,99,255,0.2)]',
    aurora: 'rgba(168, 153, 255, 0.10)',
  },
  accent: {
    gradient: 'from-primary-500 via-primary-600 to-primary-700',
    text: 'text-white',
    sub: 'text-primary-100',
    glow: 'shadow-[0_4px_30px_rgba(108,99,255,0.2)]',
    aurora: 'rgba(168, 153, 255, 0.10)',
  },
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  jpTitle?: string;
  theme: Theme;
  /** Extra content on the right side (buttons etc) */
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, jpTitle, theme, action }: PageHeaderProps) {
  const s = THEME_STYLES[theme];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} ${s.glow} p-5 mb-6`}
    >
      {/* Aurora mesh overlay */}
      <div
        className="absolute inset-0 pointer-events-none animate-breathe"
        style={{
          background: `radial-gradient(ellipse at 20% 30%, ${s.aurora}, transparent 60%),
                       radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.04), transparent 50%)`,
        }}
      />

      {/* Decorative floating characters */}
      {jpTitle && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute -top-2 right-4 text-[80px] font-bold ${s.text} opacity-[0.07] jp-text select-none`}
            style={{ transform: 'rotate(-8deg)' }}
          >
            {jpTitle}
          </motion.span>
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${s.text} tracking-tight`}>{title}</h1>
          {subtitle && (
            <p className={`text-sm ${s.sub} mt-0.5`}>{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </motion.div>
  );
}
