/**
 * ARCHIVO: httpClient.ts
 * PROPÓSITO: Cliente HTTP centralizado para todas las peticiones a la API
 *
 * CARACTERÍSTICAS:
 * - Base URL apunta al backend en http://localhost:3000/
 * - Integración con Supabase para gestión de autenticación
 * - Interceptor de peticiones que:
 *   * Obtiene el token JWT actual de Supabase
 *   * Refresca el token si está a punto de expirar (60 segundos)
 *   * Agrega el token Bearer a todas las peticiones autenticadas
 *
 * FLUJO:
 * 1. Cuando se hace una petición, el interceptor se ejecuta
 * 2. Obtiene la sesión actual de Supabase
 * 3. Verifica si el token vence pronto (< 60 segundos)
 * 4. Si vence, intenta refrescarlo
 * 5. Agrega el token actualizado en el header Authorization
 * 6. Envía la petición con autenticación
 */

import axios from "axios";
import { supabase } from "../integrations/supabase";

// Crear instancia de axios con configuración base
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";
export const httpClient = axios.create({
  baseURL,
});

// INTERCEPTOR: Maneja autenticación automática en todas las peticiones
httpClient.interceptors.request.use(
  async (config) => {
    // Obtenemos la sesión actual para acceder al token JWT más reciente
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let accessToken = session?.access_token;

    // Verificar si el token está por expirar (menos de 60 segundos)
    if (session?.expires_at) {
      const expiresAtMs = session.expires_at * 1000;
      const isExpiredOrCloseToExpire = Date.now() >= expiresAtMs - 60000;

      // Si el token vence pronto, intentamos actualizarlo
      if (isExpiredOrCloseToExpire) {
        const { data, error } = await supabase.auth.refreshSession();

        // Si el refresh es exitoso, usamos el nuevo token
        if (!error && data.session?.access_token) {
          accessToken = data.session.access_token;
        }
      }
    }

    // Agregar token Bearer a todas las peticiones autenticadas
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
