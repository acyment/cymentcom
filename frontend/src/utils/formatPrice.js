const formatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return '';
  }

  return formatter.format(Math.round(num));
}
