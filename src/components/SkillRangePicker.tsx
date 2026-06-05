import React, { useRef } from 'react';
import { SkillLevel, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../types';

export default function SkillRangePicker({ min, max, onChange }: {
  min: SkillLevel;
  max: SkillLevel;
  onChange: (min: SkillLevel, max: SkillLevel) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'min' | 'max' | null>(null);
  const N = SKILL_LEVELS.length - 1;
  const minIdx = SKILL_LEVELS.indexOf(min);
  const maxIdx = SKILL_LEVELS.indexOf(max);

  const idxFromX = (clientX: number) => {
    if (!trackRef.current) return 0;
    const { left, width } = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(N, Math.round(((clientX - left) / width) * N)));
  };

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging.current) return;
    const i = idxFromX(e.clientX);
    if (i <= minIdx) onChange(SKILL_LEVELS[i], max);
    else if (i >= maxIdx) onChange(min, SKILL_LEVELS[i]);
    else if (i - minIdx <= maxIdx - i) onChange(SKILL_LEVELS[i], max);
    else onChange(min, SKILL_LEVELS[i]);
  };

  const mkPointerDown = (which: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dragging.current = which;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const mkPointerMove = (which: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== which) return;
    const i = idxFromX(e.clientX);
    if (which === 'min') onChange(SKILL_LEVELS[Math.min(i, maxIdx)], max);
    else onChange(min, SKILL_LEVELS[Math.max(i, minIdx)]);
  };

  const onPointerUp = () => { dragging.current = null; };

  return (
    <div className="space-y-3">
      <div ref={trackRef} className="relative h-5 cursor-pointer" onClick={onTrackClick}>
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-px bg-outline-variant/40" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary-fixed"
          style={{ left: `${(minIdx / N) * 100}%`, right: `${((N - maxIdx) / N) * 100}%` }}
        />
        {SKILL_LEVELS.map((tier, i) => {
          if (i === minIdx || i === maxIdx) return null;
          return (
            <div
              key={tier}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full pointer-events-none ${
                i > minIdx && i < maxIdx ? 'bg-primary-fixed/60' : 'bg-outline-variant/50'
              }`}
              style={{ left: `${(i / N) * 100}%` }}
            />
          );
        })}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary-fixed border-2 border-background shadow-[0_0_0_3px_rgba(202,243,0,0.2),0_2px_6px_rgba(0,0,0,0.4)] z-20 cursor-grab active:cursor-grabbing touch-none select-none"
          style={{ left: `${(minIdx / N) * 100}%` }}
          onPointerDown={mkPointerDown('min')}
          onPointerMove={mkPointerMove('min')}
          onPointerUp={onPointerUp}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary-fixed border-2 border-background shadow-[0_0_0_3px_rgba(202,243,0,0.2),0_2px_6px_rgba(0,0,0,0.4)] z-20 cursor-grab active:cursor-grabbing touch-none select-none"
          style={{ left: `${(maxIdx / N) * 100}%` }}
          onPointerDown={mkPointerDown('max')}
          onPointerMove={mkPointerMove('max')}
          onPointerUp={onPointerUp}
        />
      </div>
      <div className="relative h-4" style={{ overflow: 'visible' }}>
        {SKILL_LEVELS.map((tier, i) => (
          <span
            key={tier}
            className={`absolute -translate-x-1/2 font-mono text-[9px] uppercase tracking-wide leading-none whitespace-nowrap ${
              i >= minIdx && i <= maxIdx ? 'text-primary-fixed font-bold' : 'text-on-surface-variant/40'
            }`}
            style={{ left: `${(i / N) * 100}%`, top: 0 }}
          >
            {SKILL_LEVEL_LABELS[tier]}
          </span>
        ))}
      </div>
    </div>
  );
}
