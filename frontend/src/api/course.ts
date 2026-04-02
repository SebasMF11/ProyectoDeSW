import { httpClient } from "./httpClient";

export const courseCreateRequest = (course: any) =>
  httpClient.post("course/create", course);

export const courseGetAllRequest = () => httpClient.get("course/view");
