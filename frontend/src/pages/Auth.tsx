import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { registerRequest } from "../api/auth";
import useAuth from "../hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const session = useAuth();
    if (session) navigate("/home");
  }, []);

  const Registre = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const onSubmit = handleSubmit(async (values) => {
      console.log(values);
      const res = await registerRequest(values);
      console.log(res);
      if (false) {
        setTimeout(() => navigate("/home"), 1000);
      }
    });
      setTimeout(() => navigate("/home"), 1000);
   
  };
  return (
    <div>
      {loading && <p>Cargando...</p>}
      <div>
        <div>
          <p>Si no tienes cuenta </p>
          <button type="button" onClick={() => navigate("/register")}>
            REGISTRESE
          </button>
        </div>
        <h1>Login</h1>
      </div>
      <form onSubmit={onSubmit}>
        <input
          placeholder="email"
          type="email"
          {...register("email", { required: true })}
        />
        <input
          placeholder="password"
          type="password"
          {...register("password", { required: true })}
        />
        
        <button type="submit">Registre</button>
      </form>
    </div>
  );
};

export default Auth;
