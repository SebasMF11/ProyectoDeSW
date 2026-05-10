import { httpClient } from "./httpClient";

export const courseViewRequest = () => httpClient.get("course/view");

export const courseBySemesterRequest = (semesterName: string) =>
  httpClient.get(`course/view/${semesterName}`);

export const courseCreateRequest = (course: any) =>
  httpClient.post("course/create", course);

export const courseUpdateRequest = (courseId: string, course: any) =>
  httpClient.put(`course/update/${courseId}`, course);

export const courseDeleteRequest = (courseId: string) =>
  httpClient.delete(`course/delete/${courseId}`);

export const courseStatusRequest = (courseId: string, status: string) =>
  httpClient.put(`course/status/${courseId}`, { status });
