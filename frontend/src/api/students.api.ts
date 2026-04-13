import { httpClient } from "./httpClient";

export const authRequest = (student: any) =>
  httpClient.post("student/auth", student);

export const loginRequest = (credentials: any) =>
  httpClient.post("student/login", credentials);
