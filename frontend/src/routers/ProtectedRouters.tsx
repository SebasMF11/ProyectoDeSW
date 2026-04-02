import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router";
import Navbar from "../components/navbar";

const ProtectedRouters = ({ children }: { children: React.ReactNode }) => {
  const session = useAuth();
  if (session === undefined) return null;
  if (!session) return <Navigate to="/auth" />;
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default ProtectedRouters;
