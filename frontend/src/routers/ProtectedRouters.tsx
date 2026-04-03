/**
 * ARCHIVO: ProtectedRouters.tsx
 * PROPÓSITO: Componente wrapper que protege rutas con autenticación
 *
 * RESPONSABILIDADES:
 * - Verificar si el usuario está autenticado (usando useAuth hook)
 * - Bloquear acceso a rutas protegidas si no hay sesión
 * - Mostrar navbar de navegación si está autenticado
 *
 * FLUJO:
 * 1. Llamar useAuth hook para obtener sesión actual
 * 2. Si no hay información (undefined), mostrar null (cargando)
 * 3. Si no hay sesión válida, redirigir a /auth
 * 4. Si está autenticado, mostrar navbar + contenido de la página
 *
 * CONSUMO:
 * Envuelve componentes de página en <ProtectedRouters><Page /></ProtectedRouters>
 */

import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router";
import Navbar from "../components/navbar";

const ProtectedRouters = ({ children }: { children: React.ReactNode }) => {
  // Obtener sesión actual del hook de autenticación
  const session = useAuth();

  // Si aún está cargando (undefined), no renderizar nada
  if (session === undefined) return null;

  // Si no hay sesión autenticada, redirigir a login
  if (!session) return <Navigate to="/auth" />;

  // Si está autenticado, mostrar navbar + contenido
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default ProtectedRouters;
