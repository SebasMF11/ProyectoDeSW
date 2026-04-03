import { httpClient } from "./httpClient";

export const assessmentBySemesterRequest = (semesterId: number) =>
  httpClient.get(`assessment/view/semester/${semesterId}`);

export const assessmentCreateRequest = (assessment: any) =>
  httpClient.post("assessment/create", assessment);
