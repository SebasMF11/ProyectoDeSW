/**
 * ARCHIVO: useAuth.ts
 * PROPÓSITO: Custom hook para gestionar autenticación
 *
 * RESPONSABILIDADES:
 * - Cargar sesión actual de Supabase al montar el componente
 * - Escuchar cambios en el estado de autenticación (login/logout)
 * - Retornar la sesión actual o null si no está autenticado
 * - Limpiar suscripciones al desmontar el componente
 *
 * ESTADOS:
 * - undefined: Cargando sesión (inicial)
 * - Session: Usuario autenticado con datos del usuario
 * - null: Usuario no autenticado
 *
 * CONSUMO:
 * const session = useAuth();
 * if (session === undefined) return <LoadingSpinner />; // Cargando
 * if (!session) return <Navigate to="/auth" />; // No autenticado
 * // Usuario autenticado con session.user.id, email, etc.
 */

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase";

const useAuth = () => {
  // Estado de la sesion: undefined (cargando), Session (autenticado), null (no autenticado)
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // Evita actualizar el estado si el componente ya se desmontó.
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (isMounted) setSession(currentSession ?? null);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return session;
};

export default useAuth;
