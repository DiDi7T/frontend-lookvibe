interface StylistPhotoProps {
  name: string;
  initials: string;
  photoUrl: string | null;
}

export function StylistPhoto({ name, initials, photoUrl }: StylistPhotoProps) {
  return (
    <div className="relative size-36 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-[#10b981]/15 sm:size-44">
      <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-emerald-300">
        {initials}
      </span>
      {photoUrl && (
        <span
          role="img"
          aria-label={`Foto de ${name}`}
          style={{ backgroundImage: `url("${photoUrl}")` }}
          className="absolute inset-0 bg-cover bg-center"
        />
      )}
    </div>
  );
}
