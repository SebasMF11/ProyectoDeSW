import axios from "axios";
import { supabase } from "../integrations/supabase";

export const httpClient = axios.create({
  baseURL: "http://localhost:3000/",
});

httpClient.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
