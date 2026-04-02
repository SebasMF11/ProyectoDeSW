import axios from "axios";
import { supabase } from "../integrations/supabase";

export const httpClient = axios.create({
  baseURL: "http://localhost:3000/",
});

httpClient.interceptors.request.use(
  async (config) => {
    // Leemos la sesion actual para obtener el access token mas reciente.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let accessToken = session?.access_token;

    // Si el token esta por expirar, intentamos refrescarlo antes de enviar la peticion.
    if (session?.expires_at) {
      const expiresAtMs = session.expires_at * 1000;
      const isExpiredOrCloseToExpire = Date.now() >= expiresAtMs - 60000;

      if (isExpiredOrCloseToExpire) {
        const { data, error } = await supabase.auth.refreshSession();

        // Si el refresh funciona, usamos el nuevo token en lugar del anterior.
        if (!error && data.session?.access_token) {
          accessToken = data.session.access_token;
        }
      }
    }

    // Agregamos el bearer token a todas las peticiones autenticadas.
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
