'use client';

import { useState, type FormEvent } from 'react';
import { inputClassName } from '../../../../shared/components/form-field';
import { REVIEW_COMMENT_MAX_LENGTH } from '../../domain/value-objects/review-draft';
import { StarRatingInput } from './star-rating-input';

export interface ReviewFormValues {
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  title: string;
  sending: boolean;
  error: string | null;
  onSubmit: (values: ReviewFormValues) => Promise<boolean>;
  onCancel: () => void;
}

export function ReviewForm({ title, sending, error, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ rating, comment });
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-2xl border border-[#f59e0b]/25 bg-[#0f172a] p-4">
      <h3 className="font-display font-semibold">{title}</h3>
      <StarRatingInput value={rating} onChange={setRating} />
      <label className="block">
        <span className="text-sm font-semibold text-slate-200">Tu comentario</span>
        <textarea
          required
          rows={3}
          maxLength={REVIEW_COMMENT_MAX_LENGTH}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="¿Cómo te atendieron? ¿Volverías?"
          className={`${inputClassName} mt-2 resize-y`}
        />
        <span className="mt-1 block text-right text-xs text-slate-500">
          {comment.length}/{REVIEW_COMMENT_MAX_LENGTH}
        </span>
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-300/25 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
        >
          Ahora no
        </button>
        <button
          type="submit"
          disabled={sending}
          className="flex-1 rounded-xl bg-[#f59e0b] px-3 py-2.5 text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
        >
          {sending ? 'Publicando…' : 'Publicar reseña'}
        </button>
      </div>
    </form>
  );
}
