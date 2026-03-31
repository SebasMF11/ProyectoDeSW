import { httpClient } from "./httpClient";

export const authRequest = (student: any) =>
  httpClient.post("student/auth", student);

export const loginRequest = (user: any) =>
  httpClient.post("student/register", user);
