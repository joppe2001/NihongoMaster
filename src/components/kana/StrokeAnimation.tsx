import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { getStrokeData } from '@/data/strokeData';

/**
 * Stroke-order animation for kana characters.
 *
 * Visual model:
 *   - The FONT character is the reference (textbook-style, what students learn)
 *   - Stroke animation overlays on top showing order & direction
 *   - When paused: shows the complete font character for writing reference
 *   - When playing: font char at low opacity + animated strokes on top
 */

interface StrokeAnimationProps {
  character: string;
  speed?: number;
  size?: number;
  loop?: boolean;
  onComplete?: () => void;
}

export function StrokeAnimation({
  character,
  speed = 0.75,
  size = 200,
  loop = true,
  onComplete,
}: StrokeAnimationProps) {
  const data = getStrokeData(character);
  const [animKey, setAnimKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalDurationMs = data ? data.strokes.length * speed * 1000 : 0;

  // Loop after all strokes + pause
  useEffect(() => {
    if (!loop || !isPlaying || !data) return;
    const t = setTimeout(() => setAnimKey((k) => k + 1), totalDurationMs + 1800);
    loopTimerRef.current = t;
    return () => clearTimeout(t);
  }, [animKey, loop, isPlaying, totalDurationMs, data]);

  // Reset on character change
  useEffect(() => {
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    setAnimKey((k) => k + 1);
    setIsPlaying(true);
  }, [character]);

  const replay = useCallback(() => {
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    setAnimKey((k) => k + 1);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) setAnimKey((k) => k + 1);
      return !prev;
    });
  }, []);

  // No stroke data: just show the font character
  if (!data) {
    return (
      <div className="flex flex-col items-center">
        <div style={{ width: size, height: size }} className="flex items-center justify-center">
          <span className="character-display text-text-primary jp-text" style={{ fontSize: size * 0.7 }}>
            {character}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/*
          Layer 1: The FONT character — this is the "textbook" reference.
          When paused: full opacity (clean reference for writing)
          When playing: dimmed so stroke animation is the focus
        */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-300"
          style={{ opacity: isPlaying ? 0.12 : 1 }}
        >
          <span
            className="character-display text-text-primary jp-text"
            style={{ fontSize: size * 0.78 }}
          >
            {character}
          </span>
        </div>

        {/*
          Layer 2: Stroke animation overlay (only visible when playing)
          Shows stroke order + direction on top of the dimmed font char
        */}
        {isPlaying && (
          <svg
            key={animKey}
            viewBox="0 0 109 109"
            width={size}
            height={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {data.strokes.map((d, i) => (
              <StrokePath
                key={`${animKey}-${i}`}
                d={d}
                index={i}
                totalStrokes={data.strokes.length}
                speed={speed}
                isPlaying={isPlaying}
                onComplete={i === data.strokes.length - 1 ? onComplete : undefined}
              />
            ))}
          </svg>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="px-3 py-1 text-xs rounded-lg bg-bg-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={replay}
          className="px-3 py-1 text-xs rounded-lg bg-bg-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          Replay
        </button>
        <span className="text-[10px] text-text-secondary">
          {data.strokes.length} stroke{data.strokes.length !== 1 ? 's' : ''}
          {!isPlaying && ' — paused (writing reference)'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual animated stroke
// ─────────────────────────────────────────────────────────────────────────────

interface StrokePathProps {
  d: string;
  index: number;
  totalStrokes: number;
  speed: number;
  isPlaying: boolean;
  onComplete?: () => void;
}

function StrokePath({ d, index, totalStrokes, speed, isPlaying, onComplete }: StrokePathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const numRef = useRef<SVGGElement>(null);

  const delayMs = index * speed * 1000;
  const drawMs = Math.max(300, speed * 900);
  const fadeMs = 180;

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !isPlaying) return;

    const len = path.getTotalLength();

    // Initial: fully hidden
    path.style.strokeDasharray = `${len} ${len + 1}`;
    path.style.strokeDashoffset = String(len);
    path.style.opacity = '0';

    const animations: Animation[] = [];

    // 1. Appear at draw-start
    animations.push(
      path.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { delay: delayMs, duration: 20, fill: 'forwards', easing: 'linear' }
      )
    );

    // 2. Draw the stroke
    const draw = path.animate(
      [{ strokeDashoffset: String(len) }, { strokeDashoffset: '0' }],
      { delay: delayMs, duration: drawMs, fill: 'forwards', easing: 'ease-in-out' }
    );
    animations.push(draw);

    // 3. After drawing: dim to "completed" state
    animations.push(
      path.animate(
        [{ opacity: 1 }, { opacity: 0.5 }],
        { delay: delayMs + drawMs, duration: fadeMs, fill: 'forwards', easing: 'ease-out' }
      )
    );

    draw.onfinish = () => { if (onComplete) onComplete(); };

    return () => animations.forEach((a) => a.cancel());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, delayMs, drawMs, fadeMs, isPlaying]);

  // Number indicator animation
  useLayoutEffect(() => {
    const g = numRef.current;
    if (!g || !isPlaying || totalStrokes <= 1) return;

    g.style.opacity = '0';

    const anim = g.animate(
      [
        { opacity: 0, transform: 'scale(0)' },
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0)' },
      ],
      { delay: delayMs, duration: drawMs + fadeMs, fill: 'forwards', easing: 'ease-out' }
    );

    return () => anim.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, delayMs, drawMs, fadeMs, isPlaying, totalStrokes]);

  // Parse start point for number placement
  const m = d.match(/M\s*([\d.-]+)[,\s]+([\d.-]+)/);
  const sx = m ? Math.max(6, Math.min(103, parseFloat(m[1]))) : 10;
  const sy = m ? Math.max(6, Math.min(103, parseFloat(m[2]))) : 10;

  return (
    <>
      <path
        ref={pathRef}
        d={d}
        stroke="currentColor"
        className="text-accent"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ opacity: 0 }}
      />

      {totalStrokes > 1 && (
        <g ref={numRef} transform={`translate(${sx},${sy})`} style={{ opacity: 0 }}>
          <circle r={5.5} fill="currentColor" className="text-accent" opacity={0.9} />
          <text
            textAnchor="middle"
            dy="2.5"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="system-ui,sans-serif"
            style={{ userSelect: 'none' }}
          >
            {index + 1}
          </text>
        </g>
      )}
    </>
  );
}
