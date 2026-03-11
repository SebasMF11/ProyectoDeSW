import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import Registre from "../pages/Registre";
import Auth from "../pages/Auth";
import ProtectedRouters from "./ProtectedRouters";

const AppRouters = () => {
  return (
    <div>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/registre" element={<Registre />} />
        <Route
          path="/home"
          element={
            <ProtectedRouters>
              <Home />
            </ProtectedRouters>
          }
        />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default AppRouters;
