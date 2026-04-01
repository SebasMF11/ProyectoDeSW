import { httpClient } from "./httpClient";

export const semesterCreateRequest = (semester: any) =>
  httpClient.post("semester/create", semester);
