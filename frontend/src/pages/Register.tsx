import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../api/auth";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import fondo from "../assets/FondoDePantalla.jpg";
const Registre = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const session = useAuth();
    if (session) navigate("/home");
  }, []);
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await authRequest(values);
    console.log(res);
    navigate("/auth");
    if (false) {
      setTimeout(() => navigate("/home"), 1000);
    }
  });
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div>
        <button type="button" onClick={() => navigate("/auth")}>
          Volver
        </button>
        <h1>Registre</h1>
      </div>
      <form onSubmit={onSubmit}>
        <input
          placeholder="name"
          type="text"
          {...register("name", { required: true })}
        />
        <input
          placeholder="lastname"
          type="text"
          {...register("lastname", { required: true })}
        />
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
        <input
          placeholder="password2"
          type="password"
          {...register("password2", { required: true })}
        />
        <button type="submit">Registre</button>
      </form>
    </div>
  );
};
export default Registre;
