import axios from "axios";

const API = "http://localhost:3000/";

export const authRequest = (student: any) =>
  axios.post(`${API}student/auth`, student);

export const loginRequest = (user: any) =>
  axios.post(`${API}student/register`, user);
