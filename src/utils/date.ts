export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : "-";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = (date.getFullYear() % 100).toString().padStart(2, "0");

  return `${day}/${month}/${year}`;
}

export function parseFormattedDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;

  if (typeof dateStr === 'string' && dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);

      if (year < 100) {
        year += 2000;
      }

      const date = new Date(year, month, day, 12, 0, 0);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

export function formatDateForAPI(dateInput?: string | Date | null): string | undefined {
  if (!dateInput) return undefined;
  const date = dateInput instanceof Date ? dateInput : parseFormattedDate(dateInput);
  if (!date || isNaN(date.getTime())) return undefined;

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Return a full ISO 8601-like string that preserves the LOCAL date and time
  // instead of converting to UTC. This satisfies server validation while maintaining
  // the user's selected date/time values in the payload string.
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}
