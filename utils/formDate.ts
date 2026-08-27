// utils/formDate.ts

/**
 * Recibe un Date (de la DB) o un String y extrae la fecha exacta en UTC
 * evitando cualquier desfase por la zona horaria del servidor o del cliente.
 */
export function formatDate(input: Date | string | null | undefined): string {
  if (!input) return "";

  if (input instanceof Date) {
    const year = input.getUTCFullYear();
    const month = String(input.getUTCMonth() + 1).padStart(2, "0");
    const day = String(input.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Si ya es un string (ej: "2026-08-26T00:00:00.000Z" o "2026-08-26")
  const cleanStr = String(input).split("T")[0].split(" ")[0];
  const parts = cleanStr.split("-");

  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return String(input);
}

/**
 * Muestra "26/08/2026" directamente desde la cadena limpia
 */
export function formatDateDisplay(
  input: Date | string | null | undefined,
): string {
  const normalized = formatDate(input);
  if (!normalized) return "";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Muestra "26/08" para gráficos o badges
 */
export function formatShortDate(
  input: Date | string | null | undefined,
): string {
  const normalized = formatDate(input);
  if (!normalized) return "";
  const [, month, day] = normalized.split("-");
  return `${day}/${month}`;
}

/**
 * Retorna la fecha local actual del cliente en formato "YYYY-MM-DD"
 * ideal para inicializar campos de tipo <input type="date" />.
 */
export function getTodayInputDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
