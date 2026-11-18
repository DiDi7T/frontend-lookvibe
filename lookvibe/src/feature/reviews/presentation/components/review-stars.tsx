export function ReviewStars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} de 5 estrellas`} className="tracking-tight text-[#f59e0b]">
      {'★'.repeat(value)}
      <span className="text-slate-600">{'★'.repeat(5 - value)}</span>
    </span>
  );
}
