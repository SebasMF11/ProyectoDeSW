import { httpClient } from "./httpClient";

export const gradeCreateRequest = (grade: any) =>
  httpClient.post("grade/create", grade);

export const gradeByCourseRequest = (courseId: number) =>
  httpClient.get(`grade/view/course/${courseId}`);
