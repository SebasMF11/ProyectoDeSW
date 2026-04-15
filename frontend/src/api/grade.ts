import { httpClient } from "./httpClient";

export const gradeCreateRequest = (grade: any) =>
  httpClient.post("grade/create", grade);

export const gradeByCourseRequest = (courseId: number) =>
  httpClient.get(`grade/view/course/${courseId}`);

export const currentGradeByCourseRequest = (courseId: number) =>
  httpClient.get(`grade/current/${courseId}`);

export const getSemesterAverageRequest = (semesterId: number) =>
  httpClient.get(`grade/average/${semesterId}`);
