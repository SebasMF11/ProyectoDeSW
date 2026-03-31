import { httpClient } from "./httpClient";

export const courseRequest = (course: any) => httpClient.post("course", course);

export const courseDaysRequest = (courseDay: any) =>
  httpClient.post("courseDay", courseDay);
