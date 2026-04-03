import { httpClient } from "./httpClient";

export const courseViewRequest = () => httpClient.get("course/view");

export const courseBySemesterRequest = (semesterName: string) =>
  httpClient.get(`course/view/${semesterName}`);

export const courseCreateRequest = (course: any) =>
  httpClient.post("course/create", course);

export const courseUpdateRequest = (courseId: number, course: any) =>
  httpClient.put(`course/update/${courseId}`, course);

export const courseDeleteRequest = (courseId: number) =>
  httpClient.delete(`course/delete/${courseId}`);
