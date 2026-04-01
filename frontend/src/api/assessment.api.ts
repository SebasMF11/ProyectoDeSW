import { httpClient } from "./httpClient";

export const assessmentCreateRequest = (assessment: any) =>
  httpClient.post("assessment/create", assessment);
