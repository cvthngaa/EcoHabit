export function getTodayInVietnam(): string {
  const now = new Date();
  const vietnamOffsetMinutes = 7 * 60;
  const vietnamTime = new Date(
    now.getTime() + (vietnamOffsetMinutes + now.getTimezoneOffset()) * 60000,
  );

  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
