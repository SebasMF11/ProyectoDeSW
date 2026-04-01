import { httpClient } from "./httpClient";

export const gradeCreateRequest = (grade: any) =>
  httpClient.post("grade/create", grade);
