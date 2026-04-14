'use client';

// SVG note icons that work in all browsers
function WholeNote() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="inline-block align-middle">
      <ellipse cx="14" cy="14" rx="10" ry="7" fill="none" stroke="currentColor" strokeWidth="2.5" transform="rotate(-15, 14, 14)" />
    </svg>
  );
}

function HalfNote() {
  return (
    <svg width="20" height="44" viewBox="0 0 20 44" className="inline-block align-middle">
      <ellipse cx="10" cy="36" rx="9" ry="7" fill="none" stroke="currentColor" strokeWidth="2.5" transform="rotate(-15, 10, 36)" />
      <line x1="18" y1="36" x2="18" y2="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function QuarterNote() {
  return (
    <svg width="20" height="44" viewBox="0 0 20 44" className="inline-block align-middle">
      <ellipse cx="10" cy="36" rx="9" ry="7" fill="currentColor" transform="rotate(-15, 10, 36)" />
      <line x1="18" y1="36" x2="18" y2="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EighthNote() {
  return (
    <svg width="24" height="44" viewBox="0 0 24 44" className="inline-block align-middle">
      <ellipse cx="10" cy="36" rx="9" ry="7" fill="currentColor" transform="rotate(-15, 10, 36)" />
      <line x1="18" y1="36" x2="18" y2="4" stroke="currentColor" strokeWidth="2" />
      <path d="M18 4 Q22 10 20 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function EighthNotePair() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" className="inline-block align-middle">
      <ellipse cx="9" cy="36" rx="8" ry="6" fill="currentColor" transform="rotate(-15, 9, 36)" />
      <line x1="16" y1="36" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="27" cy="36" rx="8" ry="6" fill="currentColor" transform="rotate(-15, 27, 36)" />
      <line x1="34" y1="36" x2="34" y2="6" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="6" x2="34" y2="6" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function DottedQuarterNote() {
  return (
    <svg width="28" height="44" viewBox="0 0 28 44" className="inline-block align-middle">
      <ellipse cx="10" cy="36" rx="9" ry="7" fill="currentColor" transform="rotate(-15, 10, 36)" />
      <line x1="18" y1="36" x2="18" y2="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="38" r="2.5" fill="currentColor" />
    </svg>
  );
}

// Build visual representation from a pattern
export function patternToVisual(pattern: number[]): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let i = 0;
  let idx = 0;
  while (i < pattern.length) {
    const val = pattern[i];
    if (val === 4) {
      elements.push(<WholeNote key={idx++} />);
    } else if (val === 2) {
      elements.push(<HalfNote key={idx++} />);
    } else if (val === 1.5) {
      elements.push(<DottedQuarterNote key={idx++} />);
    } else if (val === 1) {
      elements.push(<QuarterNote key={idx++} />);
    } else if (val === 0.5) {
      // Pair consecutive eighths with a beam
      if (i + 1 < pattern.length && pattern[i + 1] === 0.5) {
        elements.push(<EighthNotePair key={idx++} />);
        i += 2;
        continue;
      } else {
        elements.push(<EighthNote key={idx++} />);
      }
    }
    i++;
  }
  return elements;
}

export default function RhythmDisplay({ pattern }: { pattern: number[] }) {
  return (
    <div className="flex items-end justify-center gap-2 text-gray-800 py-2">
      {patternToVisual(pattern)}
    </div>
  );
}
