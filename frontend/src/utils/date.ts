// Convierte una fecha a un valor numerico comparable para ordenar semestres y cursos.
// Si la fecha no existe o es invalida, devuelve el valor mas bajo posible para que
// esos registros queden al final del ordenamiento.
export const toSortableTimestamp = (dateValue?: string) => {
  const parsedDate = Date.parse(dateValue ?? "");
  return Number.isNaN(parsedDate) ? Number.NEGATIVE_INFINITY : parsedDate;
};
