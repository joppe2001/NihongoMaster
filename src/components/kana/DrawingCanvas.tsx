import { useRef, useState, useCallback, useEffect } from 'react';
import { getStrokeData } from '@/data/strokeData';

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  character: string;
  size?: number;
  showGuide?: boolean;
  onStrokeComplete?: (strokeCount: number) => void;
}

export function DrawingCanvas({
  character,
  size = 280,
  showGuide: initialShowGuide = true,
  onStrokeComplete,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [showGuide, setShowGuide] = useState(initialShowGuide);

  const strokeData = getStrokeData(character);
  const totalStrokes = strokeData?.strokes.length ?? 0;

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = 'var(--color-bg-primary, #ffffff)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (light cross)
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.15)';
    ctx.lineWidth = 1 * dpr;
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    // Vertical center
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Guide: font character at low opacity
    if (showGuide) {
      ctx.globalAlpha = 0.1;
      ctx.font = `${size * 0.75 * dpr}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'currentColor';
      // Use a more universal approach for color
      const computedStyle = getComputedStyle(canvas);
      ctx.fillStyle = computedStyle.color || '#333';
      ctx.fillText(character, canvas.width / 2, canvas.height / 2 + size * 0.05 * dpr);
      ctx.globalAlpha = 1;
    }

    // Draw completed strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke, dpr);
    }

    // Draw current stroke
    if (currentStroke.length > 0) {
      drawStroke(ctx, currentStroke, dpr);
    }
  }, [strokes, currentStroke, showGuide, character, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    redraw();
  }, [size, redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Reset on character change
  useEffect(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setIsDrawing(false);
  }, [character]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * dpr,
        y: (touch.clientY - rect.top) * dpr,
      };
    }
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
    };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    setIsDrawing(true);
    setCurrentStroke([pos]);
  }, [getPos]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    setCurrentStroke((prev) => [...prev, pos]);
  }, [isDrawing, getPos]);

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      onStrokeComplete?.(newStrokes.length);
    }
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, strokes, onStrokeComplete]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
  }, []);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        className="border-2 border-border rounded-xl cursor-crosshair touch-none text-text-primary"
        style={{ width: size, height: size }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={handleClear}
          className="px-3 py-1 text-xs rounded-lg bg-bg-muted text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="px-3 py-1 text-xs rounded-lg bg-bg-muted text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-30"
        >
          Undo
        </button>
        <button
          onClick={() => setShowGuide((g) => !g)}
          className="px-3 py-1 text-xs rounded-lg bg-bg-muted text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {showGuide ? 'Hide' : 'Show'} Guide
        </button>
        <span className="text-[10px] text-text-secondary">
          Stroke {strokes.length}{totalStrokes > 0 ? ` / ${totalStrokes}` : ''}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Draw a smooth stroke on the canvas
// ─────────────────────────────────────────────────────────────

function drawStroke(ctx: CanvasRenderingContext2D, points: Point[], dpr: number) {
  if (points.length < 2) return;

  ctx.strokeStyle = 'currentColor';
  ctx.lineWidth = 4 * dpr;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // Use quadratic curves for smooth lines
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }

  // Draw to the last point
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}
