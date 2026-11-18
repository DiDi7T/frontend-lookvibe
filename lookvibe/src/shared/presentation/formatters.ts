const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatDistance(kilometers: number): string {
  if (kilometers < 1) return `a ${Math.round(kilometers * 1000)} m`;
  return `a ${kilometers.toLocaleString('es-CO', { maximumFractionDigits: 1 })} km`;
}
