import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { loginRequest } from "../api/auth";
import { supabase } from "../integrations/supabase";
import fondo from "../assets/FondoDePantalla.jpg";
import logo from "../assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const session = useAuth();
  useEffect(() => {
    if (session) navigate("/home");
  }, []);
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      console.error(error);
      return;
    }
    const res = await loginRequest(data.user);
    console.log(res);
    navigate("/home");
  });
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      {/* Fondo */}
      <img
        src={fondo}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-md bg-white/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-44" />

          <p className="text-2xl font-bold text-black">Iniciar Sesión</p>

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            <input
              placeholder="Correo"
              type="email"
              {...register("email", { required: true })}
              className="w-full px-4 py-3 rounded-full bg-white/70 outline-none text-black"
            />

            <input
              placeholder="Contraseña"
              type="password"
              {...register("password", { required: true })}
              className="w-full px-4 py-3 rounded-full bg-white/70 outline-none text-black"
            />

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-4 font-semibold transition mx-auto block"
            >
              Ingresar
            </button>
          </form>

          <p className="text-sm text-gray-800">
            ¿No tienes cuenta?{" "}
            <span
              className="underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
