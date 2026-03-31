import { httpClient } from "./httpClient";

export const academicPeriodRequest = (academicPeriod: any) =>
  httpClient.post("academicPeriod", academicPeriod);
