import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../api/auth";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import fondo from "../assets/FondoDePantalla.jpg";
import logo from "../assets/logo.png";
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
      {/* Fondo */}
      <img
        src={fondo}
        alt="fondo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-md bg-white/40 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <img src={logo} alt="logo" className="w-44" />

          {/* Títulos */}
          <p className="text-2xl font-bold text-black">Crear cuenta</p>

          {/* FORMULARIO */}
          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            {/* Nombre */}
            <input
              placeholder="Nombre Completo"
              type="text"
              {...register("name", { required: true })}
              className="w-full px-4 py-3 rounded-full bg-white/70 outline-none text-black"
            />

            {/* Correo */}
            <input
              placeholder="Correo"
              type="email"
              {...register("email", { required: true })}
              className="w-full px-4 py-3 rounded-full bg-white/70 outline-none text-black"
            />

            {/* Contraseña */}
            <input
              placeholder="Contraseña"
              type="password"
              {...register("password", { required: true })}
              className="w-full px-4 py-3 rounded-full bg-white/70 outline-none text-black"
            />

            {/* Confirmar contraseña */}
            <input
              placeholder="Confirmar Contraseña"
              type="password"
              {...register("password2", { required: true })}
              className="w-full px-4 py-3 rounded-full bg-white/70 outline-none text-black"
            />

            {/* Botón */}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-4 font-semibold transition mx-auto block"
            >
              Registrarse
            </button>

            {/* Para volver al login */}
            <p className="text-sm text-gray-800">
              ¿Ya tienes cuenta?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                Inicia sesión aquí
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Registre;
