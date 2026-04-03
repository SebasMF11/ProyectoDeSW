import { httpClient } from "./httpClient";

export const semesterViewRequest = () => httpClient.get("semester/view");

export const semesterCreateRequest = (semester: any) =>
  httpClient.post("semester/create", semester);
