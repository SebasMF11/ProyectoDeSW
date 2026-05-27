import { httpClient } from "./httpClient";

export const dayCreateRequest = (day: any) =>
  httpClient.post("day/create", day);

export const dayViewRequest = (courseId: string) =>
  httpClient.get(`day/view/${courseId}`);
