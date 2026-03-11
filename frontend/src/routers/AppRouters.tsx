import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Auth from "../pages/Auth";
import ProtectedRouters from "./ProtectedRouters";

const AppRouters = () => {
  return (
    <div>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
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
