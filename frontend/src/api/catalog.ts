import { httpClient } from "./httpClient";

export const careersRequest = () => httpClient.get("catalog/careers");

export const facultiesRequest = () => httpClient.get("catalog/faculties");

export const coursesCatalogRequest = () => httpClient.get("catalog/courses");

export const coursesCatalogByCareerRequest = (careerId: string) =>
  httpClient.get(`catalog/courses/career/${careerId}`);

export const coursesCatalogByFacultyRequest = (facultyId: string) =>
  httpClient.get(`catalog/courses/faculty/${facultyId}`);

/**
 * Materias disponibles para el estudiante autenticado.
 * Filtra por carrera, excluye las ya activas/completadas y resuelve prerequisitos.
 * @param facultyId - UUID de facultad para filtrar (opcional)
 */
export const availableCoursesRequest = (facultyId?: string) => {
  const params = facultyId ? `?facultyId=${facultyId}` : "";
  return httpClient.get(`catalog/courses/available${params}`);
};
