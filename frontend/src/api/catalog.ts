import { httpClient } from "./httpClient";

export const careersRequest = () => httpClient.get("catalog/careers");

export const facultiesRequest = () => httpClient.get("catalog/faculties");

export const coursesCatalogRequest = () => httpClient.get("catalog/courses");

export const coursesCatalogByCareerRequest = (careerId: string) =>
  httpClient.get(`catalog/courses/career/${careerId}`);

export const coursesCatalogByFacultyRequest = (facultyId: string) =>
  httpClient.get(`catalog/courses/faculty/${facultyId}`);
