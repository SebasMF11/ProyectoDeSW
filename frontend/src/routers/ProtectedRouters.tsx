import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router";

const ProtectedRouters = ({ children }: { children: React.ReactNode }) => {
  const session = useAuth();
  if (session === undefined) return null;
  if (!session) return <Navigate to="/auth" />;
  return <div>{children}</div>;
};

export default ProtectedRouters;
