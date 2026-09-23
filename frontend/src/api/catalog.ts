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
  const params = facultyId ? `?facultyId=${encodeURIComponent(facultyId)}` : "";
  return httpClient.get(`catalog/courses/available${params}`);
};

/**
 * Mutaciones administrativas de materias en el catálogo universitario.
 * Requieren permisos de administrador (adminMiddleware en backend).
 */
export const createCatalogCourseRequest = (data: {
  name: string;
  faculty_id: string;
  prerequisito?: string | null;
}) => httpClient.post("catalog/courses", data);

export const updateCatalogCourseRequest = (
  id: string,
  data: {
    name?: string;
    faculty_id?: string;
    prerequisito?: string | null;
  },
) => httpClient.put(`catalog/courses/${id}`, data);

export const deleteCatalogCourseRequest = (id: string) =>
  httpClient.delete(`catalog/courses/${id}`);
