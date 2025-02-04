export function formatPrice(numStr) {
  // Convert the string to a number
  const num = parseFloat(numStr);

  // If the conversion fails, return a fallback (empty string or an error message)
  if (isNaN(num)) {
    return '';
  }

  // Check if the number is an integer (no decimals)
  if (Number.isInteger(num)) {
    // Format with no decimals and append a ",-" at the end.
    // Using the 'de-DE' locale gives us a period as the thousands separator.
    return num.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ',-';
  } else {
    // Format the number with exactly two decimals.
    return num.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
