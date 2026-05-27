export const parseDateToLocal = (dateValue?: string): Date | null => {
  if (!dateValue) return null;

  // If the string is a simple date like '2026-05-28', treat it as local
  // to avoid UTC-based shifts (new Date('YYYY-MM-DD') is parsed as UTC).
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
  if (dateOnlyMatch) {
    const [y, m, d] = dateValue.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // If the string is an ISO datetime at midnight (UTC or with offset),
  // treat it as a local date to avoid shifting to the previous day in
  // negative time zones. Examples: '2026-06-10T00:00:00Z'
  const isoMidnightMatch = /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(
    dateValue,
  );
  if (isoMidnightMatch) {
    const [y, m, d] = dateValue.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const formatDateLocal = (
  dateValue?: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const parsed = parseDateToLocal(dateValue);
  if (!parsed) return dateValue ?? "No date";

  // Default to English (US) formatting unless a locale is provided.
  return new Intl.DateTimeFormat("en-US", options ?? { month: "long", day: "numeric" }).format(parsed);
};

export const getLocalDateKey = (dateValue: Date) =>
  `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(dateValue.getDate()).padStart(2, "0")}`;

export const formatDateForInput = (dateValue?: string) => {
  const parsed = parseDateToLocal(dateValue);
  if (!parsed) return "";
  return getLocalDateKey(parsed);
};

export default {
  parseDateToLocal,
  formatDateLocal,
  getLocalDateKey,
  formatDateForInput,
};
// Convierte una fecha a un valor numerico comparable para ordenar semestres y cursos.
// Si la fecha no existe o es invalida, devuelve el valor mas bajo posible para que
// esos registros queden al final del ordenamiento.
export const toSortableTimestamp = (dateValue?: string) => {
  const parsedDate = Date.parse(dateValue ?? "");
  return Number.isNaN(parsedDate) ? Number.NEGATIVE_INFINITY : parsedDate;
};
