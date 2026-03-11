import axios from "axios";

const API = "http://localhost:3000/";

export const registerRequest = (student: any) =>
  axios.post(`${API}student/create`, student);
  