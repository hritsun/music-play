'use client';

import { NOTE_NAMES } from '@/lib/notes';

interface StaffProps {
  note?: string; // e.g. 'C4', 'D#5'
  clef?: 'treble' | 'bass';
  showName?: boolean;
}

// Vertical position of notes on treble clef staff (C4 = middle C, below staff)
// Each step = one line/space. 0 = bottom line (E4), positive = up
function getNotePosition(noteStr: string): number {
  const match = noteStr.match(/^([A-G]#?)(\d)$/);
  if (!match) return 0;
  const [, name, octStr] = match;
  const octave = parseInt(octStr);

  // Diatonic scale positions (C=0, D=1, E=2, F=3, G=4, A=5, B=6)
  const baseName = name.replace('#', '');
  const diatonicIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(baseName);

  // Middle C (C4) position relative to treble clef bottom line (E4)
  // E4 = position 0 (bottom line)
  // C4 = 2 steps below = -2
  const c4Position = -2;
  const position = c4Position + diatonicIndex + (octave - 4) * 7;

  return position;
}

export default function Staff({ note, clef = 'treble', showName = false }: StaffProps) {
  const staffLines = 5;
  const lineSpacing = 16;
  const staffHeight = (staffLines - 1) * lineSpacing;
  const padding = 60;
  const totalHeight = staffHeight + padding * 2;
  const width = 200;

  const notePos = note ? getNotePosition(note) : null;
  const isSharp = note?.includes('#');

  // Position from bottom of staff: pos 0 = bottom line (E4)
  const noteY = notePos !== null ? padding + staffHeight - notePos * (lineSpacing / 2) : 0;

  // Ledger lines needed
  const ledgerLines: number[] = [];
  if (notePos !== null) {
    // Below staff (position < 0)
    for (let p = -2; p >= notePos; p -= 2) {
      ledgerLines.push(padding + staffHeight - p * (lineSpacing / 2));
    }
    // Above staff (position > 8)
    for (let p = 10; p <= notePos; p += 2) {
      ledgerLines.push(padding + staffHeight - p * (lineSpacing / 2));
    }
  }

  return (
    <svg viewBox={`0 0 ${width} ${totalHeight}`} className="w-full max-w-[200px] h-auto">
      {/* Staff lines */}
      {Array.from({ length: staffLines }).map((_, i) => (
        <line
          key={i}
          x1={20}
          y1={padding + i * lineSpacing}
          x2={width - 20}
          y2={padding + i * lineSpacing}
          stroke="#333"
          strokeWidth={1.5}
        />
      ))}

      {/* Treble clef symbol */}
      <text x={25} y={padding + staffHeight / 2 + 14} fontSize={48} fill="#333">
        {clef === 'treble' ? '\u{1D11E}' : '\u{1D122}'}
      </text>

      {/* Ledger lines */}
      {ledgerLines.map((y, i) => (
        <line key={`ledger-${i}`} x1={110} y1={y} x2={150} y2={y} stroke="#333" strokeWidth={1.5} />
      ))}

      {/* Note */}
      {notePos !== null && (
        <>
          {/* Sharp symbol */}
          {isSharp && (
            <text x={105} y={noteY + 6} fontSize={18} fill="#333" fontWeight="bold">
              #
            </text>
          )}
          {/* Note head */}
          <ellipse
            cx={130}
            cy={noteY}
            rx={9}
            ry={7}
            fill="#333"
            transform={`rotate(-15, 130, ${noteY})`}
          />
          {/* Stem */}
          <line
            x1={notePos < 4 ? 138 : 122}
            y1={noteY}
            x2={notePos < 4 ? 138 : 122}
            y2={notePos < 4 ? noteY - 40 : noteY + 40}
            stroke="#333"
            strokeWidth={2}
          />
        </>
      )}

      {/* Note name */}
      {showName && note && (
        <text x={130} y={totalHeight - 10} fontSize={14} fill="#666" textAnchor="middle" fontWeight="bold">
          {note}
        </text>
      )}
    </svg>
  );
}
