import { httpClient } from "./httpClient";

export const gradeCreateRequest = (grade: any) =>
  httpClient.post("grade/create", grade);

export const gradeByCourseRequest = (courseId: string) =>
  httpClient.get(`grade/view/course/${courseId}`);

export const currentGradeByCourseRequest = (courseId: string) =>
  httpClient.get(`grade/current/${courseId}`);

export const getSemesterAverageRequest = (semesterId: string) =>
  httpClient.get(`grade/average/${semesterId}`);
