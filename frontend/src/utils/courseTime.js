export function adjustTimeZone(timeString, fromTimeZone, toTimeZone) {
  if (!timeString) {
    return '';
  }

  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setUTCHours(Number(hours), Number(minutes));
  const timeZoneDifference = toTimeZone - fromTimeZone;
  date.setUTCHours(date.getUTCHours() + timeZoneDifference);
  const adjustedHours = date.getUTCHours().toString().padStart(2, '0');
  const adjustedMinutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${adjustedHours}:${adjustedMinutes}`;
}

export function calculateTimeDifference(startTime, endTime) {
  if (!startTime || !endTime) {
    return 0;
  }
  const startDate = new Date(`2000-01-01T${startTime}`);
  const endDate = new Date(`2000-01-01T${endTime}`);
  const diffInMilliseconds = endDate - startDate;
  return diffInMilliseconds / (1000 * 60 * 60);
}
