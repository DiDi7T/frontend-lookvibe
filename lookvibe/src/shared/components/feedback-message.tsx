interface FeedbackMessageProps {
  type: 'error' | 'success';
  message: string | null;
}

export function FeedbackMessage({ type, message }: FeedbackMessageProps) {
  if (!message) return null;
  if (type === 'error') {
    return (
      <p role="alert" className="mt-5 rounded-xl border border-red-300/25 bg-red-950/30 p-4 text-sm text-red-200">
        {message}
      </p>
    );
  }
  return (
    <p role="status" className="mt-5 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-4 text-sm text-emerald-200">
      {message}
    </p>
  );
}
