import { httpClient } from "./httpClient";

export const dayCreateRequest = (day: any) =>
  httpClient.post("day/create", day);
