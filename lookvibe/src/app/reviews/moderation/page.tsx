import type { Metadata } from 'next';
import { ReviewModerationBoard } from '../../../feature/reviews/presentation/components/review-moderation-board';

export const metadata: Metadata = {
  title: 'Moderar reseñas | LookVibe',
  description: 'Revisa las reseñas reportadas y elimina las que incumplan las políticas.',
};

export default function ReviewModerationPage() {
  return <ReviewModerationBoard />;
}
