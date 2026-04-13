import { httpClient } from "./httpClient";

export const assessmentBySemesterRequest = (semesterId: number) =>
  httpClient.get(`assessment/view/semester/${semesterId}`);

export const assessmentCreateRequest = (assessment: any) =>
  httpClient.post("assessment/create", assessment);

export const assessmentsByMonthRequest = (year: number, month: number) => {
  const date = `${year}-${String(month).padStart(2, "0")}`;
  return httpClient.get(`assessment/view/month?date=${date}`);
};

export const assessmentsByDayRequest = (date: string) =>
  httpClient.get(`assessment/view/day?date=${date}`);
