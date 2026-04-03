import { httpClient } from "./httpClient";

export const courseViewRequest = () => httpClient.get("course/view");

export const courseBySemesterRequest = (semesterName: string) =>
  httpClient.get(`course/view/${semesterName}`);

export const courseCreateRequest = (course: any) =>
  httpClient.post("course/create", course);
