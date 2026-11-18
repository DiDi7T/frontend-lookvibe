'use client';

import { useState } from 'react';

const LABELS = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-200">Tu calificación</legend>
      <div className="mt-2 flex items-center gap-3">
        <div role="radiogroup" aria-label="Calificación de 1 a 5 estrellas" className="flex" onMouseLeave={() => setHovered(0)}>
          {LABELS.map((label, index) => {
            const star = index + 1;
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={value === star}
                aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}: ${label}`}
                onClick={() => onChange(star)}
                onMouseEnter={() => setHovered(star)}
                className={`px-0.5 text-3xl leading-none transition ${star <= shown ? 'text-[#f59e0b]' : 'text-slate-600 hover:text-slate-400'}`}
              >
                ★
              </button>
            );
          })}
        </div>
        <span className="text-sm text-slate-400">{shown ? LABELS[shown - 1] : 'Elige de 1 a 5'}</span>
      </div>
    </fieldset>
  );
}
